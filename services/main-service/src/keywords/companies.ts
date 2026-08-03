export type CompanyConfig = {
  slug: string;
  name: string;
  domain: string; // used to fetch a free logo via Clearbit's logo API
  aliases: string[]; // case-insensitive match terms against title/summary
};

export const COMPANIES: CompanyConfig[] = [
  { slug: "nvidia", name: "NVIDIA", domain: "nvidia.com", aliases: ["nvidia", "geforce", "cuda"] },
  { slug: "amd", name: "AMD", domain: "amd.com", aliases: ["amd", "radeon", "ryzen ai"] },
  { slug: "intel", name: "Intel", domain: "intel.com", aliases: ["intel", "intel foundry"] },
  { slug: "tsmc", name: "TSMC", domain: "tsmc.com", aliases: ["tsmc", "taiwan semiconductor"] },
  { slug: "openai", name: "OpenAI", domain: "openai.com", aliases: ["openai", "chatgpt", "gpt-4", "gpt-5"] },
  { slug: "anthropic", name: "Anthropic", domain: "anthropic.com", aliases: ["anthropic", "claude"] },
  { slug: "google-deepmind", name: "Google DeepMind", domain: "deepmind.google", aliases: ["deepmind", "google deepmind", "gemini"] },
  { slug: "meta-ai", name: "Meta AI", domain: "meta.com", aliases: ["meta ai", "llama model", "meta platforms"] },
  { slug: "microsoft", name: "Microsoft", domain: "microsoft.com", aliases: ["microsoft", "copilot", "azure ai"] },
  { slug: "qualcomm", name: "Qualcomm", domain: "qualcomm.com", aliases: ["qualcomm", "snapdragon"] },
  { slug: "broadcom", name: "Broadcom", domain: "broadcom.com", aliases: ["broadcom"] },
  { slug: "samsung", name: "Samsung", domain: "samsung.com", aliases: ["samsung", "samsung foundry"] },
  { slug: "arm", name: "Arm", domain: "arm.com", aliases: ["arm holdings", "arm chip"] },
  { slug: "xai", name: "xAI", domain: "x.ai", aliases: ["xai", "grok"] },
  { slug: "mistral-ai", name: "Mistral AI", domain: "mistral.ai", aliases: ["mistral ai", "mistral model"] },
  { slug: "hugging-face", name: "Hugging Face", domain: "huggingface.co", aliases: ["hugging face"] },
  { slug: "cerebras", name: "Cerebras", domain: "cerebras.net", aliases: ["cerebras"] },
  { slug: "micron", name: "Micron", domain: "micron.com", aliases: ["micron"] },
];

export function findCompany(slug: string): CompanyConfig | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
