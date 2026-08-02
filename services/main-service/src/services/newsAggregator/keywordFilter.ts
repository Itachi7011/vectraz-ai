import { matchKeywords } from "../../keywords/aiKeywords";

export type FilterResult = {
  isRelevant: boolean;
  matchedKeywords: string[];
  categorySlugs: string[];
  confidence: number; // 0-1, heuristic: more matched keywords = higher confidence
  method: "keyword" | "openai";
};

export function keywordFilter(title: string, summary: string): FilterResult {
  const { matchedKeywords, categorySlugs } = matchKeywords(`${title} ${summary}`);
  const isRelevant = matchedKeywords.length > 0;
  // Simple heuristic confidence: caps at 0.9 so it never claims to be as
  // certain as a genuine AI-assisted classification would be.
  const confidence = Math.min(0.9, 0.4 + matchedKeywords.length * 0.1);

  return {
    isRelevant,
    matchedKeywords,
    categorySlugs,
    confidence: isRelevant ? confidence : 0,
    method: "keyword",
  };
}
