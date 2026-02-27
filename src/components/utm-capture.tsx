"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUtmParams } from "@/lib/analytics";
import { Suspense } from "react";

function UtmCaptureInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmParams();
  }, [searchParams]);

  return null;
}

/** Captures UTM params from URL into a first-party cookie on every navigation. */
export function UtmCapture() {
  return (
    <Suspense fallback={null}>
      <UtmCaptureInner />
    </Suspense>
  );
}
