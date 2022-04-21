// @ts-ignore: Unused local var
import React from 'react'
import { Link } from './Link'

export const HomePage = () => {
  return (
    <main className="container mx-auto" id="app">
      <h1 className="p-2 text-3xl md:text-5xl text-slate-800 text-center font-semibold mx-auto">
        Tom Switzer
      </h1>
      <dl className="p-2 flex justify-center divide-x text-center">
        <dt className="p-2 font-bold text-slate-800">Contact</dt>
        <dd className="p-2"><Link href="mailto:thomas.switzer@gmail.com">E-mail</Link></dd>
        <dd className="p-2"><Link href="https://twitter.com/tixxit">Twitter</Link></dd>
        <dd className="p-2"><Link href="https://github.com/tixxit">GitHub</Link></dd>
        <dd className="p-2"><Link href="https://ca.linkedin.com/in/tom-switzer-59824356">LinkedIn</Link></dd>
      </dl>
      <p className="text-center font-thin">Software engineer focused on ML infrastructure, data engineering, and distributed systems.</p>
    </main>
  )
}