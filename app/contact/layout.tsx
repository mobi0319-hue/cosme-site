import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "お問い合わせ | コスメまとめ",
  description: "コスメまとめへのお問い合わせフォームです。",
  alternates: {
    canonical: "https://cosme-ch.com/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
