type Pub = { title: string; venue: string; year: number; link?: string }

const pubs: Pub[] = [
  { title: 'Inclusive Co-creation with Visually Impaired Children', venue: 'JSSD', year: 2025, link: '#' },
  { title: 'AI Persona Visualization for Cooking Creativity', venue: 'Workshop', year: 2025 },
]

export default function ResearchPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Research</h1>
      <ul className="space-y-4">
        {pubs.map((p) => (
          <li key={p.title} className="rounded-xl border p-4">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-neutral-500">{p.venue} · {p.year}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
