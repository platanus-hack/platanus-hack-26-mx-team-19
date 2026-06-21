type Props = {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  /** Primary CTA; default is neutral secondary. */
  variant?: "default" | "primary"
}

export default function Button({
  children,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  variant = "default",
}: Props) {
  const variantClass = variant === "primary" ? "btn--primary" : "btn--secondary"
  return (
    <button
      className={`btn ${variantClass} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <span className="btn__loading">
          <span className="btn__spinner" aria-hidden />
          {children}
        </span>
      ) : (
        children
      )}
      <style jsx>{`
        .btn {
          width: 100%;
          padding: 0.625rem 1rem;
          margin-top: 0.25rem;
          font-family: var(--app-font);
          font-size: 0.9375rem;
          font-weight: var(--app-btn-font-weight);
          line-height: 1.25;
          letter-spacing: var(--app-btn-letter-spacing);
          border-radius: var(--app-btn-radius);
          cursor: pointer;
          transition: var(--app-btn-transition);
        }
        .btn:focus-visible {
          outline: none;
          box-shadow: var(--app-btn-focus-ring);
        }
        .btn:active:not(:disabled) {
          transform: translateY(0.5px);
        }
        .btn--secondary {
          background: var(--app-btn-secondary-bg);
          color: var(--app-text);
          border: 1px solid var(--app-btn-secondary-border);
          box-shadow: var(--app-shadow-sm);
        }
        .btn--secondary:hover:not(:disabled) {
          background: var(--app-btn-secondary-bg-hover);
          border-color: var(--app-btn-secondary-border-hover);
        }
        .btn--primary {
          margin-top: 0.5rem;
          background: var(--app-btn-primary-bg);
          color: var(--app-btn-primary-fg);
          border: 1px solid var(--app-btn-primary-border);
          box-shadow: var(--app-btn-primary-shadow);
        }
        .btn--primary:hover:not(:disabled) {
          background: var(--app-btn-primary-bg-hover);
          border-color: var(--app-btn-primary-bg-hover);
          box-shadow: var(--app-btn-primary-shadow-hover);
        }
        .btn--primary:active:not(:disabled) {
          background: var(--app-btn-primary-bg-active);
          border-color: var(--app-btn-primary-bg-active);
          box-shadow: none;
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn__spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          opacity: 0.85;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  )
}
