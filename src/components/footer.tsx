import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#111122] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Brand */}
          <div className="text-center">
            <span className="font-serif text-lg font-semibold text-purple">
              ForecastHer
            </span>
            <p className="text-sm text-white/40 mt-1">
              Where women predict what&apos;s next.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link
              href="/markets"
              className="text-white/40 hover:text-purple transition-colors"
            >
              Markets
            </Link>
            <Link
              href="/leaderboard"
              className="text-white/40 hover:text-purple transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/how-it-works"
              className="text-white/40 hover:text-purple transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* Contact */}
          <a
            href="mailto:hello@forcasther.com"
            className="text-purple text-sm hover:text-purple-light transition-colors"
          >
            hello@forcasther.com
          </a>

          {/* Legal */}
          <div className="text-center text-xs text-white/30 space-y-1">
            <p>
              <Link
                href="/privacy.html"
                className="underline hover:text-white/50"
              >
                Privacy Policy
              </Link>
              {" · "}
              <Link
                href="/terms.html"
                className="underline hover:text-white/50"
              >
                Terms of Service
              </Link>
            </p>
            <p>Made with love in Boise, Idaho</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
