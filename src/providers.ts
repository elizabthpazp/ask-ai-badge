import type {
  AskAiMessages,
  AskAiProvider,
  BuiltInProviderId,
} from "./types";

/**
 * Verified prefill URL formats (2026):
 * - ChatGPT:    https://chatgpt.com/?q=PROMPT
 * - Claude:     copy handoff → https://claude.ai/new (link ?q= shows a red banner)
 * - Gemini:     Google AI Mode (Gemini-powered) → https://www.google.com/search?udm=50&q=PROMPT
 *               + clipboard backup (Google sometimes drops ?q= booting AI Mode)
 *               (gemini.google.com/app ignores ?q= — no native prefill exists)
 * - Google:     https://www.google.com/search?q=PROMPT (AI Mode / AI Overviews)
 * - Perplexity: https://www.perplexity.ai/search?q=PROMPT
 * - Grok:       https://grok.com/?q=PROMPT
 */
export const BUILT_IN_BASE_URLS: Record<BuiltInProviderId, string> = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
  gemini: "https://www.google.com/search?udm=50",
  google: "https://www.google.com/search",
  perplexity: "https://www.perplexity.ai/search",
  grok: "https://grok.com/",
};

export const BUILT_IN_LABELS: Record<BuiltInProviderId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  google: "Google",
  perplexity: "Perplexity",
  grok: "Grok",
};

export const DEFAULT_PROVIDER_ORDER: BuiltInProviderId[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "grok",
];

/** Default prefill per built-in (everything else uses "link"). */
const PREFILL_BY_DEFAULT: Record<string, "copy" | "both"> = {
  // Link prefill + clipboard backup (banner-proof and paste-ready).
  claude: "both",
  // Google sometimes drops ?q= while booting AI Mode → link + clipboard backup.
  gemini: "both",
};

/** Build a final https URL for a provider + prompt. */
export function buildProviderUrl(
  provider: Pick<
    AskAiProvider,
    "href" | "baseUrl" | "queryParam" | "buildUrl" | "prefill"
  >,
  prompt: string
): string {
  if (provider.buildUrl) return provider.buildUrl(prompt);
  if (provider.href) return provider.href;
  const base = provider.baseUrl ?? "https://chatgpt.com/";
  // "copy" providers open the plain app URL — a ?q= would do nothing there.
  // "both" keeps the URL prefill AND copies as backup.
  if (provider.prefill === "copy") return base;
  const param = provider.queryParam ?? "q";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${param}=${encodeURIComponent(prompt)}`;
}

/** Copy text to the clipboard (Clipboard API + textarea fallback). SSR-safe. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    const nav =
      typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy method */
  }
  try {
    if (typeof document === "undefined") return false;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return !!ok;
  } catch {
    return false;
  }
}

/** Resolve the `providers` prop into a concrete list (applies labels/baseUrls overrides). */
export function resolveProviders(
  input:
    | Array<BuiltInProviderId | AskAiProvider>
    | undefined,
  overrides?: {
    labels?: Partial<Record<string, string>>;
    baseUrls?: Partial<Record<string, string>>;
  }
): AskAiProvider[] {
  const list = input ?? DEFAULT_PROVIDER_ORDER;
  return list
    .map((p): AskAiProvider => {
      if (typeof p === "string") {
        return {
          id: p,
          label: overrides?.labels?.[p] ?? BUILT_IN_LABELS[p as BuiltInProviderId] ?? p,
          baseUrl:
            overrides?.baseUrls?.[p] ?? BUILT_IN_BASE_URLS[p as BuiltInProviderId],
          queryParam: "q",
          prefill: PREFILL_BY_DEFAULT[p] ?? "link",
        };
      }
      const id = p.id;
      const builtInBase =
        BUILT_IN_BASE_URLS[id as BuiltInProviderId];
      const builtInLabel =
        BUILT_IN_LABELS[id as BuiltInProviderId];
      return {
        queryParam: "q",
        prefill: PREFILL_BY_DEFAULT[id] ?? "link",
        ...p,
        label:
          p.label ??
          overrides?.labels?.[id] ??
          builtInLabel ??
          id,
        baseUrl:
          p.baseUrl ?? overrides?.baseUrls?.[id] ?? builtInBase,
      };
    })
    .filter((p) => !p.hidden);
}

/** Resolve `{productName}` / `{productUrl}` / `{provider}` placeholders. */
export function interpolate(
  template: string,
  ctx: { productName: string; productUrl?: string; provider?: string }
): string {
  return template
    .replaceAll("{productName}", ctx.productName)
    .replaceAll("{productUrl}", ctx.productUrl ?? "")
    .replaceAll("{provider}", ctx.provider ?? "");
}

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = ["en", "es", "fr", "de", "pt", "it"] as const;

type LocaleDict = Required<AskAiMessages>;

const EN_PROMPT = `What is **{productName}**? Please explain what it is, who it is for, and what its main features are.{productUrlLine}`;

export const LOCALE_MESSAGES: Record<string, LocaleDict> = {
  en: {
    title: "Ask AI about {productName}",
    subtitle: "",
    disclaimer: "AI answers may vary. Verify important facts.",
    promptTemplate: EN_PROMPT,
    summarizeTemplate:
      "Summarize the key highlights from **{productName}**'s official website:\n{productUrl}",
    askTemplate: "Ask {provider} about {productName}",
    copiedHint: "Prompt copied — paste it into the AI (Ctrl+V).",
  },
  es: {
    title: "Pregunta a la IA sobre {productName}",
    subtitle: "",
    disclaimer:
      "Las respuestas de la IA pueden variar. Verifica los datos importantes.",
    promptTemplate: `¿Qué es **{productName}**? Explica qué es, para quién está diseñado y cuáles son sus características principales.{productUrlLine}`,
    summarizeTemplate:
      "Resume los puntos clave del sitio web oficial de **{productName}**:\n{productUrl}",
    askTemplate: "Pregunta a {provider} sobre {productName}",
    copiedHint: "Prompt copiado — pégalo en la IA (Ctrl+V).",
  },
  fr: {
    title: "Interrogez l'IA sur {productName}",
    subtitle: "",
    disclaimer:
      "Les réponses de l'IA peuvent varier. Vérifiez les informations importantes.",
    promptTemplate: `Parlez-moi de **{productName}**. Qu'est-ce que c'est, à qui cela s'adresse-t-il et quelles sont ses principales caractéristiques ?{productUrlLine}`,
    summarizeTemplate:
      "Résumez les points clés du site officiel de **{productName}** :\n{productUrl}",
    askTemplate: "Interrogez {provider} sur {productName}",
    copiedHint: "Prompt copié — collez-le dans l’IA (Ctrl+V).",
  },
  de: {
    title: "Frag die KI über {productName}",
    subtitle: "",
    disclaimer:
      "KI-Antworten können variieren. Bitte prüfe wichtige Fakten.",
    promptTemplate: `Erzähle mir von **{productName}**. Was ist es, für wen ist es gedacht und was sind die wichtigsten Funktionen?{productUrlLine}`,
    summarizeTemplate:
      "Fasse die wichtigsten Highlights der offiziellen Website von **{productName}** zusammen:\n{productUrl}",
    askTemplate: "Frag {provider} über {productName}",
    copiedHint: "Prompt kopiert — in der KI einfügen (Strg+V).",
  },
  pt: {
    title: "Pergunte à IA sobre {productName}",
    subtitle: "",
    disclaimer:
      "As respostas da IA podem variar. Verifique informações importantes.",
    promptTemplate: `Fale-me sobre **{productName}**. O que é, para quem é e quais são as suas principais características?{productUrlLine}`,
    summarizeTemplate:
      "Resuma os principais destaques do site oficial de **{productName}**:\n{productUrl}",
    askTemplate: "Pergunte a {provider} sobre {productName}",
    copiedHint: "Prompt copiado — cole na IA (Ctrl+V).",
  },
  it: {
    title: "Chiedi all'IA di {productName}",
    subtitle: "",
    disclaimer:
      "Le risposte dell'IA possono variare. Verifica i fatti importanti.",
    promptTemplate: `Parlami di **{productName}**. Cos'è, per chi è pensato e quali sono le sue caratteristiche principali?{productUrlLine}`,
    summarizeTemplate:
      "Riassumi i punti salienti del sito ufficiale di **{productName}**:\n{productUrl}",
    askTemplate: "Chiedi a {provider} di {productName}",
    copiedHint: "Prompt copiato — incollalo nell’IA (Ctrl+V).",
  },
};

