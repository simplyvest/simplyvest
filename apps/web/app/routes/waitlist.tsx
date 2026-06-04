import { createRoute } from "@tanstack/react-router";
import * as React from "react";
import { LuSend, LuCircleCheck } from "react-icons/lu";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";
import { Select } from "@/components/ui/select";
import { trackEvent } from "@/utils/analytics";

import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/waitlist",
  component: WaitlistPage,
});

interface FormData {
  name: string;
  email: string;
  telegram: string;
  following: string;
  interview: boolean;
}

function WaitlistPage() {
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    email: "",
    telegram: "",
    following: "",
    interview: false,
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sending, setSending] = React.useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
      const res = await fetch(`${apiUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }

      setSubmitted(true);
      trackEvent("waitlist_signup", "engagement", formData.email, undefined, {
        name: formData.name,
        telegram: formData.telegram,
        following_x: formData.following || "no",
        interview_willing: formData.interview ? "yes" : "no",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      <section className="relative overflow-hidden px-6 py-32">
        {/* Decorative background */}
        <SectionDecorations>
          <BlobBlob className="absolute -left-32 top-20 h-96 w-96 bg-purple-300 opacity-5 dark:bg-purple-700" />
          <BlobBlob className="absolute -right-24 top-1/2 h-80 w-80 bg-purple-400 opacity-5 dark:bg-purple-600" />
          <BlobBlob className="absolute bottom-10 left-1/3 h-64 w-64 bg-purple-200 opacity-5 dark:bg-purple-800" />
          <div className="absolute left-10 top-1/3 h-48 w-48 rotate-45 rounded-3xl border border-purple-300 opacity-5 dark:border-purple-700" />
          <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rotate-12 rounded-2xl border border-purple-400 opacity-5 dark:border-purple-600" />
        </SectionDecorations>

        <div className="relative mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-purple-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              Waitlist
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-slate-100">
              Waitlist SimplyVest
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-gray-500 dark:text-slate-400">
              We help you transfer your money in a safer way — with commitment from both the sender
              and the receiver.
            </p>
          </div>

          {/* Form card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-400 to-purple-600 opacity-20 blur-lg dark:from-purple-600 dark:to-purple-800" />
            <div className="relative rounded-3xl border border-gray-100 bg-white p-10 shadow-lg md:p-12 dark:border-slate-700 dark:bg-slate-900">
              {submitted ? (
                <div className="py-8 text-center">
                  <LuCircleCheck className="mx-auto h-16 w-16 text-green-500" />
                  <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-slate-100">
                    You&apos;re on the list!
                  </h2>
                  <p className="mt-2 text-gray-500 dark:text-slate-400">
                    Thank you for signing up. We&apos;ll reach out to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <Field label="Your Name" required>
                    <Input
                      name="name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Field>

                  {/* Email */}
                  <Field label="Email" required>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Field>

                  {/* Telegram ID */}
                  <Field label="Telegram ID" required>
                    <Input
                      name="telegram"
                      type="text"
                      required
                      placeholder="@yourtelegramid"
                      value={formData.telegram}
                      onChange={handleChange}
                    />
                  </Field>

                  {/* Following on X */}
                  <Field label="Following @simplyvestsol on X?">
                    <Select name="following" value={formData.following} onChange={handleChange}>
                      <option value="">Select an option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="will-follow">I will follow now</option>
                    </Select>
                  </Field>

                  {/* Willing to interview */}
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-950">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        name="interview"
                        type="checkbox"
                        checked={formData.interview}
                        onChange={handleChange}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-slate-500 dark:text-purple-400 dark:focus:ring-purple-400"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-200">
                        I&apos;m willing to be contacted for a user interview.
                      </span>
                    </label>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-xl hover:shadow-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:from-purple-500 dark:to-purple-600 dark:shadow-purple-900 dark:hover:from-purple-600 dark:hover:to-purple-700 dark:hover:shadow-purple-800 dark:focus:ring-purple-400"
                  >
                    {sending ? "Submitting..." : "Join Waitlist"}
                    <LuSend className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Privacy note */}
          <p className="mt-8 text-center text-sm leading-relaxed text-gray-400 dark:text-slate-500">
            We respect your privacy. Your information will only be used to contact you about
            SimplyVest. We will never share your data with third parties.
          </p>
        </div>
      </section>
    </div>
  );
}
