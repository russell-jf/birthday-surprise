/**
 * Centered title / body block with shared typography roles.
 * titleRole: display (English serif) | title (Chinese clear)
 */
export default function StoryCopy({
  title,
  subtitle,
  titleAs: TitleTag = 'h2',
  titleRole = 'title',
  className = '',
  children,
  ...rest
}) {
  const classes = ['story-copy', className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {title ? (
        <TitleTag className={titleRole === 'display' ? 'story-display' : 'story-title'}>
          {title}
        </TitleTag>
      ) : null}
      {subtitle ? <p className="story-body">{subtitle}</p> : null}
      {children}
    </div>
  )
}
