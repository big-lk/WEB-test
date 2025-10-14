export default function WorksPage() {
  const items = [
    { title: 'Tactile Piano Aid', tags: ['Inclusive', 'Co-creation'], img: '/works/piano.jpg' },
    { title: 'AI Cooking Persona', tags: ['UX', 'AI'], img: '/works/cooking.jpg' },
  ]
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Selected Works</h1>
      <ul className="grid gap-6 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.title} className="border rounded-2xl overflow-hidden bg-white/50 dark:bg-neutral-900/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.img} alt={it.title} className="w-full aspect-video object-cover" />
            <div className="p-4">
              <h2 className="font-semibold">{it.title}</h2>
              <p className="text-sm text-neutral-500">{it.tags.join(' · ')}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
