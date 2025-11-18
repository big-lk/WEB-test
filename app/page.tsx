export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <div
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] 
      bg-[url('/logo-bg.svg')] bg-no-repeat bg-[left_200px] bg-[length:400px]"
      />

      {/* 顶部信息：名字 + 方向标签 */}
      <header className="mb-12 md:mb-16">
        <p className="text-xs tracking-[0.25em] uppercase text-neutral-400">
          Industrial Design / HCI
        </p>

        <div className="mt-3 flex items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              KONG WEIPENG 孔维鹏
          </h1>
      
          {/* Logo 图片 */}
          <img 
            src="/logo.PNG" 
            alt="logo"
            className="w-40 h-40 opacity-90"
          />
        </div>

        <p className="mt-4 text-sm md:text-base text-neutral-600 leading-relaxed">
          工业设计 / 感性工学 / UI・UX。  
          通过感性工学探究产品与界面设计/探索人与技术之间更细腻的体验关系。
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-[13px]">
          <span className="rounded-full border px-3 py-1 text-neutral-600">
            感性工学 Sensory Engineering
          </span>
          <span className="rounded-full border px-3 py-1 text-neutral-600">
            Product Design
          </span>
          <span className="rounded-full border px-3 py-1 text-neutral-600">
            UI / UX ・ 产品设计
          </span>
        </div>
      </header>

      {/* 主要导航卡片：作品 / 研究 */}
      <section className="grid gap-6 sm:grid-cols-2">
        <a
          href="/works"
          className="group block rounded-2xl border border-neutral-200 bg-white/60 p-6 shadow-sm shadow-black/[0.03] transition hover:-translate-y-1 hover:border-neutral-900 hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">
              作品集 Portfolio
            </h2>
            <span className="text-sm text-neutral-400 group-hover:text-neutral-800">
              →
            </span>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            代表性产品设计、UI/UX 原型与研究型项目。 
          </p>
        </a>

        <a
          href="/research"
          className="group block rounded-2xl border border-neutral-200 bg-white/60 p-6 shadow-sm shadow-black/[0.03] transition hover:-translate-y-1 hover:border-neutral-900 hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">
              研究 Research
            </h2>
            <span className="text-sm text-neutral-400 group-hover:text-neutral-800">
              →
            </span>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            感性評価・UI/UX に関する論文、
          </p>
        </a>
      </section>

      {/* About / 简短自我介绍 */}
      <section className="mt-16 border-t pt-10">
        <h2 className="text-lg md:text-xl font-semibold mb-3">
          About
        </h2>
        <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
          札幌市立大学・工业设计 / 感性工学方向。  
          通过可量化的研究方式去探究人们对于产品的感性需求,并以此引导人们创造美好生活
        </p>
      </section>

      {/* 联系方式 */}
      <section id="contact" className="mt-12 space-y-3">
        <h2 className="text-lg md:text-xl font-semibold">联系方式 Contact</h2>
        <p className="text-sm md:text-base text-neutral-600">
          littlekeen@outlook.com  
          札幌市立大学 Sapporo City University
        </p>
      </section>
    </main>
  )
}
