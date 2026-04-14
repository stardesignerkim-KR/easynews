export interface NewsSlide {
  text: string;
  imageUrl: string;
  imagePrompt: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  thumbnail: string;
  thumbnailPrompt: string;
  slides: NewsSlide[];
  originalUrl: string;
  createdAt: string;
}
