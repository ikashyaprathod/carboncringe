/**
 * Premium Footer with copyright and social media links.
 * Hidden on /chat to prevent overflow on the full-height chat layout.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Chat page uses a full-viewport flex layout — footer would cause overflow
  if (pathname === "/chat") return null;

  return (
    <footer className="mt-auto w-full border-t border-[var(--glass-border)] bg-[#0B0F0D]/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Copyright */}
        <p className="text-[var(--color-text-secondary)] text-[13px] leading-relaxed text-center sm:text-left">
          © 2026 CarbonCringe. All Rights Reserved by{" "}
          <Link
            href="https://kashyap.wtf/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text)] font-semibold hover:text-[var(--color-primary)] transition-colors duration-200"
          >
            Kashyap Rathod
          </Link>
          .
        </p>

        {/* Right: Social Icons */}
        <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
          {/* GitHub */}
          <Link
            href="https://github.com/ikashyaprathod"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="hover:text-[var(--color-primary)] transition-colors duration-200"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
            </svg>
          </Link>

          {/* LinkedIn */}
          <Link
            href="https://www.linkedin.com/in/kashyaprathod/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="hover:text-[var(--color-primary)] transition-colors duration-200"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </Link>

          {/* Twitter / X */}
          <Link
            href="https://x.com/ikashyaprathod"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter Profile"
            className="hover:text-[var(--color-primary)] transition-colors duration-200"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>

          {/* Reddit */}
          <Link
            href="https://www.reddit.com/user/ikashyaprathod/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Reddit Profile"
            className="hover:text-[var(--color-primary)] transition-colors duration-200"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.05-4.79 3.42.77c.06.94.84 1.7 1.8 1.7 1.01 0 1.83-.82 1.83-1.83s-.82-1.83-1.83-1.83c-.85 0-1.57.58-1.77 1.38l-3.83-.87c-.24-.06-.48.08-.54.32l-1.2 5.48c-2.45.06-4.72.7-6.38 1.72-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.12.61 2.1 1.53 2.62-.05.29-.08.59-.08.88 0 3.86 4.43 7 9.88 7s9.88-3.14 9.88-7c0-.29-.03-.59-.08-.88.92-.52 1.53-1.5 1.53-2.62zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm11 4.5c-1.64 1.64-4.75 1.64-6.39 0-.1-.1-.1-.27 0-.37.1-.1.27-.1.37 0 1.43 1.43 4.22 1.43 5.65 0 .1-.1.27-.1.37 0 .1.1.1.27 0 .37zm-.5-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </Link>
        </div>

      </div>
    </footer>
  );
}
