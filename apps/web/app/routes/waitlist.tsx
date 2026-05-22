import { createRoute } from "@tanstack/react-router";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { CheckboxInput } from "@/components/ui/checkbox-input";
import { FormField } from "@/components/ui/form-field";
import { SelectInput } from "@/components/ui/select-input";
import { TextInput, InputGroup } from "@/components/ui/text-input";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/waitlist",
  component: WaitlistPage,
});

function WaitlistPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    telegram: "",
    following: "",
    interview: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  const [error, setError] = React.useState("");
  const [sending, setSending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
      const res = await fetch(`${apiUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-28">
      <Badge variant="sol">Waitlist</Badge>
      <h1 className="mt-4">
        WAITLIST
        <br />
        <em>SIMPLYVEST</em>
      </h1>
      <p className="max-w-[580px] text-lg leading-relaxed text-muted">
        We help you transfer your money in a safer way &mdash; with commitment from both the sender
        and the receiver.
      </p>

      <div className="mt-12">
        {submitted ? (
          <div className="rounded-xl border border-sol2 bg-gradient-to-br from-sol2/5 to-sol3/5 px-8 py-12 text-center">
            <div className="font-display text-5xl text-sol2">✓</div>
            <h2 className="mt-4 text-2xl font-semibold">You're on the list!</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              We'll notify you when SimplyVest launches. Stay tuned for updates.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-bg1 px-8 py-8"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Your Name" required>
                <TextInput
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </FormField>

              <FormField label="Email" required>
                <TextInput
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </FormField>

              <FormField label="Telegram ID" required>
                <InputGroup
                  prefix="@"
                  type="text"
                  name="telegram"
                  value={form.telegram}
                  onChange={handleChange}
                  required
                  placeholder="username"
                />
              </FormField>

              <FormField label="Following @simplyvestsol on X?">
                <SelectInput name="following" value={form.following} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </SelectInput>
              </FormField>
            </div>

            <div className="mt-6">
              <CheckboxInput
                name="interview"
                checked={form.interview}
                onChange={(checked) => setForm((prev) => ({ ...prev, interview: checked }))}
                label="I'm willing to be contacted for a user interview."
              />
            </div>

            {error && (
              <div className="mt-6 rounded-lg border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
                {error}
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={sending}
                className="rounded-md bg-[#7c3aed] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#6d28d9] focus-visible:ring-2 focus-visible:ring-sol focus-visible:outline-none disabled:opacity-50"
              >
                {sending ? "Submitting..." : "Join Waitlist"}
              </button>
            </div>

            <p className="mt-4 text-xs text-muted">* Required fields</p>
          </form>
        )}
      </div>

      <div className="h-16" />
    </div>
  );
}
