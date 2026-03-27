"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await fetch("https://formsubmit.co/ajax/cosme.matome.info@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          category: data.get("category"),
          message: data.get("message"),
          _subject: "【コスメまとめ】お問い合わせ",
        }),
      });
      setSubmitted(true);
    } catch {
      alert("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          お問い合わせを受け付けました
        </h1>
        <p className="text-gray-600 mb-8">
          内容を確認のうえ、必要に応じてご連絡いたします。<br />
          お問い合わせいただきありがとうございます。
        </p>
        <a
          href="/"
          className="inline-block bg-pink-500 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
        >
          トップページに戻る
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* パンくず */}
      <nav className="text-xs text-gray-400 mb-6">
        <a href="/" className="hover:text-pink-500">TOP</a>
        <span className="mx-1">&gt;</span>
        <span className="text-gray-600">お問い合わせ</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-6">
        当サイトに関するご質問・ご要望・掲載内容の修正依頼等は、下記フォームよりお送りください。
      </p>

      {/* クリエイター向け案内 */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-8">
        <h2 className="text-sm font-bold text-gray-800 mb-2">クリエイター・YouTuberの方へ</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          当サイトでは、YouTube動画で紹介された商品情報をまとめ、視聴者の方が動画や商品を見つけやすくすることを目的としています。
          掲載内容の修正・削除をご希望の場合は、下記フォームの種別から「掲載削除の依頼」を選択してご連絡ください。
          確認後、速やかに対応いたします（原則24時間以内）。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* お名前 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="山田 太郎"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-pink-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            お問い合わせ種別
          </label>
          <select
            id="category"
            name="category"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white"
          >
            <option value="一般的なお問い合わせ">一般的なお問い合わせ</option>
            <option value="掲載内容の修正依頼">掲載内容の修正依頼</option>
            <option value="掲載削除の依頼">掲載削除の依頼</option>
            <option value="広告・提携について">広告・提携について</option>
            <option value="その他">その他</option>
          </select>
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            お問い合わせ内容 <span className="text-pink-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="お問い合わせ内容をご記入ください"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 resize-vertical"
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-pink-500 text-white font-medium py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "送信中..." : "送信する"}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-6">
        ※ お問い合わせの内容によっては、返信にお時間をいただく場合があります。
      </p>
    </div>
  );
}
