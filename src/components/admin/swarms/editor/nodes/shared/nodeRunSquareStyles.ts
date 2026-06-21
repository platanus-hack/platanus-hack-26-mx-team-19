/** Shared styled-jsx fragment for canvas node squares during Test Swarm runs. */
export const NODE_RUN_SQUARE_STYLES = `
  .square--run-running {
    animation: node-run-pulse 1.2s ease-in-out infinite;
  }
  .square--run-done {
    box-shadow: 0 0 0 2px color-mix(in srgb, #16a34a 35%, transparent);
  }
  .square--run-skipped {
    opacity: 0.42;
    filter: grayscale(0.35);
  }
  .square--run-waiting {
    animation: node-run-pulse 1.6s ease-in-out infinite;
  }
  @keyframes node-run-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--app-text) 12%, transparent);
    }
    50% {
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--app-text) 8%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .square--run-running,
    .square--run-waiting {
      animation: none;
    }
  }
`
