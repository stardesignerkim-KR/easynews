'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { NewsItem } from '@/types/news';

interface Props {
  news: NewsItem;
  onClose: () => void;
}

export default function CardNewsViewer({ news, onClose }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const totalSlides = news.slides.length;

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
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [stopSpeaking]);

  useEffect(() => {
    stopSpeaking();
    setCurrentSlide(0);
  }, [news, stopSpeaking]);

  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  const goPrev = () => {
    stopSpeaking();
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const goNext = () => {
    stopSpeaking();
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const slide = news.slides[currentSlide];
  const fallbackBg = ['bg-sky-200', 'bg-green-200', 'bg-yellow-200', 'bg-pink-200', 'bg-purple-200'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">

        {/* 헤더 */}
        <div className="bg-yellow-400 px-5 py-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-800 leading-tight line-clamp-1">
            {news.headline}
          </h2>
          <button
            onClick={onClose}
            className="ml-2 text-2xl font-bold text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0"
            aria-label="홈으로"
          >
            🏠
          </button>
        </div>

        {/* 슬라이드 이미지 */}
        <div className="relative w-full aspect-[16/9]">
          {!imgError[currentSlide] ? (
            <Image
              src={slide.imageUrl}
              alt={slide.text}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImgError((prev) => ({ ...prev, [currentSlide]: true }))}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-6xl ${fallbackBg[currentSlide % fallbackBg.length]}`}>
              🌟
            </div>
          )}
          {/* 슬라이드 번호 */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>

        {/* 텍스트 + TTS */}
        <div className="px-5 py-4 flex items-center gap-3 min-h-[80px]">
          <button
            onClick={() => isSpeaking ? stopSpeaking() : speak(slide.text)}
            className={`flex-shrink-0 w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isSpeaking
                ? 'bg-red-400 hover:bg-red-500 animate-pulse'
                : 'bg-blue-400 hover:bg-blue-500'
            }`}
            aria-label={isSpeaking ? '읽기 중지' : '읽어주기'}
          >
            {isSpeaking ? '⏹' : '🔊'}
          </button>
          <p className="text-gray-800 text-lg font-semibold leading-relaxed flex-1">
            {slide.text}
          </p>
        </div>

        {/* 네비게이션 */}
        <div className="px-5 pb-5 flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="flex-1 py-3 rounded-2xl text-base font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            ← 이전
          </button>

          {/* 슬라이드 점 */}
          <div className="flex gap-1.5">
            {news.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { stopSpeaking(); setCurrentSlide(i); }}
                className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none ${
                  i === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-gray-300'
                }`}
                aria-label={`${i + 1}번 슬라이드`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentSlide === totalSlides - 1}
            className="flex-1 py-3 rounded-2xl text-base font-bold bg-yellow-400 text-gray-800 hover:bg-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
}
