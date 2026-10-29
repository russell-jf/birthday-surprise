export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  className = '',
  ...rest
}) {
  const classes = ['story-btn', `story-btn--${variant}`, className].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
