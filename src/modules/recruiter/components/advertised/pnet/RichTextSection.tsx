import styles from './RichTextSection.module.css'

type RichTextSectionProps = {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Body height in px */
  height: number
}

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const TOOLBAR_GROUPS: { label: string; icon: React.ReactNode }[][] = [
  [
    { label: 'Undo', icon: <Icon><path d="M2.5 4.5h5a2.5 2.5 0 010 5H5M2.5 4.5L4.5 2.5M2.5 4.5l2 2" /></Icon> },
    { label: 'Redo', icon: <Icon><path d="M9.5 4.5h-5a2.5 2.5 0 000 5H7M9.5 4.5l-2-2M9.5 4.5l-2 2" /></Icon> },
  ],
  [
    { label: 'Bold', icon: <span className={styles.glyphBold}>B</span> },
    { label: 'Italic', icon: <span className={styles.glyphItalic}>I</span> },
    { label: 'Link', icon: <Icon><path d="M5 7a2 2 0 002.8 0l1.7-1.7a2 2 0 00-2.8-2.8L6.3 3M7 5a2 2 0 00-2.8 0L2.5 6.7a2 2 0 002.8 2.8L5.7 9" /></Icon> },
    { label: 'Strikethrough', icon: <span className={styles.glyphStrike}>S</span> },
  ],
  [
    { label: 'Bulleted list', icon: <Icon><path d="M4.5 3h5M4.5 6h5M4.5 9h5M2 3h.01M2 6h.01M2 9h.01" /></Icon> },
    { label: 'Indent', icon: <Icon><path d="M2 2.5h8M6 5h4M6 7h4M2 9.5h8M2 4.5l1.8 1.5L2 7.5" /></Icon> },
  ],
]

const Toolbar = () => (
  <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
    {TOOLBAR_GROUPS.map((group, index) => (
      <div key={index} className={styles.toolbarGroup}>
        {group.map(({ label, icon }) => (
          <button key={label} type="button" className={styles.toolBtn} aria-label={label}>
            {icon}
          </button>
        ))}
      </div>
    ))}
    <button type="button" className={`${styles.toolBtn} ${styles.fontBtn}`} aria-label="Font size">
      Aa
      <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <path d="M1.5 3l2.5 2.5L6.5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  </div>
)

export const RichTextSection = ({ title, value, onChange, placeholder, height }: RichTextSectionProps) => (
  <section className={styles.section}>
    <header className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <Toolbar />
    </header>
    <textarea
      aria-label={title}
      className={styles.textarea}
      style={{ height }}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </section>
)
