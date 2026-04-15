'use client';

import { NewsItem } from '@/types/news';
import { useState } from 'react';

interface Props {
  news: NewsItem;
  newsIndex: number;
  totalNews: number;
}

export default function ParentNewsCard({ news, newsIndex, totalNews }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl flex flex-col">

      {/* 헤더 */}
      <div className="bg-blue-400 px-4 py-3 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-white leading-tight line-clamp-1 flex-1">
          {news.originalTitle || news.headline}
        </h2>
        <span className="ml-2 text-xs font-bold text-blue-100 bg-white/20 px-2 py-1 rounded-full flex-shrink-0">
          {newsIndex + 1} / {totalNews}
        </span>
      </div>

      {/* 네이버 뉴스 이미지 (고정 — 슬라이드 변해도 그대로) */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 flex-shrink-0">
        {!imgError && news.originalImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={news.originalImageUrl}
            alt={news.originalTitle}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <span className="text-4xl">📰</span>
            <span className="text-xs">이미지 없음</span>
          </div>
        )}
      </div>

      {/* 본문 (스크롤) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex-shrink-0">
          <p className="text-xs font-bold text-gray-400">📋 부모님용 원문</p>
        </div>

        <div className="overflow-y-scroll flex-1 px-4 py-3 min-h-0">
          {news.originalTitle && (
            <p className="text-sm font-bold text-gray-700 mb-2 break-keep">{news.originalTitle}</p>
          )}
          {news.originalDescription && (
            <p className="text-sm text-gray-500 leading-relaxed break-keep whitespace-pre-wrap">
              {news.originalDescription}
            </p>
          )}
        </div>

        {/* 하단: 날짜 + 원문 링크 */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          {news.originalPubDate && (
            <p className="text-xs text-gray-400">
              {new Date(news.originalPubDate).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
          {news.originalUrl && (
            <a
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 underline hover:text-blue-700"
            >
              원문 기사 보기 →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
