import styles from './StickyFooter.module.css'

interface Props {
  onCancel: () => void
  isSubmitting: boolean
}

export const StickyFooter = ({ onCancel, isSubmitting }: Props) => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <button
        type="button"
        className={styles.cancelBtn}
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Posting...' : 'Post Mandate'}
      </button>
    </div>
  </footer>
)
