"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AuthGate({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();
  const updateUserProfile = useMutation(api.users.updateUserProfile);
  const getUser = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );

  useEffect(() => {
    if (session?.user?.id && getUser === null) {
      // Set default role for new users (Better Auth handles user creation)
      updateUserProfile({
        userId: session.user.id,
        role: "customer",
        plan: "free",
      }).catch(() => {});
    }
  }, [session?.user?.id, getUser, updateUserProfile]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">Loading session…</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "agent">("customer");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return;
    setFormError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const res = await fetch(`/api/auth/sign-in/email`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw data;
        }
        (authClient as any).$store.notify("$sessionSignal");
      } else {
        const res = await fetch(`/api/auth/sign-up/email`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email: normalizedEmail, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw data;
        }
        // Better Auth handles user creation, we'll set the profile after sign-up
        // Profile will be set via the useEffect above when session is established
        (authClient as any).$store.notify("$sessionSignal");
      }
    } catch (err: any) {
      const code = err?.data?.code || err?.code;
      const message = err?.data?.message || err?.message || "Authentication failed";
      setFormError(`${code ? code + ": " : ""}${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "signin" ? "Sign in" : "Create your account"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
              {formError}
            </div>
          )}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full px-3 py-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
              </select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


