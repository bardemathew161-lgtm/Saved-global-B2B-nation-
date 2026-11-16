import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="studio-shell">
      <aside className="sidebar">
        <a className="brand" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NicToons Studio</span>
        </a>

        <p className="side-label">Workspace</p>
        <nav className="side-nav" aria-label="Studio navigation">
          <a className="side-link active" href="/dashboard" aria-current="page">
            <span className="side-icon" aria-hidden="true">⌂</span>
            Dashboard
          </a>
          <span className="side-link disabled" aria-disabled="true">
            <span className="side-icon" aria-hidden="true">▣</span>
            My videos <span className="coming-soon">Soon</span>
          </span>
          <span className="side-link disabled" aria-disabled="true">
            <span className="side-icon" aria-hidden="true">♫</span>
            Audio library <span className="coming-soon">Soon</span>
          </span>
        </nav>

        <div className="sidebar-bottom">
          <div className="phase-card">
            <strong>Studio foundation</strong>
            <p>Secure sign-in is ready. Video creation is planned for the next phase.</p>
          </div>
          <div className="profile-row">
            <span className="avatar" aria-hidden="true">{initial}</span>
            <div className="profile-details">
              <strong>{displayName}</strong>
              <span>{user.email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <section className="studio-main">
        <header className="topbar">
          <div className="breadcrumb">Studio <span aria-hidden="true">/</span> <strong>Dashboard</strong></div>
          <span className="topbar-badge"><span className="status-dot" /> Foundation phase</span>
        </header>

        <div className="welcome-section">
          <div>
            <p className="eyebrow">Your creative workspace</p>
            <h1>Good to have you here, {displayName}.</h1>
            <p>Your NicToons studio is set up and ready for its next chapter.</p>
          </div>
          <span className="stage-badge">Phase 1 · Dashboard &amp; authentication</span>
        </div>

        <div className="metric-grid" aria-label="Studio overview">
          <article className="metric-card">
            <span className="metric-title">Projects</span>
            <div className="metric-value">0 <span>created</span></div>
          </article>
          <article className="metric-card">
            <span className="metric-title">Videos generated</span>
            <div className="metric-value">0 <span>in your studio</span></div>
          </article>
          <article className="metric-card">
            <span className="metric-title">Connected channels</span>
            <div className="metric-value">0 <span>accounts</span></div>
          </article>
        </div>

        <div className="studio-grid">
          <section className="panel-card" aria-labelledby="projects-title">
            <div className="panel-heading">
              <div>
                <h2 id="projects-title">Your projects</h2>
                <p>Your saved productions will appear here.</p>
              </div>
            </div>
            <div className="video-empty">
              <div>
                <div className="empty-art" aria-hidden="true">✦</div>
                <h3>Your story space is ready</h3>
                <p>AI video creation will be added in the next development phase. Nothing is generated until a real provider is connected.</p>
              </div>
            </div>
          </section>

          <section className="panel-card" aria-labelledby="workflow-title">
            <div className="panel-heading">
              <div>
                <h2 id="workflow-title">Production journey</h2>
                <p>What we are building, step by step.</p>
              </div>
            </div>
            <div className="workflow-list">
              <div className="workflow-step">
                <span className="step-number">1</span>
                <div><strong>Studio &amp; secure access</strong><p>In progress — your account is active.</p></div>
              </div>
              <div className="workflow-step">
                <span className="step-number">2</span>
                <div><strong>AI video generation</strong><p>Next — requires a selected video API.</p></div>
              </div>
              <div className="workflow-step">
                <span className="step-number">3</span>
                <div><strong>YouTube publishing</strong><p>Later — connect and approve your channel.</p></div>
              </div>
            </div>
          </section>
        </div>

        <aside className="phase-banner">
          <span className="phase-banner-icon" aria-hidden="true">i</span>
          <div>
            <strong>Foundation first. No mock integrations.</strong>
            <p>This dashboard currently provides authenticated access only. AI generation, audio, subtitles, downloads, and social publishing are not active yet.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
