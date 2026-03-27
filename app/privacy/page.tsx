import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー・免責事項 | コスメまとめ",
  description: "コスメまとめのプライバシーポリシーおよび免責事項です。",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">プライバシーポリシー・免責事項</h1>

      {/* アフィリエイトについて */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">広告について</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          また、当サイトは楽天アフィリエイトプログラムに参加しています。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          これらのプログラムにより、第三者がコンテンツおよび宣伝を提供し、ユーザーから直接情報を収集し、ユーザーのブラウザにクッキーを設定したり認識したりする場合があります。
        </p>
      </section>

      {/* アクセス解析 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">アクセス解析ツールについて</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。Googleアナリティクスはデータの収集のためにクッキー（Cookie）を使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          この機能はクッキーを無効にすることで収集を拒否することができますので、お使いのブラウザの設定をご確認ください。詳しくは
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">Googleのポリシーと規約</a>
          をご覧ください。
        </p>
      </section>

      {/* 免責事項 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">免責事項</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          当サイトに掲載されている情報は、YouTubeで公開されている動画の内容をもとにまとめたものです。商品の効果・効能を保証するものではありません。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          商品のご購入やご使用にあたっては、各商品の販売ページや公式サイトの情報をご確認ください。当サイトの情報を利用したことによるいかなる損害についても、当サイトは責任を負いかねます。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          掲載情報の正確性には努めておりますが、商品名・価格・在庫状況等は変更される場合があります。最新の情報は各販売サイトにてご確認ください。
        </p>
      </section>

      {/* 著作権 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">著作権について</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          当サイトで掲載している文章や画像の著作権は、当サイト運営者に帰属します。無断転載はご遠慮ください。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          また、当サイトで紹介しているYouTube動画の著作権は、各動画の制作者に帰属します。
        </p>
      </section>

      {/* 運営者情報 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">運営者情報</h2>
        <table className="text-sm text-gray-600 w-full">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-700 whitespace-nowrap">運営者</td>
              <td className="py-2">コスメまとめ編集部</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-700 whitespace-nowrap">サイトURL</td>
              <td className="py-2">
                <a href="https://cosme-site.vercel.app" className="text-pink-500 hover:underline">https://cosme-site.vercel.app</a>
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-gray-700 whitespace-nowrap">お問い合わせ</td>
              <td className="py-2">
                下記のお問い合わせフォームよりご連絡ください
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* お問い合わせ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">お問い合わせ</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          当サイトに関するお問い合わせ・ご要望・掲載内容の修正依頼等は、下記フォームよりお願いいたします。
        </p>
        <a
          href="/contact"
          className="inline-block bg-pink-500 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
        >
          お問い合わせフォームはこちら
        </a>
      </section>
    </div>
  );
}
