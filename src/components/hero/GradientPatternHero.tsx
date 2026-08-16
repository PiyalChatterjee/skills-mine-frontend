import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import patternOne from '@/assets/cv-builder/pattern-1.svg'
import patternTwo from '@/assets/cv-builder/pattern-2.svg'
import styles from './GradientPatternHero.module.css'

type GradientPatternHeroProps = {
  height: number
  children: ReactNode
  className?: string
  contentClassName?: string
  rightPatternClassName?: string
  leftPatternClassName?: string
  rightPatternSrc?: string
  leftPatternSrc?: string
}

export const GradientPatternHero = ({
  height,
  children,
  className,
  contentClassName,
  rightPatternClassName,
  leftPatternClassName,
  rightPatternSrc = patternOne,
  leftPatternSrc = patternTwo,
}: GradientPatternHeroProps) => {
  return (
    <Box
      component="section"
      className={[styles.heroRoot, className].filter(Boolean).join(' ')}
      sx={{ height: `${height}px` }}
    >
      <img
        src={rightPatternSrc}
        alt=""
        className={[styles.heroPatternRight, rightPatternClassName].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      <img
        src={leftPatternSrc}
        alt=""
        className={[styles.heroPatternLeft, leftPatternClassName].filter(Boolean).join(' ')}
        aria-hidden="true"
      />
      <Box className={[styles.heroContent, contentClassName].filter(Boolean).join(' ')}>{children}</Box>
    </Box>
  )
}
