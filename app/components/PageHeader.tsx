// 各一覧ページの共通ヘッダー。GPT image 2 で生成した装飾素材を使用。
type Props = {
  title: string
  subtitle?: string
  meta?: string
  cta?: { href: string; label: string }
  decoration?: 'petals' | 'sparkles' | 'both' | 'none'
}

export default function PageHeader({
  title,
  subtitle,
  meta,
  cta,
  decoration = 'both',
}: Props) {
  return (
    <section className="relative text-center py-8 sm:py-10 px-4 rounded-2xl border border-pink-100 overflow-hidden bg-white">
      <img
        src="/decorations/hero_bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none select-none"
      />
      {(decoration === 'petals' || decoration === 'both') && (
        <img
          src="/decorations/shapes/petals.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute -left-4 -top-2 w-24 opacity-80 pointer-events-none select-none"
        />
      )}
      {(decoration === 'sparkles' || decoration === 'both') && (
        <img
          src="/decorations/shapes/sparkles.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute right-2 top-1 w-20 opacity-70 pointer-events-none select-none"
        />
      )}

      <div className="relative">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 drop-shadow-sm">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-500 mb-1">{subtitle}</p>}
        {meta && <p className="text-xs text-gray-400">{meta}</p>}
        {cta && (
          <a
            href={cta.href}
            className="inline-block mt-3 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 rounded-xl transition-colors text-sm shadow-sm"
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  )
}
