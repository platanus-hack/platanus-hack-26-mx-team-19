import type { LandingDirectoryListing } from "@/content/landing"
import styles from "./network-directory.module.css"

type Props = {
  title: string
  status: string
  listings: readonly LandingDirectoryListing[]
}

export default function NetworkDirectoryPreview({ title, status, listings }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <span className={styles.toolbarDot} aria-hidden />
          <span>{title}</span>
        </div>
        <span className={styles.status}>{status}</span>
      </div>
      <ul className={styles.list}>
        {listings.map((row) => (
          <li key={row.name} className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.rowHead}>
                <p className={styles.name}>{row.name}</p>
                <span className={styles.category}>{row.category}</span>
              </div>
              <p className={styles.stat}>{row.stat}</p>
            </div>
            <div className={styles.rowMeta}>
              <span className={styles.rating}>
                <span aria-hidden>★</span> {row.rating}
              </span>
              <span className={styles.price}>{row.price}</span>
              {row.badge ? <span className={styles.badge}>{row.badge}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
