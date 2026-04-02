import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const spinnerSvg = (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{
      animation: 'summit-btn-spin 0.75s linear infinite',
      flexShrink: 0,
    }}
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="2"
    />
    <path
      d="M14 8a6 6 0 0 0-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const spinKeyframes = `
@keyframes summit-btn-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontFamily: 'var(--font-body, inherit)',
  fontWeight: 600,
  lineHeight: 1,
  border: '2px solid transparent',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'opacity 0.15s ease, transform 0.1s ease',
  userSelect: 'none',
  whiteSpace: 'nowrap',
}

function getVariantStyle(variant: ButtonProps['variant']): React.CSSProperties {
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--color-secondary, #0ea5e9)',
        color: '#ffffff',
        borderColor: 'transparent',
      }
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--color-primary, #7c3aed)',
        borderColor: 'var(--color-primary, #7c3aed)',
      }
    case 'danger':
      return {
        background: '#dc2626',
        color: '#ffffff',
        borderColor: 'transparent',
      }
    case 'primary':
    default:
      return {
        background: 'var(--color-primary, #7c3aed)',
        color: '#ffffff',
        borderColor: 'transparent',
      }
  }
}

function getSizeStyle(size: ButtonProps['size']): React.CSSProperties {
  switch (size) {
    case 'sm':
      return {
        fontSize: '0.875rem',
        padding: '0.375rem 0.875rem',
        minHeight: '2rem',
      }
    case 'lg':
      return {
        fontSize: '1.125rem',
        padding: '0.875rem 2rem',
        minHeight: '3rem',
      }
    case 'md':
    default:
      return {
        fontSize: '1rem',
        padding: '0.625rem 1.375rem',
        minHeight: '2.5rem',
      }
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      children,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    const computedStyle: React.CSSProperties = {
      ...baseStyle,
      ...getVariantStyle(variant),
      ...getSizeStyle(size),
      ...(fullWidth ? { width: '100%' } : {}),
      ...(isDisabled
        ? { opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' }
        : {}),
      ...style,
    }

    return (
      <>
        {/* Inject keyframes once via a style tag */}
        <style>{spinKeyframes}</style>
        <button
          ref={ref}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading}
          style={computedStyle}
          {...props}
        >
          {loading && spinnerSvg}
          {children}
        </button>
      </>
    )
  },
)

Button.displayName = 'Button'

export default Button
