export type NewsSourceType =
  | "NEWSAPI"
  | "GNEWS"
  | "NEWSDATA"
  | "MEDIASTACK"
  | "GUARDIAN"
  | "HACKERNEWS"
  | "ARXIV"
  | "REDDIT"
  | "RSS"
  | "CURRENTS"
  | "GDELT"
  | "GOOGLE_NEWS"
  | "BING_NEWS";

export type RawArticle = {
  title: string;
  summary: string;
  content?: string;
  url: string;
  imageUrl?: string;
  author?: string;
  sourceName: string;
  sourceType: NewsSourceType;
  publishedAt: Date;
};

export type SourceFetchResult = {
  sourceType: NewsSourceType;
  articles: RawArticle[];
  success: boolean;
  errorMessage?: string;
};
