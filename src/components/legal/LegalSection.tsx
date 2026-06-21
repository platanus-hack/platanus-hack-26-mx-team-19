type Props = {
  title: string
  children: React.ReactNode
}

export default function LegalSection({ title, children }: Props) {
  return (
    <section className="section">
      <h2 className="heading">{title}</h2>
      <div className="body">{children}</div>
      <style jsx>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .heading {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--app-text);
        }
        .body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </section>
  )
}
