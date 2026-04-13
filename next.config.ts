import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      // YouTube サムネイル
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // 楽天商品画像
      { protocol: "https", hostname: "thumbnail.image.rakuten.co.jp" },
      // Amazon商品画像
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
    ],
  },
  headers: async () => [
    {
      // 画像のキャッシュ（30日）
      source: "/:path*.(jpg|jpeg|png|gif|webp|svg|ico)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=2592000, immutable" },
      ],
    },
    {
      // JS/CSSのキャッシュ（1年、Next.jsがハッシュ付きファイル名を生成するため安全）
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};

export default nextConfig;
