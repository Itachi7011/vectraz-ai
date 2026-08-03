const POSITIVE_TERMS = [
  "breakthrough", "record profit", "surges", "soars", "raises funding", "secures funding",
  "unveils", "outperforms", "beats expectations", "partnership", "expands", "milestone",
  "achieves", "boosts", "wins", "approval", "success", "growth", "leads", "innovative",
  "record high", "strong demand", "upgraded", "acquires", "backed by", "valuation jumps",
];

const NEGATIVE_TERMS = [
  "layoffs", "lawsuit", "recall", "decline", "banned", "crash", "plunges", "misses expectations",
  "shortage", "delay", "delayed", "scandal", "breach", "hack", "vulnerability", "outage",
  "investigation", "fine", "sues", "sued", "cuts jobs", "shuts down", "bankruptcy", "warns",
  "downgraded", "falls short", "controversy", "backlash", "restricted", "export ban", "tariff",
];

export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export function classifySentiment(title: string, summary: string): SentimentLabel {
  const text = `${title} ${summary}`.toLowerCase();

  let posScore = 0;
  let negScore = 0;
  for (const term of POSITIVE_TERMS) if (text.includes(term)) posScore++;
  for (const term of NEGATIVE_TERMS) if (text.includes(term)) negScore++;

  if (posScore === negScore) return "NEUTRAL";
  return posScore > negScore ? "POSITIVE" : "NEGATIVE";
}
