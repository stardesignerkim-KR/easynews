'use client';

import { useState } from 'react';
import NewsCard from '@/components/NewsCard';
import CardNewsViewer from '@/components/CardNewsViewer';
import { NewsItem } from '@/types/news';

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/news');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '뉴스를 불러오지 못했어요.');
        return;
      }

      setNewsItems(data.news);
    } catch {
      setError('인터넷 연결을 확인해 주세요 🌐');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-yellow-50">
      {/* 헤더 */}
      <header className="bg-yellow-400 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">📰</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
              이지뉴스
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-700 font-medium">
            오늘의 쉬운 뉴스
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 새 뉴스 버튼 */}
        <div className="flex justify-center mb-6">
          <button
            onClick={fetchNews}
            disabled={isLoading}
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 text-gray-800 text-lg font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-xl">⏳</span>
                뉴스 가져오는 중...
              </>
            ) : (
              <>
                <span className="text-xl">🔄</span>
                새 뉴스 불러오기
              </>
            )}
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-center">
            <p className="text-red-700 font-semibold text-base">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* 뉴스 그리드 */}
        {!isLoading && newsItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newsItems.map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                onClick={setSelectedNews}
              />
            ))}
          </div>
        )}

        {/* 초기 안내 */}
        {!isLoading && newsItems.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🌈</span>
            <p className="text-xl font-bold text-gray-600 mb-2">
              오늘의 뉴스를 불러와 볼까요?
            </p>
            <p className="text-gray-400 text-sm">
              위 버튼을 눌러 쉬운 뉴스를 확인하세요!
            </p>
          </div>
        )}
      </div>

      {/* 상세 카드뉴스 뷰어 */}
      {selectedNews && (
        <CardNewsViewer
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </main>
  );
}
