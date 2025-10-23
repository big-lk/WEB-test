export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold">孔维鹏 KONG WEIPENG – 工业设计 Industrial Design / HCI</h1>
        <p className="text-neutral-500 mt-2"> 感性工学 Sensory Engineering　・　製品設計　Product design ・ UI/UX</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <a href="/works" className="block rounded-2xl border p-6 hover:shadow transition">
          <h2 className="font-semibold mb-2">工作集 Selected Works →</h2>
          <p className="text-neutral-500 text-sm">代表性项目和设计工件.</p>
        </a>
        <a href="/research" className="block rounded-2xl border p-6 hover:shadow transition">
          <h2 className="font-semibold mb-2">研究 →</h2>
          <p className="text-neutral-500 text-sm">论文、发表及研究成果.</p>
        </a>
      </section>

      <section id="contact" className="mt-16 space-y-3">
        <h2 className="text-xl font-semibold">联系方式Contact</h2>
        <p className="text-neutral-500">littlekeen@outlook.com ・ 札幌市立大学Sapporo City University</p>
      </section>
    </main>
  )
}
