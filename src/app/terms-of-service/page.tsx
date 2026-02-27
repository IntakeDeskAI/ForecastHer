import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "ForecastHer terms of service — rules and guidelines for using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="inline-block mb-8 text-sm text-primary/60 hover:text-primary transition-colors"
      >
        &larr; Back to ForecastHer
      </Link>

      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: February 24, 2026
      </p>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Agreement to Terms
          </h2>
          <p>
            By accessing or using the ForecastHer website at forecasther.ai
            (&ldquo;the Site&rdquo;), you agree to be bound by these Terms of
            Service. If you do not agree with any part of these terms, please do
            not use the Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Description of Service
          </h2>
          <p>
            ForecastHer is a prediction marketplace built for women. We are
            currently in a pre-launch phase, collecting waitlist signups and
            community interest. The full marketplace product is not yet
            available. Features described on the Site represent our planned
            offering and are subject to change.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Waitlist &amp; Communications
          </h2>
          <p className="mb-3">
            By joining our waitlist, you agree to receive occasional emails from
            ForecastHer regarding:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Launch updates and early access invitations</li>
            <li>Product announcements and new features</li>
            <li>Community news related to our prediction markets</li>
          </ul>
          <p className="mt-3">
            You may unsubscribe from these communications at any time by
            emailing{" "}
            <a
              href="mailto:hello@forecasther.ai"
              className="text-primary hover:underline"
            >
              hello@forecasther.ai
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            User Conduct
          </h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Submit false, misleading, or spam information through our forms
            </li>
            <li>
              Attempt to interfere with or disrupt the Site&apos;s functionality
            </li>
            <li>
              Use automated tools to scrape or collect data from the Site
            </li>
            <li>
              Violate any applicable local, state, national, or international
              law
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Intellectual Property
          </h2>
          <p>
            All content on the Site — including text, graphics, logos, design
            elements, and code — is the property of ForecastHer and is protected
            by copyright and trademark laws. You may not reproduce, distribute,
            or create derivative works without our written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Disclaimer
          </h2>
          <p>
            The Site is provided &ldquo;as is&rdquo; without warranties of any
            kind, express or implied. ForecastHer does not guarantee that the
            Site will be uninterrupted, error-free, or free of harmful
            components. Market predictions displayed are illustrative examples
            and do not constitute financial advice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, ForecastHer shall not be
            liable for any indirect, incidental, special, or consequential
            damages arising from your use of the Site or reliance on any
            information provided.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Changes to These Terms
          </h2>
          <p>
            We reserve the right to update these Terms of Service at any time.
            Changes will be posted on this page with an updated date. Continued
            use of the Site after changes constitutes acceptance of the revised
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Contact Us
          </h2>
          <p>
            Questions about these terms? Reach out at{" "}
            <a
              href="mailto:hello@forecasther.ai"
              className="text-primary hover:underline"
            >
              hello@forecasther.ai
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
