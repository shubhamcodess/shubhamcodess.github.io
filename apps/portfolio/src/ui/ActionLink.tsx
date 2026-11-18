import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './action-link.css'

interface ActionLinkProps {
  readonly href: string
  readonly children: ReactNode
  readonly icon?: IconName
  /** Put the icon before the label, for links that go back. */
  readonly iconFirst?: boolean
  /** "glass" is the frosted chip, for use over the hero light only. */
  readonly variant?: 'text' | 'glass'
  readonly external?: boolean
  /** A fuller name for screen readers when the visible label is short, such as "Code". */
  readonly label?: string
}

export function ActionLink({
  href,
  children,
  icon = 'arrowUpRight',
  variant = 'text',
  iconFirst = false,
  external = false,
  label,
}: ActionLinkProps) {
  return (
    <a
      className={`action-link action-link--${variant}${iconFirst ? ' action-link--back' : ''}`}
      href={href}
      {...(label ? { 'aria-label': label } : {})}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className={variant === 'text' ? 'link-dots' : undefined}>{children}</span>
      <Icon name={icon} size={14} />
    </a>
  )
}
