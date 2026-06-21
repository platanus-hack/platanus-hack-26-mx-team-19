type Props = {
  children: React.ReactNode
  narrow?: boolean
  className?: string
}

export default function LandingContainer({ children, narrow = false, className = "" }: Props) {
  const rootClass = ["container", narrow ? "container--narrow" : "", className].filter(Boolean).join(" ")

  return (
    <div className={rootClass}>
      {children}
      <style jsx>{`
        .container {
          width: 100%;
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .container--narrow {
          max-width: 44rem;
        }
      `}</style>
    </div>
  )
}
