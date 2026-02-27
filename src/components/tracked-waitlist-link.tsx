"use client";

import { trackWaitlistCtaClick } from "@/lib/analytics";

/** A client wrapper that fires a GA4 event when the user clicks a waitlist CTA. */
export function TrackedWaitlistLink({
  location,
  href,
  children,
  className,
}: {
  location: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackWaitlistCtaClick(location)}
    >
      {children}
    </a>
  );
}
