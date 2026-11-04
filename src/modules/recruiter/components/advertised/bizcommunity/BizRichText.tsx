import type { ReactNode } from 'react'
import styles from './BizRichText.module.css'

type BizRichTextProps = {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Textarea height in px */
  height: number
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const Chevron = () => (
  <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path d="M1.5 3l2.5 2.5L6.5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type Tool = { label: string; node: ReactNode; muted?: boolean; wide?: boolean }

const GROUPS: Tool[][] = [
  [
    { label: 'Undo', node: <Icon><path d="M3 5.5h5.5a3 3 0 010 6H5M3 5.5L5.5 3M3 5.5L5.5 8" /></Icon> },
    { label: 'Redo', muted: true, node: <Icon><path d="M11 5.5H5.5a3 3 0 000 6H9M11 5.5L8.5 3M11 5.5L8.5 8" /></Icon> },
    { label: 'Bold', node: <span className={styles.bold}>B</span> },
    { label: 'Italic', node: <span className={styles.italic}>I</span> },
    { label: 'Link', node: <Icon><path d="M6 8.3a2.4 2.4 0 003.4 0l2-2a2.4 2.4 0 00-3.4-3.4l-.7.7M8 5.7a2.4 2.4 0 00-3.4 0l-2 2a2.4 2.4 0 003.4 3.4l.7-.7" /></Icon> },
    { label: 'Clear formatting', node: <Icon><path d="M6 2.5h5.5M5 11.5h5M8.7 2.5L6.3 11.5M2 12L12 2" /></Icon> },
    {
      label: 'List style',
      wide: true,
      node: (
        <span className={styles.listTool}>
          <Icon><path d="M5.5 4h6M5.5 7h6M5.5 10h6M2.5 4h.01M2.5 7h.01M2.5 10h.01" /></Icon>
          <Chevron />
        </span>
      ),
    },
  ],
  [
    { label: 'Decrease indent', node: <Icon><path d="M2 3h10M7 6h5M7 8h5M2 11h10M5 5.2L2.6 7 5 8.8" /></Icon> },
    { label: 'Increase indent', node: <Icon><path d="M2 3h10M7 6h5M7 8h5M2 11h10M2.6 5.2L5 7 2.6 8.8" /></Icon> },
  ],
  [
    {
      label: 'Text size',
      wide: true,
      node: (
        <span className={styles.sizeTool}>
          Aa
          <Chevron />
        </span>
      ),
    },
  ],
]

export const BizRichText = ({ title, value, onChange, placeholder, height }: BizRichTextProps) => (
  <div className={styles.block}>
    <h3 className={styles.title}>{title}</h3>
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label={`${title} formatting`}>
        {GROUPS.map((group, index) => (
          <div key={index} className={styles.group}>
            {group.map(({ label, node, muted, wide }) => (
              <button
                key={label}
                type="button"
                className={`${styles.tool} ${wide ? styles.toolWide : ''} ${muted ? styles.toolMuted : ''}`}
                aria-label={label}
              >
                {node}
              </button>
            ))}
          </div>
        ))}
      </div>
      <textarea
        aria-label={title}
        className={styles.textarea}
        style={{ height }}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </div>
)
