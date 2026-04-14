'use client';

import { NewsItem } from '@/types/news';
import Image from 'next/image';

interface Props {
  news: NewsItem;
  onClick: (news: NewsItem) => void;
}

export default function NewsCard({ news, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(news)}
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white"
    >
      <Image
        src={news.thumbnail}
        alt={news.headline}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm md:text-base lg:text-lg leading-snug drop-shadow-lg line-clamp-2">
          {news.headline}
        </p>
      </div>
    </button>
  );
}
