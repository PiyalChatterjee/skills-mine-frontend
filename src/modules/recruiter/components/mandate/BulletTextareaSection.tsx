import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

const BULLET = '• '

/** Ensure every non-empty line starts with a bullet. */
function applyBullets(raw: string): string {
  return raw
    .split('\n')
    .map(line => {
      if (line === '') return line
      return line.startsWith(BULLET) ? line : BULLET + line
    })
    .join('\n')
}

interface Props {
  control: Control<MandateFormValues>
  errors: FieldErrors<MandateFormValues>
  name: keyof Pick<MandateFormValues, 'requirements' | 'responsibilities' | 'benefits'>
  label: string
  placeholder?: string
}

/** Reusable bullet textarea — used for Requirements, Responsibilities, Benefits */
export const BulletTextareaSection = ({ control, errors, name, label, placeholder }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{label}</h2>
    <div className={styles.field}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            rows={5}
            className={`${styles.textarea} ${errors[name] ? styles.hasError : ''}`}
            placeholder={placeholder ?? `Enter each item on a new line...`}
            onChange={e => {
              field.onChange(applyBullets(e.target.value))
            }}
            onKeyDown={e => {
              const el = e.currentTarget
              const { value, selectionStart } = el

              if (e.key === 'Enter') {
                e.preventDefault()
                // Build the new value ourselves: insert \n + bullet at the cursor position.
                const pos = selectionStart ?? value.length
                const next = value.slice(0, pos) + '\n' + BULLET + value.slice(pos)
                field.onChange(next)
                // Place cursor right after the new bullet prefix.
                const newPos = pos + 1 + BULLET.length
                setTimeout(() => el.setSelectionRange(newPos, newPos), 0)
                return
              }

              if (e.key === 'Backspace' && selectionStart !== null) {
                // Find the start of the current line.
                const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
                const cursorPosInLine = selectionStart - lineStart
                const bulletEnd = lineStart + BULLET.length

                // Cursor is inside or right at the end of the bullet prefix — prevent deletion of the bullet.
                if (selectionStart === el.selectionEnd && cursorPosInLine <= BULLET.length && cursorPosInLine > 0) {
                  e.preventDefault()

                  // If the line is just the bullet prefix (nothing typed yet), remove the whole line.
                  if (value.slice(lineStart, lineStart + BULLET.length) === BULLET &&
                      value.slice(bulletEnd).split('\n')[0] === '') {
                    const before = value.slice(0, lineStart > 0 ? lineStart - 1 : 0) // remove the preceding \n
                    const after  = value.slice(lineStart + BULLET.length)
                    const next   = lineStart > 0 ? before + after : after
                    field.onChange(next)
                    setTimeout(() => {
                      const pos = lineStart > 0 ? lineStart - 1 : 0
                      el.setSelectionRange(pos, pos)
                    }, 0)
                  }
                  // Otherwise just leave the bullet intact — cursor stays where it is.
                  return
                }
              }
            }}
            onFocus={e => {
              // Seed the first bullet when the user clicks into an empty field.
              if (e.target.value === '') {
                field.onChange(BULLET)
                setTimeout(() => {
                  e.target.setSelectionRange(BULLET.length, BULLET.length)
                }, 0)
              }
            }}
          />
        )}
      />
      {errors[name] && <p className={styles.errorText}>{(errors[name] as { message?: string })?.message}</p>}
    </div>
  </section>
)
