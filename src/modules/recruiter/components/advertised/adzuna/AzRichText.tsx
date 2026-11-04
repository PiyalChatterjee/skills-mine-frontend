import type { ReactNode } from 'react'
import styles from './AzRichText.module.css'

type ToolId = 'undo' | 'redo' | 'bold' | 'italic' | 'underline' | 'ul' | 'ol' | 'link' | 'bodyText'

/** Toolbar groups per editor variant, matching the three editors in the design. */
const VARIANTS: Record<'full' | 'compact' | 'minimal', ToolId[][]> = {
  full: [['undo', 'redo'], ['bold', 'italic', 'underline'], ['ul', 'ol', 'link'], ['bodyText']],
  compact: [['bold', 'italic', 'ul', 'link']],
  minimal: [['bold', 'italic', 'ul']],
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const TOOLS: Record<ToolId, { label: string; node: ReactNode }> = {
  undo: { label: 'Undo', node: <Icon><path d="M2.5 4.5h5a2.5 2.5 0 010 5H5M2.5 4.5L4.5 2.5M2.5 4.5l2 2" /></Icon> },
  redo: { label: 'Redo', node: <Icon><path d="M9.5 4.5h-5a2.5 2.5 0 000 5H7M9.5 4.5l-2-2M9.5 4.5l-2 2" /></Icon> },
  bold: { label: 'Bold', node: <span className={styles.bold}>B</span> },
  italic: { label: 'Italic', node: <span className={styles.italic}>I</span> },
  underline: { label: 'Underline', node: <span className={styles.underline}>U</span> },
  ul: { label: 'Bulleted list', node: <Icon><path d="M4.5 3h5M4.5 6h5M4.5 9h5M2 3h.01M2 6h.01M2 9h.01" /></Icon> },
  ol: { label: 'Numbered list', node: <Icon><path d="M5 3h5M5 6h5M5 9h5M1.8 2.4l.7-.4v2M1.7 6.6c0-.5 1-.5 1 0s-1 .9-1 1.4h1M1.7 9.4h1l-.5.6c.4 0 .6.2.6.5s-.4.6-1.1.4" /></Icon> },
  link: { label: 'Link', node: <Icon><path d="M5 7a2 2 0 002.8 0l1.7-1.7a2 2 0 00-2.8-2.8L6.3 3M7 5a2 2 0 00-2.8 0L2.5 6.7a2 2 0 002.8 2.8L5.7 9" /></Icon> },
  bodyText: { label: 'Text style', node: <span className={styles.bodyText}>Body Text</span> },
}

type AzRichTextProps = {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  variant: keyof typeof VARIANTS
  /** Textarea height in px */
  height: number
}

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

export const AzRichText = ({ label, required, value, onChange, variant, height }: AzRichTextProps) => (
  <div className={styles.block}>
    <div className={styles.head}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </span>
      <span className={styles.count}>{countWords(value)} words</span>
    </div>
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`}>
        {VARIANTS[variant].map((group, index) => (
          <div key={index} className={styles.group}>
            {group.map((id) => (
              <button
                key={id}
                type="button"
                className={`${styles.tool} ${id === 'bodyText' ? styles.toolText : ''}`}
                aria-label={TOOLS[id].label}
              >
                {TOOLS[id].node}
              </button>
            ))}
          </div>
        ))}
      </div>
      <textarea
        aria-label={label}
        className={styles.textarea}
        style={{ height }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </div>
)
