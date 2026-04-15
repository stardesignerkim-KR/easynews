'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsItem } from '@/types/news';

interface Props {
  news: NewsItem;
  newsIndex: number;
  totalNews: number;
  onNext: () => void;
  isLastNews: boolean;
}

export default function CardNewsViewer({ news, newsIndex, totalNews, onNext, isLastNews }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const totalSlides = news.slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.85;
    utterance.pitch = 1.2;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [stopSpeaking]);

  useEffect(() => {
    stopSpeaking();
    setCurrentSlide(0);
    setImgError({});
  }, [news, stopSpeaking]);

  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const goPrev = () => { stopSpeaking(); setCurrentSlide((p) => Math.max(p - 1, 0)); };
  const goNext = () => { stopSpeaking(); setCurrentSlide((p) => Math.min(p + 1, totalSlides - 1)); };
  const handleNextNews = () => { stopSpeaking(); onNext(); };

  const safeIndex = Math.min(currentSlide, news.slides.length - 1);
  const slide = news.slides[safeIndex];
  if (!slide) return null;

  const themes = [
    { bg: '#FFF3D6', accent: '#F5A623' },
    { bg: '#D6F0FF', accent: '#3AABDE' },
    { bg: '#FFD6E8', accent: '#E8609A' },
    { bg: '#D6FFE8', accent: '#2ECC71' },
    { bg: '#EFD6FF', accent: '#9B59B6' },
  ];
  const theme = themes[safeIndex % themes.length];

  // newsIndex, totalNews 사용 (lint 경고 방지)
  void newsIndex; void totalNews;

  return (
    /* h-full + flex col: 부모 높이를 꽉 채우고, 버튼은 항상 하단 고정 */
    <div className="flex flex-col h-full rounded-3xl overflow-hidden" style={{ background: '#FFFDF8' }}>

      {/* ── 이미지 (flex-1: 남은 공간 모두 차지, 버튼은 밀려나지 않음) ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden" style={{ background: theme.bg }}>
        {!imgError[safeIndex] && slide.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt={slide.text}
            className="w-full h-full object-cover"
            onError={() => setImgError((p) => ({ ...p, [safeIndex]: true }))}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌟</div>
        )}

        {/* 슬라이드 번호 뱃지 */}
        <div className="absolute top-3 right-3 text-xs font-extrabold text-white px-2.5 py-1 rounded-full shadow"
          style={{ background: theme.accent }}>
          {safeIndex + 1} / {totalSlides}
        </div>

        {/* 헤드라인 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
          <p className="text-white font-extrabold text-sm leading-snug drop-shadow">
            {news.headline}
          </p>
        </div>
      </div>

      {/* ── 텍스트 + TTS (고정 높이) ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-2 mx-3 mt-3 rounded-2xl"
        style={{ background: theme.bg }}>
        <button
          onClick={() => isSpeaking ? stopSpeaking() : speak(slide.text)}
          className="flex-shrink-0 w-10 h-10 rounded-full text-lg flex items-center justify-center shadow transition-all hover:scale-110 active:scale-95"
          style={{ background: isSpeaking ? '#FF6B6B' : theme.accent }}
          aria-label={isSpeaking ? '읽기 중지' : '읽어주기'}
        >
          {isSpeaking ? '⏹' : '🔊'}
        </button>
        <p className="text-gray-800 text-sm font-bold leading-relaxed flex-1 line-clamp-2">
          {slide.text}
        </p>
      </div>

      {/* ── 슬라이드 점 (고정 높이) ── */}
      <div className="flex-shrink-0 flex justify-center gap-2 py-2">
        {news.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { stopSpeaking(); setCurrentSlide(i); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === safeIndex ? '20px' : '8px',
              height: '8px',
              background: i === safeIndex ? theme.accent : '#D1D5DB',
            }}
            aria-label={`${i + 1}번 슬라이드`}
          />
        ))}
      </div>

      {/* ── 이전 / 다음 버튼 (항상 하단 고정) ── */}
      <div className="flex-shrink-0 flex gap-2 px-3 pb-3">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: '#F0F0F0', color: '#555' }}
        >
          ← 이전
        </button>

        {isLastSlide ? (
          <button
            onClick={handleNextNews}
            className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{ background: '#2ECC71' }}
          >
            {isLastNews ? '🔄 새 이야기' : '다음 이야기 →'}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{ background: theme.accent }}
          >
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}
