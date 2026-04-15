'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import CardNewsViewer from '@/components/CardNewsViewer';
import { NewsItem } from '@/types/news';

export default function Home() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 드래그 분할 비율 (%)
  const [leftPct, setLeftPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(Math.max(pct, 20), 80));
    };
    const onMouseUp = () => { dragging.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(Math.max(pct, 20), 80));
    };
    const onTouchEnd = () => { dragging.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (!res.ok) { setError(data.error || '뉴스를 불러오지 못했어요.'); return; }
      setNewsItems(data.news);
      setCurrentIndex(0);
    } catch {
      setError('인터넷 연결을 확인해 주세요 🌐');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < newsItems.length - 1) setCurrentIndex((p) => p + 1);
    else fetchNews();
  }, [currentIndex, newsItems.length, fetchNews]);

  const currentNews = newsItems[currentIndex];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#FFF9F0' }}>

      {/* 배경 블롭 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-30" style={{ background: '#FFD6E0' }} />
        <div className="absolute top-10 -right-20 w-64 h-64 rounded-full opacity-25" style={{ background: '#B5E8FF' }} />
        <div className="absolute bottom-10 -left-16 w-56 h-56 rounded-full opacity-20" style={{ background: '#C8F5C8' }} />
        <div className="absolute -bottom-10 right-1/3 w-72 h-72 rounded-full opacity-20" style={{ background: '#FFE5A0' }} />
        <span className="absolute top-24 left-1/4 text-2xl opacity-20 rotate-12">⭐</span>
        <span className="absolute top-16 right-1/4 text-xl opacity-20 -rotate-12">❤️</span>
        <span className="absolute bottom-32 left-1/3 text-2xl opacity-15 rotate-6">✦</span>
        <span className="absolute bottom-20 right-1/4 text-xl opacity-20 -rotate-6">⭐</span>
      </div>

      {/* ── 헤더 ── */}
      <header className="relative z-10 flex-shrink-0" style={{ background: 'rgba(255,249,240,0.9)', backdropFilter: 'blur(8px)' }}>
        <div className="w-full px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image src="/whale.png" alt="포포" fill className="object-contain drop-shadow-md" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#F5A623' }}>포포와 함께하는</p>
              <h1 className="text-xl font-black leading-tight" style={{ color: '#2D2D2D' }}>
                포포가 궁금한 이야기
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-bold" style={{ color: '#AAAAAA' }}>
              🧒 아이와 함께 읽는 뉴스
            </span>
            <button
              onClick={fetchNews}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 font-extrabold text-white text-sm rounded-2xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: isLoading ? '#ccc' : '#F5A623' }}
            >
              {isLoading ? <><span className="animate-spin">⏳</span> 불러오는 중...</> : <><span>🔄</span> 새 이야기 시작</>}
            </button>
          </div>
        </div>
        <div className="w-full overflow-hidden" style={{ height: '14px' }}>
          <svg viewBox="0 0 1200 14" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C200,14 400,0 600,10 C800,20 1000,4 1200,10 L1200,14 L0,14 Z" fill="#FFE4B5" opacity="0.5" />
          </svg>
        </div>
      </header>

      {/* 에러 */}
      {error && (
        <div className="relative z-10 flex-shrink-0 mx-4 mt-2 p-3 rounded-2xl text-center border-2"
          style={{ background: '#FFF0F0', borderColor: '#FFAAAA' }}>
          <p className="font-bold text-sm" style={{ color: '#E05555' }}>{error}</p>
        </div>
      )}

      {/* ── 메인 2분할 (드래그 가능) ── */}
      <div ref={containerRef} className="relative z-10 flex flex-1 min-h-0 gap-0 px-4 pb-4 pt-3">

        {/* 왼쪽: 아이용 */}
        <div
          className="flex flex-col overflow-hidden rounded-3xl shadow-lg"
          style={{ width: `${leftPct}%`, background: 'rgba(255,255,255,0.88)' }}
        >
          {/* 패널 헤더 */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-t-3xl"
            style={{ background: '#FFE4B5' }}>
            <span className="text-base">🧒</span>
            <span className="font-extrabold text-sm" style={{ color: '#7A5200' }}>아이용 카드뉴스</span>
            {currentNews && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#F5A623', color: 'white' }}>
                {currentIndex + 1} / {newsItems.length}
              </span>
            )}
          </div>

          {/* 콘텐츠 영역 — flex-1 min-h-0 으로 CardNewsViewer가 h-full을 사용 가능 */}
          <div className="flex-1 min-h-0 p-3 flex flex-col">

            {isLoading && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <div className="relative w-20 h-20">
                  <Image src="/whale.png" alt="포포" fill className="object-contain animate-bounce" />
                </div>
                <p className="font-extrabold text-sm" style={{ color: '#F5A623' }}>포포가 뉴스를 찾고 있어요!</p>
                <p className="text-xs text-gray-400">잠깐만 기다려 주세요 🌊</p>
              </div>
            )}

            {!isLoading && !currentNews && !error && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-4">
                <div className="relative w-28 h-28">
                  <Image src="/whale.png" alt="포포" fill className="object-contain" />
                </div>
                <p className="text-base font-extrabold" style={{ color: '#2D2D2D' }}>안녕! 나는 포포야 🐋</p>
                <p className="text-sm text-gray-400 leading-relaxed">오늘 무슨 일이 있었는지<br />같이 알아볼까요?</p>
                <button
                  onClick={fetchNews}
                  className="px-6 py-3 font-extrabold text-white text-sm rounded-2xl shadow-md transition-all hover:scale-105"
                  style={{ background: '#F5A623' }}
                >
                  🌊 이야기 시작하기
                </button>
              </div>
            )}

            {!isLoading && currentNews && (
              <div className="flex-1 min-h-0">
                <CardNewsViewer
                  key={currentNews.id}
                  news={currentNews}
                  newsIndex={currentIndex}
                  totalNews={newsItems.length}
                  onNext={handleNext}
                  isLastNews={currentIndex === newsItems.length - 1}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 드래그 구분선 ── */}
        <div
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
          className="flex-shrink-0 flex items-center justify-center cursor-col-resize group select-none"
          style={{ width: '14px' }}
          title="드래그로 크기 조절"
        >
          <div className="w-1.5 h-16 rounded-full transition-all duration-150 group-hover:h-24 group-active:h-24"
            style={{ background: dragging.current ? '#F5A623' : '#D1D5DB' }}
          />
        </div>

        {/* 오른쪽: 원문 기사 */}
        <div
          className="flex flex-col overflow-hidden rounded-3xl shadow-lg"
          style={{ width: `${100 - leftPct}%`, background: 'rgba(255,255,255,0.88)' }}
        >
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-t-3xl"
            style={{ background: '#D6EEFF' }}>
            <span className="text-base">👨‍👩‍👧</span>
            <span className="font-extrabold text-sm" style={{ color: '#1A5276' }}>부모님용 원문 기사</span>
          </div>

          {!currentNews ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300">
              <span className="text-5xl">🗞️</span>
              <p className="text-sm">원문 기사가 여기에 표시됩니다</p>
            </div>
          ) : (
            <iframe
              key={currentNews.id}
              src={`/api/proxy?url=${encodeURIComponent(currentNews.originalUrl)}`}
              className="flex-1 w-full border-none rounded-b-3xl"
              title="원문 기사"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </div>
      </div>
    </div>
  );
}
