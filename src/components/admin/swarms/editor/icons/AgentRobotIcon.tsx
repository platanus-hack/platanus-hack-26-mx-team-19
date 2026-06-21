type AgentRobotIconProps = {
  size?: number
  className?: string
  /** Pause blink until the nearest `.agent-robot-blink-host` is hovered or selected. */
  blinkOnHover?: boolean
}

const HEAD_PATH = "M9 6h6a6 6 0 0 1 6 6 6 6 0 0 1-6 6H9a6 6 0 0 1-6-6 6 6 0 0 1 6-6z"

/** Minimal robot head (full pill + eyes). Uses `currentColor` and `--agent-robot-eye-fill` for theming. */
export default function AgentRobotIcon({
  size = 24,
  className,
  blinkOnHover = false,
}: AgentRobotIconProps) {
  const rootClass = [
    "agent-robot-icon",
    blinkOnHover ? "agent-robot-icon--hover-blink" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={rootClass}
        aria-hidden
      >
        <path className="agent-robot-head" fill="currentColor" d={HEAD_PATH} />
        <circle className="agent-robot-eye" cx={8} cy={14} r={2.25} />
        <circle className="agent-robot-eye" cx={16} cy={14} r={2.25} />
      </svg>
      <style jsx>{`
        .agent-robot-icon {
          display: block;
          flex-shrink: 0;
        }
        .agent-robot-eye {
          fill: var(--agent-robot-eye-fill);
          transform-box: fill-box;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: no-preference) {
          .agent-robot-eye {
            animation: agent-robot-blink 5.5s ease-in-out infinite;
            animation-play-state: running;
          }
          .agent-robot-icon--hover-blink .agent-robot-eye {
            animation-play-state: paused;
          }
          :global(.agent-robot-blink-host:hover) .agent-robot-icon--hover-blink .agent-robot-eye,
          :global(.agent-robot-blink-host.agent-node--on) .agent-robot-icon--hover-blink .agent-robot-eye {
            animation-play-state: running;
          }
        }
        @keyframes agent-robot-blink {
          0%,
          42%,
          44%,
          100% {
            transform: scaleY(1);
          }
          43% {
            transform: scaleY(0.08);
          }
        }
      `}</style>
    </>
  )
}
