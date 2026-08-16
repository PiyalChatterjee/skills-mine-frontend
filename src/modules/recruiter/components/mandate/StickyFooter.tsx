import styles from './StickyFooter.module.css'

interface Props {
  onCancel: () => void
  isSubmitting: boolean
  submitLabel?: string
}

export const StickyFooter = ({ onCancel, isSubmitting, submitLabel = 'Post Job Post' }: Props) => (
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
        {isSubmitting ? '...' : submitLabel}
      </button>
    </div>
  </footer>
)
