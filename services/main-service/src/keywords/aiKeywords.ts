/**
 * Manual keyword/phrase matcher for "is this article about AI or an
 * AI-adjacent topic (chips, GPUs, semiconductors, etc.)?"
 *
 * This is the ALWAYS-AVAILABLE fallback — it runs with zero API keys and
 * zero cost. When OPENAI_API_KEY is configured, services/newsAggregator/
 * aiFilter.ts prefers an AI-assisted classification instead, but always
 * falls back to this list on any failure so the site never breaks or
 * shows an error because of a missing/failed AI call.
 *
 * Grouped for maintainability; each group also maps to a Category slug
 * in categoryMapper.ts so matched articles get auto-tagged.
 */

export const KEYWORD_GROUPS: Record<string, string[]> = {
  "artificial-intelligence": [
    "artificial intelligence",
    "ai model",
    "ai system",
    "generative ai",
    "genai",
    "agi",
    "artificial general intelligence",
    "foundation model",
    "frontier model",
    "multimodal model",
    "ai agent",
    "autonomous agent",
    "ai assistant",
    "chatbot",
    "prompt engineering",
    "ai alignment",
    "ai safety",
    "ai ethics",
    "ai hallucination",
  ],
  "machine-learning": [
    "machine learning",
    "deep learning",
    "neural network",
    "transformer model",
    "large language model",
    "llm",
    "language model",
    "diffusion model",
    "computer vision",
    "natural language processing",
    "nlp",
    "reinforcement learning",
    "supervised learning",
    "unsupervised learning",
    "fine-tuning",
    "fine tuning",
    "model training",
    "pretraining",
    "pre-training",
    "model weights",
    "open weight model",
    "open-weight model",
    "mixture of experts",
    "retrieval augmented generation",
    "rag pipeline",
    "embedding model",
    "vector database",
    "model quantization",
    "model distillation",
    "benchmark suite",
    "gpt",
    "text-to-image",
    "text-to-video",
    "speech recognition model",
  ],
  gpus: [
    "gpu",
    "graphics processing unit",
    "graphics card",
    "nvidia",
    "geforce",
    "radeon",
    "cuda",
    "tensor core",
    "data center gpu",
    "ai accelerator",
    "hardware accelerator",
    "inference chip",
    "training cluster",
    "compute cluster",
    "hbm memory",
    "high bandwidth memory",
    "gpu shortage",
    "gpu cluster",
  ],
  "semiconductors-chips": [
    "semiconductor",
    "chip design",
    "chipmaker",
    "chip fabrication",
    "foundry",
    "wafer",
    "silicon wafer",
    "fab plant",
    "chip factory",
    "asic",
    "fpga",
    "npu",
    "neural processing unit",
    "tpu",
    "tensor processing unit",
    "system-on-chip",
    "soc chip",
    "3nm",
    "5nm",
    "2nm",
    "advanced node",
    "chip shortage",
    "export controls chip",
    "tsmc",
    "intel foundry",
    "samsung foundry",
    "arm holdings",
    "qualcomm",
    "broadcom",
    "amd",
    "sk hynix",
    "micron",
    "cerebras",
    "groq chip",
    "chip export",
    "euv lithography",
    "extreme ultraviolet lithography",
    "chip packaging",
    "wafer fab equipment",
  ],
  robotics: [
    "robotics",
    "humanoid robot",
    "autonomous robot",
    "embodied ai",
    "robot arm",
    "warehouse robot",
    "autonomous vehicle",
    "self-driving",
    "self driving car",
    "robotaxi",
  ],
  "ai-policy-regulation": [
    "ai regulation",
    "ai policy",
    "ai governance",
    "ai act",
    "export control",
    "national security chip",
    "ai executive order",
    "ai legislation",
    "ai safety institute",
    "chip sanctions",
  ],
  "startups-funding": [
    "ai startup",
    "chip startup",
    "series a funding",
    "series b funding",
    "series c funding",
    "venture capital ai",
    "ai funding round",
    "ai unicorn",
  ],
  "research-papers": [
    "arxiv preprint",
    "research paper ai",
    "published a paper",
    "study finds ai",
    "researchers propose",
    "novel architecture",
  ],
  "big-tech": [
    "openai",
    "anthropic",
    "deepmind",
    "google deepmind",
    "meta ai",
    "microsoft ai",
    "amazon ai",
    "apple intelligence",
    "xai",
    "mistral ai",
    "cohere ai",
    "stability ai",
    "hugging face",
  ],
  "data-centers-cloud": [
    "data center",
    "datacenter",
    "hyperscaler",
    "cloud computing ai",
    "ai infrastructure",
    "compute capacity",
    "power grid data center",
    "liquid cooling",
    "ai supercomputer",
  ],
};

/** Flat set of every keyword/phrase across all groups, lowercased. */
export const ALL_KEYWORDS: string[] = Array.from(
  new Set(Object.values(KEYWORD_GROUPS).flat().map((k) => k.toLowerCase()))
);

/**
 * Returns which category slugs a piece of text matches, and the specific
 * keywords that matched (deduped), based on whole-phrase, case-insensitive
 * substring matching. Word-boundary-safe for single words (avoids "chip"
 * matching inside "chipmunk") but phrase-based for multi-word terms.
 */
export function matchKeywords(text: string): { matchedKeywords: string[]; categorySlugs: string[] } {
  const lower = text.toLowerCase();
  const matchedKeywords = new Set<string>();
  const categorySlugs = new Set<string>();

  for (const [categorySlug, keywords] of Object.entries(KEYWORD_GROUPS)) {
    for (const keyword of keywords) {
      const isSingleWord = !keyword.includes(" ") && !keyword.includes("-");
      const found = isSingleWord
        ? new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i").test(lower)
        : lower.includes(keyword.toLowerCase());

      if (found) {
        matchedKeywords.add(keyword);
        categorySlugs.add(categorySlug);
      }
    }
  }

  return { matchedKeywords: Array.from(matchedKeywords), categorySlugs: Array.from(categorySlugs) };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A compact query string built from the highest-signal keywords, used to narrow queryable source APIs (NewsAPI, GNews, etc.) before the full filter runs as a second pass. */
export const SEARCH_QUERY_TERMS = [
  "artificial intelligence",
  "machine learning",
  "large language model",
  "GPU",
  "semiconductor chip",
  "AI chip",
  "OpenAI",
  "Nvidia",
  "generative AI",
].join(" OR ");
