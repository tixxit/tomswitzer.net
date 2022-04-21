import React from 'react'

export type LinkProps = {
  href: string,
  children: React.ReactNode,
}

export const Link = (props: LinkProps) => {
  return (
    <a className="text-blue-600 hover:text-blue-800" href={props.href}>
      {props.children}
    </a>
  )
}