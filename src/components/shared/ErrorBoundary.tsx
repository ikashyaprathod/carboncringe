/**
 * React Error Boundary — catches render errors and shows a glass-styled fallback.
 * Required as a class component per React's error boundary API.
 */

"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ErrorBoundary — catches errors in the component tree below it.
 * Shows a glass-styled fallback UI with a reset button.
 * Wrap sections of the UI that might fail (e.g., charts, AI components).
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="glass-card p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-3xl mb-3">😬</div>
          <p className="text-[var(--color-text)] font-heading font-semibold mb-1">
            something broke ngl
          </p>
          <p className="text-[var(--color-text-secondary)] text-sm mb-4">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-primary-glow px-4 py-2 text-sm font-semibold"
          >
            try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
