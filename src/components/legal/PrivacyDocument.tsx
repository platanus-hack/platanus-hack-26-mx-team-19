"use client"

import LegalDocumentShell from "@/components/legal/LegalDocumentShell"
import LegalSection from "@/components/legal/LegalSection"
import { useMessages } from "@/i18n/client"

export default function PrivacyDocument() {
  const t = useMessages().legalPrivacy

  return (
    <LegalDocumentShell title={t.title} eyebrow={t.eyebrow}>
      <p className="updated">{t.lastUpdated}</p>

      <LegalSection title={t.s1Title}>
        <p>{t.s1p1}</p>
        <p>{t.s1p2}</p>
      </LegalSection>

      <LegalSection title={t.s2Title}>
        <p>{t.s2p1}</p>
        <ul>
          <li>{t.s2li1}</li>
          <li>{t.s2li2}</li>
          <li>{t.s2li3}</li>
          <li>{t.s2li4}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t.googleTitle}>
        <p>{t.googleP1}</p>
        <p>{t.googleP2}</p>
        <p>{t.googleP3}</p>
      </LegalSection>

      <LegalSection title={t.s3Title}>
        <p>{t.s3p1}</p>
        <p>{t.s3p2}</p>
      </LegalSection>

      <LegalSection title={t.s4Title}>
        <p>{t.s4p1}</p>
        <p>{t.s4p2}</p>
      </LegalSection>

      <LegalSection title={t.s5Title}>
        <p>{t.s5p1}</p>
      </LegalSection>

      <LegalSection title={t.s6Title}>
        <p>{t.s6p1}</p>
        <p>{t.s6p2}</p>
      </LegalSection>

      <LegalSection title={t.s7Title}>
        <p>{t.s7p1}</p>
      </LegalSection>

      <LegalSection title={t.s8Title}>
        <p>{t.s8p1}</p>
      </LegalSection>

      <style jsx>{`
        .updated {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--app-text-faint);
        }
      `}</style>
    </LegalDocumentShell>
  )
}
