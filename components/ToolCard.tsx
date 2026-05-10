import Image from 'next/image'
import Link from 'next/link'
import type { SITE_TOOLS } from '@/lib/tools'

type Tool = (typeof SITE_TOOLS)[number]

type Props = {
  tool: Tool
  featured?: boolean
}

export default function ToolCard({ tool, featured = false }: Props) {
  return (
    <Link
      href={tool.href}
      className={`group block h-full rounded-lg border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-md ${
        featured ? 'border-brand-green/50 p-5 ring-1 ring-brand-green/15' : 'border-gray-200 p-5'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <Image src={tool.icon} alt="" width={38} height={38} className="size-9 object-contain" />
        </span>
        <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-black text-brand-dark">
          {tool.label}
        </span>
      </div>
      <h3 className="text-lg font-extrabold leading-snug text-brand-text">{tool.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{tool.description}</p>
      <p className="mt-4 inline-flex items-center gap-1 text-xs font-black text-brand-green">
        開く <span className="transition-transform group-hover:translate-x-1">→</span>
      </p>
    </Link>
  )
}
