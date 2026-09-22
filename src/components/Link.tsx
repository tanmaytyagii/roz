import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../lib/router'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/**
 * A link. In-page hashes are left to the browser (and to Lenis, which owns
 * smooth anchor scrolling); everything else goes through the History API,
 * except the modified clicks a person means to open in a new tab.
 */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (to.startsWith('#')) return
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handle} {...rest} />
}
