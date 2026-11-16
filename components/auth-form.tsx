"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setMessageType("success");
        setMessage("Account created. Check your email to confirm your address, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-art" aria-label="NicToons Studio introduction">
        <a className="brand" href="/" aria-label="NicToons Studio home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NicToons Studio</span>
        </a>
        <div className="auth-copy">
          <p className="eyebrow">Your stories, brought to life</p>
          <h1>Make something wonderfully animated.</h1>
          <p>
            A creative home for your cartoon ideas, characters, and comedy
            concepts. Start by setting up your studio.
          </p>
          <div className="story-card">
            <div className="story-card-icon" aria-hidden="true">✦</div>
            <div>
              <strong>Your next big story starts here</strong>
              <span>Plan, produce, and share — one step at a time.</span>
            </div>
          </div>
        </div>
        <p className="art-note">A little imagination goes a long way.</p>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow" style={{ color: "var(--purple)" }}>Creator account</p>
        <h2 id="auth-title">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p className="auth-subtitle">
          {mode === "signin"
            ? "Sign in to open your NicToons workspace."
            : "Sign up to save your ideas and set up your studio."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account action">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">Email address</label>
          <input
            className="field-input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="field-label" htmlFor="password">Password</label>
          <input
            className="field-input"
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="At least 8 characters"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {message && (
            <p className={`form-message ${messageType}`} role="status">
              {message}
            </p>
          )}
          <button className="primary-button" type="submit" disabled={!configured || busy}>
            {busy
              ? "Please wait..."
              : mode === "signin"
                ? "Sign in to NicToons"
                : "Create your account"}
          </button>
        </form>

        {!configured && (
          <div className="setup-note" role="status">
            Authentication is not configured yet. Add
            {" "}<code>NEXT_PUBLIC_SUPABASE_URL</code> and
            {" "}<code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your local
            <code> .env.local</code> file, then restart the app.
          </div>
        )}
        <p className="auth-legal">
          Your account is secured by Supabase Authentication. Video generation
          and publishing are not enabled in this foundation phase.
        </p>
      </section>
    </main>
  );
}
