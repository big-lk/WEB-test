export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold">Zhou Zizhe – Industrial Design / HCI</h1>
        <p className="text-neutral-500 mt-2">Inclusive Design ・ Kansei ・ UI/UX</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <a href="/works" className="block rounded-2xl border p-6 hover:shadow transition">
          <h2 className="font-semibold mb-2">Selected Works →</h2>
          <p className="text-neutral-500 text-sm">Representative projects and design artifacts.</p>
        </a>
        <a href="/research" className="block rounded-2xl border p-6 hover:shadow transition">
          <h2 className="font-semibold mb-2">Research →</h2>
          <p className="text-neutral-500 text-sm">Papers, talks, and experiments.</p>
        </a>
      </section>

      <section id="contact" className="mt-16 space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-neutral-500">mail@example.com ・ Sapporo City University</p>
      </section>
    </main>
  )
}
