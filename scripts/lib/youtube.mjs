// YouTube Data API + 字幕取得ヘルパ
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const yt = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

const URL_PATTERNS = [
  /youtube\.com\/channel\/(UC[\w-]+)/,
  /youtube\.com\/c\/([^/?]+)/,
  /youtube\.com\/user\/([^/?]+)/,
  /youtube\.com\/@([^/?]+)/,
];

// channel URL から uploads playlist ID を取得
export async function resolvePlaylistId(channelUrl) {
  let identifier = null;
  let mode = null;
  for (const re of URL_PATTERNS) {
    const m = re.exec(channelUrl);
    if (m) {
      identifier = m[1];
      mode = re.source.includes('channel/') ? 'id' : 'username';
      break;
    }
  }
  if (!identifier) throw new Error(`unrecognized channel URL: ${channelUrl}`);

  let channelId;
  if (mode === 'id') {
    channelId = identifier;
  } else {
    // username/handle → channelId
    const res = await yt.channels.list({
      part: ['id'],
      forHandle: identifier.startsWith('@') ? identifier : `@${identifier}`,
    }).catch(() => null);
    if (res?.data?.items?.length) {
      channelId = res.data.items[0].id;
    } else {
      // legacy username
      const res2 = await yt.channels.list({ part: ['id'], forUsername: identifier });
      if (!res2.data.items?.length) throw new Error(`channel not found: ${identifier}`);
      channelId = res2.data.items[0].id;
    }
  }

  // uploads playlist は UC を UU に置き換え
  return 'UU' + channelId.slice(2);
}

// uploads playlist から動画一覧を取得（最新から sinceDays 以内、最大 maxVideos 件）
export async function listRecentVideos(playlistId, { sinceDays = 30, maxVideos = 20 } = {}) {
  const cutoff = new Date(Date.now() - sinceDays * 86400000);
  const results = [];
  let pageToken;
  do {
    const res = await yt.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items ?? []) {
      const publishedAt = new Date(item.snippet.publishedAt);
      if (publishedAt < cutoff) {
        return results.slice(0, maxVideos);
      }
      results.push({
        video_id: item.contentDetails.videoId,
        video_url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
        video_title: item.snippet.title,
        published_at: item.snippet.publishedAt,
        description: item.snippet.description,
      });
      if (results.length >= maxVideos) return results;
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return results;
}

// 字幕取得（日本語優先、なければ英語）
export async function fetchTranscript(videoId) {
  try {
    const segs = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja' });
    return segs.map(s => s.text).join(' ');
  } catch {
    try {
      const segs = await YoutubeTranscript.fetchTranscript(videoId);
      return segs.map(s => s.text).join(' ');
    } catch (e) {
      return null;
    }
  }
}
