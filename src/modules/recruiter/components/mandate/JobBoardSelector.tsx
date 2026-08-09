import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

import allIcon       from '../../../../assets/recruiter/Frame 242.svg'
import linkedInIcon  from '../../../../assets/recruiter/Frame 241.svg'
import indeedIcon    from '../../../../assets/recruiter/Frame 243.svg'
import glassdoorIcon from '../../../../assets/recruiter/Frame 244.svg'
import careers24Icon from '../../../../assets/recruiter/Frame 245.svg'
import pnetIcon      from '../../../../assets/recruiter/Frame 246.svg'

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
  All:       <img src={allIcon}       alt="All"       style={{ display: 'block' }} />,
  LinkedIn:  <img src={linkedInIcon}  alt="LinkedIn"  style={{ display: 'block' }} />,
  Indeed:    <img src={indeedIcon}    alt="Indeed"    style={{ display: 'block' }} />,
  Glassdoor: <img src={glassdoorIcon} alt="Glassdoor" style={{ display: 'block' }} />,
  Careers24: <img src={careers24Icon} alt="Careers24" style={{ display: 'block' }} />,
  PNet:      <img src={pnetIcon}      alt="PNet"      style={{ display: 'block' }} />,
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
                        style={{ display: 'block', lineHeight: 0 }}
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
