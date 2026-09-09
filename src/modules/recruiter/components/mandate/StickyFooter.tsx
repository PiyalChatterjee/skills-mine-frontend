import styles from './StickyFooter.module.css'

interface Props {
  isSubmitting: boolean
  submitLabel?: string
  isValid?: boolean
}

export const StickyFooter = ({ isSubmitting, submitLabel = 'Post Job Post', isValid = false }: Props) => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? '...' : submitLabel}
      </button>
    </div>
  </footer>
)
