import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ForecastHer privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="inline-block mb-8 text-sm text-primary/60 hover:text-primary transition-colors"
      >
        &larr; Back to ForecastHer
      </Link>

      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: February 22, 2026
      </p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">Overview</h2>
          <p>
            ForecastHer (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) respects your privacy. This Privacy Policy
            explains how we collect, use, and protect your information when you
            visit forcasther.com and sign up for our waitlist.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Information We Collect
          </h2>
          <p className="mb-3">When you join our waitlist, we collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground">Email address</strong> — to
              notify you about launch updates, early access, and product news.
            </li>
            <li>
              <strong className="text-foreground">Prediction ideas</strong>{" "}
              (optional) — if you choose to submit one via our form.
            </li>
            <li>
              <strong className="text-foreground">Source data</strong> — which
              form you used to sign up (e.g., hero form or footer form).
            </li>
          </ul>
          <p className="mt-3">
            We do not collect payment information, social security numbers, or
            any other sensitive personal data at this time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              To send you launch updates, early access invitations, and product
              announcements.
            </li>
            <li>
              To understand what prediction markets our community is most
              interested in.
            </li>
            <li>To improve our website and product experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Data Storage &amp; Security
          </h2>
          <p>
            Your data is stored securely using Supabase, a trusted cloud
            database provider with enterprise-grade security, including
            encryption at rest and in transit. Access to your data is restricted
            to authorized team members only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Sharing Your Information
          </h2>
          <p>
            We do <strong className="text-foreground">not</strong> sell, trade,
            or share your personal information with third parties. Period. Your
            email stays between us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Your Rights
          </h2>
          <p className="mb-3">You can request to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View the data we have about you</li>
            <li>Delete your data from our waitlist</li>
            <li>Unsubscribe from communications at any time</li>
          </ul>
          <p className="mt-3">
            To make any of these requests, email us at{" "}
            <a
              href="mailto:hello@forcasther.com"
              className="text-primary hover:underline"
            >
              hello@forcasther.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">Cookies</h2>
          <p>
            Our website does not currently use cookies or tracking pixels. If we
            add analytics in the future, we will update this policy accordingly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. Any changes will be
            reflected on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Contact Us
          </h2>
          <p>
            Questions? Reach out at{" "}
            <a
              href="mailto:hello@forcasther.com"
              className="text-primary hover:underline"
            >
              hello@forcasther.com
            </a>
            .
          </p>
          <p className="mt-2">
            ForecastHer is made with love in Boise, Idaho.
          </p>
        </section>
      </div>
    </div>
  );
}
