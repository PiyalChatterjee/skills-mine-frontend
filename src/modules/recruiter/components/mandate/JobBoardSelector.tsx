import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
}

const JOB_BOARDS = ['All', 'LinkedIn', 'Indeed', 'Glassdoor', 'Careers24', 'PNet'] as const
type JobBoard = typeof JOB_BOARDS[number]

const BOARD_URLS: Partial<Record<JobBoard, string>> = {
  LinkedIn:  'https://www.linkedin.com/jobs/',
  Indeed:    'https://www.indeed.com/',
  Glassdoor: 'https://www.glassdoor.com/Job/index.htm',
  Careers24: 'https://www.careers24.com/',
  PNet:      'https://www.pnet.co.za/',
}

const BOARD_LOGOS: Record<JobBoard, React.ReactNode> = {
  All: (
    <span style={{ color: '#2164f3', fontWeight: 700, fontSize: 15 }}>All</span>
  ),

  /* LinkedIn — "Linked" in black + blue "in" square box, matching Figma screenshot */
  LinkedIn: (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#000000', letterSpacing: '-0.2px' }}>Linked</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#0A66C2', borderRadius: 2,
        width: 17, height: 17, marginLeft: 1, flexShrink: 0,
        fontWeight: 900, fontSize: 12, color: '#ffffff',
        letterSpacing: '-0.5px',
      }}>in</span>
    </span>
  ),

  /* Indeed — blue arc/hook over the "i", matching Figma screenshot */
  Indeed: (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg width="52" height="20" viewBox="0 0 52 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="indeed">
        {/* arc over the 'i' dot */}
        <path d="M4 7.5 Q6.5 1.5 9 7.5" stroke="#2164f3" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* dot of i */}
        <circle cx="6.5" cy="4.5" r="1.4" fill="#2164f3"/>
        {/* "indeed" wordmark */}
        <text
          x="0" y="17"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="700"
          fontSize="15"
          fill="#2164f3"
          letterSpacing="-0.2"
        >indeed</text>
      </svg>
    </span>
  ),

  /* Glassdoor — single-quoted 'GLASSDOOR' in green */
  Glassdoor: (
    <span style={{ color: '#0CAA41', fontWeight: 700, fontSize: 12, letterSpacing: '-0.2px', fontFamily: 'Arial, sans-serif' }}>
      &lsquo;GLASSDOOR&rsquo;
    </span>
  ),

  /* careers24 — "careers" in green + "24" in dark red */
  Careers24: (
    <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 14 }}>
      <span style={{ color: '#3aaa35' }}>careers</span><span style={{ color: '#9b1c1c' }}>24</span>
    </span>
  ),

  /* pnet — dark navy person/teardrop icon + "pnet" text */
  PNet: (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <ellipse cx="9" cy="6" rx="4.2" ry="4.2" fill="#0D1F5C"/>
        <path d="M4.8 10.5 Q9 18 13.2 10.5 Q11 8.5 9 8.5 Q7 8.5 4.8 10.5Z" fill="#0D1F5C"/>
      </svg>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#0D1F5C', fontFamily: 'Arial, sans-serif' }}>pnet</span>
    </span>
  ),
}

export const JobBoardSelector = ({ control, errors }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>Job Board Distribution</h2>
    <p className={styles.boardHelperText}>
      Select which job boards to post this mandate to (requires backend functions enabled):
    </p>
    <Controller
      name="jobBoards"
      control={control}
      render={({ field }) => {
        const selected: string[] = field.value as string[]

        const toggle = (board: JobBoard) => {
          if (board === 'All') {
            if (selected.includes('All')) {
              field.onChange([])
            } else {
              field.onChange([...JOB_BOARDS])
            }
            return
          }
          let next = selected.includes(board)
            ? selected.filter(b => b !== board && b !== 'All')
            : [...selected.filter(b => b !== 'All'), board]
          const nonAllBoards = JOB_BOARDS.filter(b => b !== 'All')
          if (nonAllBoards.every(b => next.includes(b))) {
            next = [...JOB_BOARDS]
          }
          field.onChange(next)
        }

        return (
          <div className={styles.field}>
            <div className={styles.jobBoardGrid}>
              {JOB_BOARDS.map(board => {
                const url = BOARD_URLS[board]
                return (
                  <button
                    key={board}
                    type="button"
                    className={`${styles.jobBoardCard} ${selected.includes(board) ? styles.jobBoardCardSelected : ''}`}
                    onClick={() => toggle(board)}
                    aria-pressed={selected.includes(board)}
                  >
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                        tabIndex={-1}
                      >
                        {BOARD_LOGOS[board]}
                      </a>
                    ) : (
                      BOARD_LOGOS[board]
                    )}
                  </button>
                )
              })}
            </div>
            {errors.jobBoards && (
              <p className={styles.errorText}>
                {typeof errors.jobBoards.message === 'string' ? errors.jobBoards.message : 'Select at least one job board'}
              </p>
            )}
          </div>
        )
      }}
    />
  </section>
)
