"use client"

import { useCallback, useState } from "react"
import { IoCheckmark, IoChevronForward, IoCopyOutline } from "react-icons/io5"
import { landingContent } from "@/content/landing"
import { AGENTATLAS_AGENT_SETUP_COMMAND, AGENTATLAS_SWARM_SKILL_PUBLIC_URL } from "@/lib/agentatlas-skill"
import styles from "./skill-copy-command.module.css"

export default function SkillCopyCommand() {
  const { skill } = landingContent.hero
  const [copied, setCopied] = useState(false)

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(AGENTATLAS_AGENT_SETUP_COMMAND)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>{skill.hint}</p>
      <div className={styles.shell}>
        <div className={styles.inner}>
          <div className={styles.field}>
            <div className={styles.commandScroll}>
              <IoChevronForward className={styles.chevron} aria-hidden />
              <span className={styles.cursor} aria-hidden />
              <span className={styles.command}>
                <span className={styles.setupWord}>set up</span>{" "}
                <span className={styles.setupUrl}>{AGENTATLAS_SWARM_SKILL_PUBLIC_URL}</span>
              </span>
            </div>
          </div>
          <span className={styles.divider} aria-hidden />
          <button
            type="button"
            className={`${styles.copy}${copied ? ` ${styles.copyDone}` : ""}`}
            onClick={() => void copyCommand()}
            aria-label={copied ? "Copied" : "Copy command"}
          >
            {copied ? (
              <IoCheckmark className={styles.copyIcon} aria-hidden />
            ) : (
              <IoCopyOutline className={styles.copyIcon} aria-hidden />
            )}
          </button>
        </div>
      </div>
      <p className={styles.footerHint}>{skill.footerHint}</p>
    </div>
  )
}
