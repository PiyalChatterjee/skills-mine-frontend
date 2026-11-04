import styles from './DittoFooter.module.css'

type DittoFooterProps = {
  onBack: () => void
}

const SendIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M11 1L1 5.2l3.4 1.4L5.8 10 11 1z" />
  </svg>
)

export const DittoFooter = ({ onBack }: DittoFooterProps) => (
  <footer className={styles.footer}>
    <p className={styles.copyright}>
      © 2026 Ditto Hire | Thank you for using Ditto Hire! Please email issues to{' '}
      <span className={styles.copyrightEmail}>support@dittohire.com</span>
    </p>
    <div className={styles.actions}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        Back
      </button>
      <button type="button" className={styles.publishBtn}>
        <SendIcon />
        Publish to PNet
      </button>
      <span className={styles.legal}>Terms of Service</span>
      <span className={styles.legalSep} />
      <span className={styles.legal}>Privacy Policy</span>
    </div>
  </footer>
)
