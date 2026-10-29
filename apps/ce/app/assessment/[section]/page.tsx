import { sections } from '@/data/questions'
import SectionClient from './SectionClient'

export const dynamicParams = false

export function generateStaticParams() {
  return sections.map((s) => ({ section: s.slug }))
}

export default function Page() {
  return <SectionClient />
}
