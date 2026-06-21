type Props = {
  text: string
  onClick: () => void
}

export default function GoogleAuthButton({ text, onClick }: Props) {
  return (
    <button className="btn-google" type="button" onClick={onClick}>
      <img
        className="btn-google__icon"
        src="/google-icon.png"
        alt=""
        width={20}
        height={20}
        aria-hidden
      />
      <span>{text}</span>
      <style jsx>{`
        .btn-google {
          width: 100%;
          padding: 0.625rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          font-family: var(--app-font);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--app-text);
          background: var(--app-surface);
          border: 1px solid var(--app-border-strong);
          border-radius: var(--app-radius);
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .btn-google:hover {
          background: var(--app-surface-muted);
          border-color: var(--app-border-strong);
          box-shadow: var(--app-shadow-sm);
        }
        .btn-google__icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          flex-shrink: 0;
        }
      `}</style>
    </button>
  )
}
