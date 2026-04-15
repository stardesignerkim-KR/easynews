import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SEARCH_QUERIES = ['환경', '문화', '동물', '건강', '축제', '영화', '스포츠', '여행'];
const EXCLUDE_KEYWORDS = ['범죄', '사망', '폭력', '전쟁', '사고', '살인', '강도', '마약'];

interface NaverArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").trim();
}

async function fetchNaverNews(): Promise<{ query: string; article: NaverArticle }[]> {
  const results: { query: string; article: NaverArticle }[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const res = await fetch(
        `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=5&sort=date`,
        {
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
          },
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const filtered = (data.items as NaverArticle[]).filter((item) => {
        const text = stripHtml(item.title + item.description);
        return !EXCLUDE_KEYWORDS.some((kw) => text.includes(kw));
      });

      if (filtered.length > 0) {
        results.push({ query, article: filtered[0] });
      }
    } catch {
      continue;
    }
  }

  return results.slice(0, 8);
}

async function transformWithClaude(articles: { query: string; article: NaverArticle }[]) {
  const articleList = articles
    .map((a, i) => `[${i + 1}] 제목: ${stripHtml(a.article.title)}\n내용: ${stripHtml(a.article.description)}`)
    .join('\n\n');

  const prompt = `다음 뉴스 기사들을 특수교육 대상 아동(초등학교 저학년 수준)을 위해 변환해주세요.

뉴스 목록:
${articleList}

아래 JSON 형식으로만 반환하세요 (다른 텍스트 없이):
{
  "news": [
    {
      "headline": "5단어 이내 쉬운 한국어 제목",
      "slides": [
        {
          "text": "쉬운 말로 된 짧은 1문장 (20자 이내)",
          "imageKeyword": "simple english keyword for photo search (1-3 words)"
        }
      ],
      "thumbnailKeyword": "simple english keyword for photo search (1-3 words)"
    }
  ]
}

규칙:
- 헤드라인: 5단어 이내, 쉬운 말, 명사형 마무리
- 슬라이드: 각 기사당 3~5개, 1문장씩, 20자 이내
- 어려운 단어 사용 금지, 밝고 긍정적인 내용만
- imageKeyword와 thumbnailKeyword는 반드시 영어로, Pixabay 검색에 적합한 1~3개 단어`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude 응답 파싱 실패');

  return JSON.parse(jsonMatch[0]);
}

async function fetchPixabayImage(keyword: string): Promise<string> {
  const base = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&per_page=5&safesearch=true&lang=en&min_width=400`;

  for (const imageType of ['illustration', 'vector', 'all']) {
    try {
      const res = await fetch(`${base}&image_type=${imageType}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.hits && data.hits.length > 0) {
        const pick = data.hits[Math.floor(Math.random() * Math.min(data.hits.length, 5))];
        return pick.webformatURL;
      }
    } catch {
      continue;
    }
  }
  return '';
}

// 네이버 기사 페이지에서 OG 이미지 추출
async function fetchArticleOgImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return '';
    const html = await res.text();

    // og:image 태그 추출 (속성 순서 무관)
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    return match ? match[1] : '';
  } catch {
    return '';
  }
}

export async function GET() {
  try {
    const articles = await fetchNaverNews();

    if (articles.length < 4) {
      return NextResponse.json(
        { error: '충분한 뉴스를 가져오지 못했어요. 잠시 후 다시 눌러주세요.' },
        { status: 503 }
      );
    }

    const transformed = await transformWithClaude(articles);

    // Pixabay 이미지 + 네이버 OG 이미지 병렬로 가져오기
    const newsItems = await Promise.all(
      transformed.news.map(async (item: {
        headline: string;
        thumbnailKeyword: string;
        slides: { text: string; imageKeyword: string }[];
      }, index: number) => {
        const articleUrl = articles[index]?.article?.link || '';

        const [thumbnailUrl, originalImageUrl, ...slideUrls] = await Promise.all([
          fetchPixabayImage(item.thumbnailKeyword || 'news'),
          fetchArticleOgImage(articleUrl),
          ...item.slides.map((slide: { text: string; imageKeyword: string }) =>
            fetchPixabayImage(slide.imageKeyword || 'children')
          ),
        ]);

        return {
          id: `news-${Date.now()}-${index}`,
          headline: item.headline,
          thumbnail: thumbnailUrl,
          thumbnailPrompt: item.thumbnailKeyword,
          slides: item.slides.map((slide: { text: string; imageKeyword: string }, si: number) => ({
            text: slide.text,
            imagePrompt: slide.imageKeyword,
            imageUrl: slideUrls[si] || '',
          })),
          originalUrl: articleUrl,
          originalTitle: stripHtml(articles[index]?.article?.title || ''),
          originalDescription: stripHtml(articles[index]?.article?.description || ''),
          originalPubDate: articles[index]?.article?.pubDate || '',
          originalImageUrl: originalImageUrl || '',
          createdAt: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ news: newsItems });
  } catch (error) {
    console.error('뉴스 오류:', error);
    return NextResponse.json(
      { error: '뉴스를 불러오는 중 오류가 발생했어요. 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
