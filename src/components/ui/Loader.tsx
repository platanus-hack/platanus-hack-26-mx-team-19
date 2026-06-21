type Props = {
  /** Inline / card-sized; default fills the viewport (AuthGuard, etc.). */
  compact?: boolean
  /** Small spinner for tight panels. */
  inline?: boolean
}

export default function Loader({ compact = false, inline = false }: Props) {
  const wrapClass = inline
    ? " loader-wrap--inline"
    : compact
      ? " loader-wrap--compact"
      : ""
  return (
    <div className={`loader-wrap${wrapClass}`}>
      <div className="loader-spinner" aria-hidden />
      <style jsx>{`
        .loader-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
          background: var(--app-bg);
        }
        .loader-wrap--compact {
          min-height: 12rem;
          background: transparent;
        }
        .loader-wrap--inline {
          min-height: 0;
          width: auto;
          background: transparent;
        }
        .loader-spinner {
          width: 2.25rem;
          height: 2.25rem;
          border: 3px solid var(--app-border);
          border-top-color: var(--app-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loader-wrap--compact .loader-spinner {
          width: 1.75rem;
          height: 1.75rem;
          border-width: 2px;
        }
        .loader-wrap--inline .loader-spinner {
          width: 1.25rem;
          height: 1.25rem;
          border-width: 2px;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
