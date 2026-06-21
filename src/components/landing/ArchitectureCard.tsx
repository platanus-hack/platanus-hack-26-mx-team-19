import type { LandingArchitecture } from "@/content/landing"
import ArchitectureDiagram from "./ArchitectureDiagram"
import styles from "./architecture-card.module.css"

type Props = {
  architecture: LandingArchitecture
}

export default function ArchitectureCard({ architecture }: Props) {
  return (
    <article className={styles.card}>
      <ArchitectureDiagram topology={architecture.topology} />
      <div className={styles.body}>
        <div className={styles.head}>
          <div>
            <h3 className={styles.name}>{architecture.name}</h3>
            <p className={styles.category}>{architecture.category}</p>
          </div>
          {architecture.badge ? <span className={styles.badge}>{architecture.badge}</span> : null}
        </div>
        <p className={styles.description}>{architecture.description}</p>
      </div>
    </article>
  )
}
