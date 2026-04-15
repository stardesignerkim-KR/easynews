'use client';

import { NewsItem } from '@/types/news';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  news: NewsItem;
  onClick: (news: NewsItem) => void;
}

const FALLBACK_COLORS = [
  'bg-sky-200', 'bg-green-200', 'bg-yellow-200',
  'bg-pink-200', 'bg-purple-200', 'bg-orange-200',
  'bg-teal-200', 'bg-rose-200',
];

const FALLBACK_EMOJIS = ['🌈', '🌟', '🎨', '🌸', '🦋', '🌻', '🐬', '🎪'];

export default function NewsCard({ news, onClick }: Props) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const idx = parseInt(news.id.split('-').pop() || '0');
  const fallbackColor = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
  const fallbackEmoji = FALLBACK_EMOJIS[idx % FALLBACK_EMOJIS.length];

  return (
    <button
      onClick={() => onClick(news)}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white"
    >
      {/* 이미지 로딩 중 배경 */}
      {!imgLoaded && !imgError && (
        <div className={`absolute inset-0 ${fallbackColor} animate-pulse flex items-center justify-center text-4xl`}>
          {fallbackEmoji}
        </div>
      )}

      {/* 이미지 오류 시 폴백 */}
      {imgError && (
        <div className={`absolute inset-0 ${fallbackColor} flex items-center justify-center text-5xl`}>
          {fallbackEmoji}
        </div>
      )}

      {/* 썸네일 이미지 */}
      {!imgError && (
        <Image
          src={news.thumbnail}
          alt={news.headline}
          fill
          className={`object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm md:text-base lg:text-lg leading-snug drop-shadow-lg line-clamp-2">
          {news.headline}
        </p>
      </div>
    </button>
  );
}
