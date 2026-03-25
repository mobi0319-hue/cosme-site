'use client'
// 動画一覧のフィルター・ソート・ページネーションUI（Client Component）
import { useState, useMemo } from 'react'
import type { Video } from '@/lib/data'

const PER_PAGE = 20

export default function VideosClient({
  videos,
  channels,
}: {
  videos: Video[]
  channels: string[]
}) {
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [sort, setSort] = useState<'products' | 'date'>('products')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = selectedChannel === 'all'
      ? videos
      : videos.filter(v => v.channel === selectedChannel)

    if (sort === 'date') {
      return [...result].sort((a, b) => {
        const da = a.published_at || ''
        const db = b.published_at || ''
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return db.localeCompare(da)
      })
    }
    return [...result].sort((a, b) => b.products.length - a.products.length)
  }, [videos, selectedChannel, sort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // フィルター・ソート変更時はページを1に戻す
  function handleChannelChange(ch: string) {
    setSelectedChannel(ch)
    setPage(1)
  }
  function handleSortChange(s: 'products' | 'date') {
    setSort(s)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* フィルター・ソートバー */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selectedChannel}
          onChange={e => handleChannelChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700"
        >
          <option value="all">すべてのチャンネル</option>
          {channels.map(ch => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>

        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => handleSortChange('products')}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              sort === 'products'
                ? 'bg-pink-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            商品数順
          </button>
          <button
            onClick={() => handleSortChange('date')}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              sort === 'date'
                ? 'bg-pink-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            新着順
          </button>
        </div>
      </div>

      {/* 件数・ページ情報 */}
      <p className="text-sm text-gray-500">
        {filtered.length}動画
        {totalPages > 1 && <span className="ml-2 text-gray-400">（{page} / {totalPages}ページ）</span>}
      </p>

      {/* 動画一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paged.map((video) => (
          <a
            key={video.video_id}
            href={`/video/${video.video_id}`}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex gap-3"
          >
            <img
              src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
              alt={video.video_title}
              className="w-28 h-18 object-cover rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-pink-500 mb-1">{video.channel}</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.video_title}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400">{video.products.length}商品紹介</p>
                {video.published_at && (
                  <p className="text-xs text-gray-300">{video.published_at}</p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 前へ
          </button>

          {/* ページ番号（最大5つ表示） */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-9 h-9 text-sm rounded-lg ${
                    page === p
                      ? 'bg-pink-500 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  )
}
