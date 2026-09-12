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

const EN_PROMPT = `**{productName}** is a [product category / type] designed to help [target audience] [main goal or outcome].

It lets users [key action / capability], [key action / capability], and [key action / capability].

With **{productName}**, users can [main benefit], making it easier to [specific problem it solves / outcome it enables].{productUrlLine}`;

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
    promptTemplate: `**{productName}** es un(a) [categoría / tipo de producto] diseñado(a) para ayudar a [audiencia objetivo] a [objetivo o resultado principal].

Permite a los usuarios [acción / capacidad clave], [acción / capacidad clave] y [acción / capacidad clave].

Con **{productName}**, los usuarios pueden [beneficio principal], lo que facilita [problema que resuelve / resultado que permite].{productUrlLine}`,
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
    promptTemplate: `**{productName}** est un(e) [catégorie / type de produit] conçu(e) pour aider [public cible] à [objectif ou résultat principal].

Il permet aux utilisateurs de [action / capacité clé], [action / capacité clé] et [action / capacité clé].

Avec **{productName}**, les utilisateurs peuvent [bénéfice principal], ce qui facilite [problème résolu / résultat obtenu].{productUrlLine}`,
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
    promptTemplate: `**{productName}** ist ein(e) [Produktkategorie / Produkttyp], die/das [Zielgruppe] dabei hilft, [Hauptziel oder Ergebnis] zu erreichen.

Nutzer können damit [zentrale Aktion / Funktion], [zentrale Aktion / Funktion] und [zentrale Aktion / Funktion].

Mit **{productName}** können Nutzer [Hauptnutzen], was es einfacher macht, [gelöstes Problem / ermöglichtes Ergebnis].{productUrlLine}`,
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
    promptTemplate: `**{productName}** é um(a) [categoria / tipo de produto] criado(a) para ajudar [público-alvo] a [objetivo ou resultado principal].

Permite aos usuários [ação / recurso principal], [ação / recurso principal] e [ação / recurso principal].

Com **{productName}**, os usuários podem [benefício principal], facilitando [problema resolvido / resultado alcançado].{productUrlLine}`,
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
    promptTemplate: `**{productName}** è un(a) [categoria / tipo di prodotto] progettato(a) per aiutare [pubblico di destinazione] a [obiettivo o risultato principale].

Permette agli utenti di [azione / funzionalità chiave], [azione / funzionalità chiave] e [azione / funzionalità chiave].

Con **{productName}**, gli utenti possono [beneficio principale], rendendo più facile [problema risolto / risultato ottenuto].{productUrlLine}`,
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
