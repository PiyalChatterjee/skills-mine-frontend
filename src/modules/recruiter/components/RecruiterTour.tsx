import {
  Joyride,
  type EventData,
  type TooltipRenderProps,
  type Step,
  STATUS,
  ACTIONS,
  EVENTS,
} from 'react-joyride'
import faviconIcon from '@/assets/Favicon-2.svg'
import { useAuth } from '@/app/auth/AuthContext'

const BrandIcon = () => (
  <img src={faviconIcon} alt="Skills Mine" style={{ display: 'block', width: 60, height: 60 }} />
)

// ── Close (×) button ──────────────────────────────────────────────────────

const CloseButton = ({ onClick }: { onClick: React.MouseEventHandler }) => (
  <button
    onClick={onClick}
    aria-label="Close tour"
    style={{
      position: 'absolute',
      top: 14,
      right: 16,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      lineHeight: 1,
      color: '#555',
      fontSize: 18,
    }}
  >
    ×
  </button>
)

// ── Custom tooltip ────────────────────────────────────────────────────────

const CustomTooltip = ({
  index,
  step,
  closeProps,
  primaryProps,
  skipProps,
  isLastStep,
}: TooltipRenderProps) => {
  const isWelcome = index === 0

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '32px 28px 28px',
        width: 340,
        maxWidth: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      {/* Close × */}
      <CloseButton onClick={closeProps.onClick} />

      {/* Brand icon — only on welcome step */}
      {isWelcome && (
        <div style={{ marginBottom: 16 }}>
          <BrandIcon />
        </div>
      )}

      {/* Title */}
      <p
        style={{
          margin: '0 0 20px',
          fontSize: 18,
          fontWeight: 700,
          color: '#03478C',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {step.title as string}
      </p>

      {/* Primary action button — "Show me around" / "Next" / "Done" */}
      <button
        {...primaryProps}
        style={{
          ...(('style' in primaryProps ? primaryProps.style : undefined) ?? {}),
          width: '100%',
          padding: '13px 0',
          background: '#03478C',
          color: '#ffffff',
          border: 'none',
          borderRadius: 32,
          fontSize: 15,
          fontWeight: 400,
          cursor: 'pointer',
          marginBottom: 16,
          letterSpacing: 0,
        }}
      >
        {isWelcome ? 'Show me around' : isLastStep ? 'Done' : 'Next'}
      </button>

      {/* Skip / close link */}
      <button
        {...skipProps}
        style={{
          ...(('style' in skipProps ? skipProps.style : undefined) ?? {}),
          background: 'none',
          border: 'none',
          color: '#03478C',
          fontSize: 14,
          fontWeight: 400,
          cursor: 'pointer',
          textDecoration: 'none',
          padding: 0,
        }}
      >
        {isWelcome
          ? 'No thanks, just take me to my Dashboard.'
          : 'Take me to my Dashboard'}
      </button>
    </div>
  )
}

// ── Tour steps ────────────────────────────────────────────────────────────

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome To The Skills Mine!',
    content: '',
    skipBeacon: true,
  },
  {
    target: '[data-tour="welcome-banner"]',
    placement: 'bottom',
    title: 'View Your Weekly To-Do Items Here',
    content: '',
    skipBeacon: true,
  },
  {
    target: '[data-tour="recruiter-sidebar"]',
    placement: 'right',
    title: 'Navigate Your Menu Here',
    content: '',
    skipBeacon: true,
  },
  {
    target: '[data-tour="pipeline-expand"]',
    placement: 'top',
    title: 'Click This Icon To Advance The Job Post Along The Pipeline.',
    content: '',
    skipBeacon: true,
  },
]

// ── Component ─────────────────────────────────────────────────────────────

const TOUR_SEEN_PREFIX = 'tour_seen_'

export const RecruiterTour = () => {
  const { user, hasRole } = useAuth()
  const userId = user?.userId

  const isRecruiter = hasRole(['RECRUITER'])

  const tourKey = userId ? `${TOUR_SEEN_PREFIX}${userId}` : null
  const shouldRun = isRecruiter // always run — dev testing

  const handleCallback = (data: EventData) => {
    const { status, type, action } = data

    const isTourDone =
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE)

    if (isTourDone && tourKey) {
      localStorage.setItem(tourKey, 'true')
    }
  }

  if (!shouldRun) return null

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={shouldRun}
      continuous
      scrollToFirstStep
      onEvent={handleCallback}
      tooltipComponent={CustomTooltip}
      options={{
        overlayColor: 'rgba(0, 0, 0, 0.55)',
        zIndex: 10000,
        arrowColor: '#ffffff',
        showProgress: false,
      }}
    />
  )
}
