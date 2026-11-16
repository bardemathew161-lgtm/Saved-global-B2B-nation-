# Volume 10 – Deployment & Operations

## 1. Release Workflow
- CI/CD pipeline with automated testing and artifact promotion
- Environments for development, staging, and production
- Blue-green and canary deployment strategy

## 2. Platform Runtime
- Dockerized service containers
- Kubernetes-based orchestration
- Managed cloud services for observability and resilience

## 3. Operations Readiness
- Monitoring of service health, latency, and transaction failure
- Centralized alerting and on-call escalation
- Backup schedules and restoration drills

## 4. Cloudflare Origin Access Runbook

The origin must accept web traffic only from Cloudflare and private administration
networks. Do not copy an IP list into the firewall permanently: Cloudflare changes
its published ranges, so the allowlist must be refreshed from the official source.

### 4.1 DNS and TLS verification

Set the public `A`/`AAAA` record for the production hostname to the origin address
and enable the orange-cloud proxy in Cloudflare. Keep the origin address private;
do not publish it in application code, documentation, or an unproxied DNS record.

Run these checks after every DNS or certificate change:

```bash
DOMAIN=app.example.com

# Public DNS should resolve to Cloudflare addresses, not the origin address.
dig +short A "$DOMAIN"
dig +short AAAA "$DOMAIN"

# Confirm the proxy answers with the expected hostname and certificate.
curl -sS -I "https://$DOMAIN/"
curl -sS -o /dev/null -w '%{http_code} %{remote_ip}\n' "https://$DOMAIN/"

# Check authoritative nameservers and DNSSEC status when enabled.
dig +short NS example.com
dig +short DS example.com
```

Use Cloudflare SSL/TLS mode **Full (strict)** with a valid origin certificate.
Redirect HTTP to HTTPS at the edge and at the origin, and verify that the origin
does not serve the application directly when accessed by its public IP.

### 4.2 Firewall allowlist

Fetch the current Cloudflare IPv4 and IPv6 ranges from
`https://www.cloudflare.com/ips/`, review the change, then update the firewall
atomically. The following example is for UFW and preserves SSH access through a
separate trusted administration CIDR:

```bash
# Replace these before running. Never use 0.0.0.0/0 for the web rules.
ADMIN_CIDR=203.0.113.10/32
ORIGIN_SSH_PORT=22

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from "$ADMIN_CIDR" to any port "$ORIGIN_SSH_PORT" proto tcp

for range in $(curl -fsSL https://www.cloudflare.com/ips-v4); do
	sudo ufw allow from "$range" to any port 80 proto tcp
	sudo ufw allow from "$range" to any port 443 proto tcp
done
for range in $(curl -fsSL https://www.cloudflare.com/ips-v6); do
	sudo ufw allow from "$range" to any port 80 proto tcp
	sudo ufw allow from "$range" to any port 443 proto tcp
done

sudo ufw --force enable
sudo ufw status numbered
```

Apply the same policy in the cloud security group or network firewall. Allow
health checks only from their documented source ranges, and restrict application
ports, databases, metrics, and SSH to private networks or the administration
CIDR. Review and refresh the Cloudflare ranges at least weekly and after a
Cloudflare range-change notification. Test the resulting policy from both a
Cloudflare request and a blocked non-Cloudflare source before closing the change.

### 4.3 Resource and process health

Capture a baseline before changing limits, then alert before exhaustion rather
than waiting for an outage:

```bash
uptime
free -h
df -hT
df -ih
top -b -n 1 | head -n 25
systemctl --failed
ss -s
```

Alert at 80% filesystem usage, 80% memory usage, sustained load above the
available CPU count, and any restart loop. Confirm that logs are rotated and
that the service has a bounded memory limit. For a systemd service, use:

```ini
[Service]
Restart=always
RestartSec=5s
TimeoutStartSec=60s
TimeoutStopSec=30s
MemoryMax=1G
LimitNOFILE=65536
```

Choose `MemoryMax` from measured workload and host capacity; `1G` is an example,
not a universal production value.

### 4.4 Keep-alive and health checks

Enable connection reuse at the reverse proxy and application, but keep idle
timeouts finite so dead clients do not consume workers. For Nginx:

```nginx
keepalive_timeout 65s;
keepalive_requests 1000;
proxy_http_version 1.1;
proxy_set_header Connection "";
proxy_read_timeout 60s;
```

Expose an unauthenticated, inexpensive `/healthz` endpoint that returns `200`
only when the process is running. Use a separate readiness check for database,
queue, and dependency availability. Configure Cloudflare or the load balancer to
probe readiness, and restart or remove an instance after consecutive failures.
Keep-alive does not replace health checks, process supervision, backups, or
capacity planning.

### 4.5 Change verification checklist

- [ ] DNS `A`/`AAAA` records are proxied and return Cloudflare addresses.
- [ ] SSL/TLS is **Full (strict)** and the origin certificate is valid.
- [ ] Origin ports 80/443 allow only current Cloudflare ranges.
- [ ] SSH, databases, metrics, and admin endpoints are private or allowlisted.
- [ ] `/healthz` and readiness probes pass through the intended path.
- [ ] CPU, memory, disk, inode, restart, and certificate-expiry alerts fire in staging.
- [ ] A non-Cloudflare direct-origin request is blocked.
- [ ] Keep-alive settings are active and connection counts remain bounded.
