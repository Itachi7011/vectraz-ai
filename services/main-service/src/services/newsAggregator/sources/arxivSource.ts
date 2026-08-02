import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import type { SourceFetchResult, RawArticle } from "../types";

const xmlParser = new XMLParser({ ignoreAttributes: false });

// arXiv categories: cs.AI (Artificial Intelligence), cs.LG (Machine
// Learning), cs.CL (Computation & Language / NLP), cs.AR (Hardware Arch.)
const ARXIV_QUERY = "cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL+OR+cat:cs.AR";

export async function fetchArxiv(): Promise<SourceFetchResult> {
  try {
    const { data } = await axios.get("http://export.arxiv.org/api/query", {
      params: {
        search_query: ARXIV_QUERY,
        sortBy: "submittedDate",
        sortOrder: "descending",
        max_results: 30,
      },
      timeout: 12_000,
      responseType: "text",
    });

    const parsed = xmlParser.parse(data);
    const feedEntries = parsed?.feed?.entry;
    const entries: any[] = Array.isArray(feedEntries) ? feedEntries : feedEntries ? [feedEntries] : [];

    const articles: RawArticle[] = entries
      .filter((e) => e.title && e.id)
      .map((e) => ({
        title: cleanText(e.title),
        summary: cleanText(e.summary ?? e.title).slice(0, 500),
        url: typeof e.id === "string" ? e.id : e.id?.["#text"],
        author: Array.isArray(e.author) ? cleanText(e.author[0]?.name) : cleanText(e.author?.name ?? ""),
        sourceName: "arXiv",
        sourceType: "ARXIV" as const,
        publishedAt: e.published ? new Date(e.published) : new Date(),
      }));

    return { sourceType: "ARXIV", articles, success: true };
  } catch (err: any) {
    return { sourceType: "ARXIV", articles: [], success: false, errorMessage: err?.message };
  }
}

function cleanText(v: unknown): string {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}
