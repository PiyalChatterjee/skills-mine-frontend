type BookmarkIconProps = {
  filled: boolean
  className?: string
}

export const BookmarkIcon = ({ filled, className }: BookmarkIconProps) => {
  if (filled) {
    return (
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true" className={className}>
        <path d="M0.75 0H11.25C11.6642 0 12 0.347013 12 0.775066V15.6124C12 15.8264 11.8321 16 11.625 16C11.5546 16 11.4855 15.9794 11.4258 15.9407L6 12.4253L0.574193 15.9407C0.398723 16.0544 0.167295 15.9996 0.0572773 15.8182C0.0198523 15.7566 0 15.6852 0 15.6124V0.775066C0 0.347013 0.33579 0 0.75 0Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true" className={className}>
      <path d="M0.75 0H11.25C11.6642 0 12 0.347013 12 0.775066V15.6124C12 15.8264 11.8321 16 11.625 16C11.5546 16 11.4855 15.9794 11.4258 15.9407L6 12.4253L0.574193 15.9407C0.398723 16.0544 0.167295 15.9996 0.0572773 15.8182C0.0198523 15.7566 0 15.6852 0 15.6124V0.775066C0 0.347013 0.33579 0 0.75 0ZM10.5 1.55013H1.5V13.5113L6 10.5957L10.5 13.5113V1.55013Z" fill="currentColor" />
    </svg>
  )
}