/** Get the message dict for a locale (unknown codes fall back to English), merged with overrides. */
export function getMessages(
  locale: string | undefined,
  overrides?: AskAiMessages
): LocaleDict {
  const base =
    LOCALE_MESSAGES[(locale ?? "").toLowerCase()] ??
    LOCALE_MESSAGES[DEFAULT_LOCALE];
  if (!overrides) return base;
  return {
    title: overrides.title ?? base.title,
    subtitle: overrides.subtitle ?? base.subtitle,
    disclaimer: overrides.disclaimer ?? base.disclaimer,
    promptTemplate: overrides.promptTemplate ?? base.promptTemplate,
    summarizeTemplate: overrides.summarizeTemplate ?? base.summarizeTemplate,
    askTemplate: overrides.askTemplate ?? base.askTemplate,
    copiedHint: overrides.copiedHint ?? base.copiedHint,
  };
}

/** Default English brief (kept for backwards compatibility). */
export const DEFAULT_PROMPT_TEMPLATE = EN_PROMPT;

function expandTemplate(
  tpl: string,
  ctx: { productName: string; productUrl?: string },
  summarizeLine: string
): string {
  let out = tpl;
  // Legacy placeholder from v1.0: "Tell me about X (url)"
  if (out.includes("{productUrlSuffix}")) {
    out = out.replaceAll(
      "{productUrlSuffix}",
      ctx.productUrl ? ` (${ctx.productUrl})` : ""
    );
  }
  if (out.includes("{productUrlLine}")) {
    out = out.replaceAll(
      "{productUrlLine}",
      ctx.productUrl ? `\n\n${summarizeLine}` : ""
    );
  }
  return interpolate(out, ctx);
}

export function resolvePrompt(opts: {
  prompt?: string;
  promptTemplate?: string;
  description?: string;
  productName: string;
  productUrl?: string;
  locale?: string;
  messages?: AskAiMessages;
}): string {
  const {
    prompt,
    promptTemplate,
    description,
    productName,
    productUrl,
    locale,
    messages,
  } = opts;
  const ctx = { productName, productUrl };
  if (prompt) return interpolate(prompt, ctx);
  const dict = getMessages(locale, messages);
  const summarizeLine = interpolate(dict.summarizeTemplate, ctx);
  // A custom description becomes the core of the prompt, grounded with the site URL.
  if (description?.trim()) {
    const base = interpolate(description.trim(), ctx);
    if (!productUrl || base.includes(productUrl)) return base;
    return `${base}\n\n${summarizeLine}`;
  }
  return expandTemplate(
    promptTemplate ?? dict.promptTemplate,
    ctx,
    summarizeLine
  );
}
