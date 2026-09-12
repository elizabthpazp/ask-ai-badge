import type { CSSProperties, ReactNode } from "react";

/** Built-in provider ids */
export type BuiltInProviderId =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "google"
  | "perplexity"
  | "grok";

export interface AskAiProvider {
  /** Unique id, e.g. "chatgpt" or "my-bot" */
  id: string;
  /** Visible label under/next to the icon. Fully editable. */
  label: string;
  /** Short accessible name, defaults to `Ask ${label}` */
  ariaLabel?: string;
  /**
   * Final URL. If omitted, it is built from `baseUrl` + `prompt`.
   * Receives the resolved prompt text and the product context.
   */
  href?: string;
  /** Base URL used when `href` is omitted. Must accept the prompt as query. */
  baseUrl?: string;
  /** Query-param key used to append the prompt. Defaults to "q". */
  queryParam?: string;
  /**
   * How the prompt reaches the AI: `"link"` (in URL), `"copy"`
   * (clipboard + open app) or `"both"` (URL + clipboard backup).
   * Claude and Gemini default to `"both"`: Claude shows a red caution
   * banner on link-carried prompts (but the text is prefilled), and
   * Google sometimes drops Gemini's query while booting AI Mode —
   * either way the clipboard backup + hint covers you (Ctrl+V).
   * @default "link" ("both" for claude & gemini)
   */
  prefill?: AskAiPrefill;
  /**
   * Fully custom URL builder. Receives the resolved prompt.
   * Return a full https URL.
   */
  buildUrl?: (prompt: string) => string;
  /** Custom monochrome icon (any ReactNode, ideally currentColor SVG). */
  icon?: ReactNode;
  /** Per-provider icon size in px (overrides the badge `iconSize`). */
  iconSize?: number;
  /** Hide this provider without removing it from the array. */
  hidden?: boolean;
}

export type AskAiTheme = "auto" | "light" | "dark";
export type AskAiLayout = "row" | "wrap" | "grid" | "compact";
export type AskAiSize = "sm" | "md" | "lg";
export type AskAiAlign = "left" | "center" | "right" | "start" | "end";
export type AskAiLabelPosition = "bottom" | "side" | "right";

/** How the prompt reaches the AI. */
export type AskAiPrefill =
  /** Prompt encoded in the URL (default). */
  | "link"
  /** Prompt copied to clipboard, then the app opens (for AIs without URL prefill). */
  | "copy"
  /** URL prefill + clipboard backup (for AIs that sometimes drop the query, e.g. Gemini). */
  | "both";

/** Built-in locale codes. Any other string falls back to English. */
export type AskAiLocale = "en" | "es" | "fr" | "de" | "pt" | "it";

/** Overridable UI strings. `{productName}`, `{productUrl}` and `{provider}` are interpolated. */
export interface AskAiMessages {
  /** Heading. @default per-locale, e.g. en: "Ask AI about {productName}" */
  title?: string;
  /** Subheading. @default undefined */
  subtitle?: string;
  /** Disclaimer line. @default per-locale */
  disclaimer?: string;
  /** Default prompt brief sent to the AIs. @default per-locale */
  promptTemplate?: string;
  /** "Summarize highlights from {productName}'s site" line. @default per-locale */
  summarizeTemplate?: string;
  /** "Prompt copied — paste it into the AI" hint after copy handoff. @default per-locale */
  copiedHint?: string;
  /** Accessible label for each link. @default per-locale, e.g. en: "Ask {provider} about {productName}" */
  askTemplate?: string;
}

export interface AskAiBadgeProps {
  /** Your product / company / article name. Interpolated into title + prompt. @default "[Product]" */
  productName?: string;
  /**
   * Optional canonical URL of your product. Appended to the default prompt
   * so answers are grounded (e.g. "Tell me about [Product] (https://example.com)").
   * @default "https://example.com"
   */
  productUrl?: string;
  /**
   * Your product description (any language). It becomes the core of the
   * prompt sent to the AIs, followed by a localized
   * "summarize highlights from {productName}'s official website: {productUrl}" line.
   * Overrides the default brief template (but not an explicit `prompt`).
   */
  description?: string;
  /**
   * The exact question sent to the AIs. Highest priority — wins over
   * `description` and every template.
   * Placeholders `{productName}` and `{productUrl}` are replaced.
   */
  prompt?: string;
  /** Template for the prompt when neither `prompt` nor `description` is given. */
  promptTemplate?: string;
  /**
   * Heading text. Use `{productName}` placeholder.
   * @default per-locale (en: "Ask AI about {productName}")
   */
  title?: string;
  /** Optional subheading. @default undefined */
  subtitle?: string;
  /**
   * UI language for default title, disclaimer, prompt brief and link labels.
   * @default "en"
   */
  locale?: AskAiLocale | (string & {});
  /** Fine-grained override for any default string (merged over the locale dict). */
  messages?: AskAiMessages;
  /**
   * Which providers to show. Strings resolve to built-ins,
   * objects allow full override / custom brands.
   * Remove any you want, add your own — fully customizable.
   * @default ["chatgpt","claude","gemini","perplexity","grok"] ("google" also available)
   */
  providers?: Array<BuiltInProviderId | AskAiProvider>;
  /** Rename any built-in label: `{ chatgpt: "ChatGPT", grok: "Grok" }` */
  labels?: Partial<Record<string, string>>;
  /** Override any built-in base URL. */
  baseUrls?: Partial<Record<string, string>>;
  /** Color scheme. "auto" follows prefers-color-scheme. @default "auto" */
  theme?: AskAiTheme;
  /** Layout of the icon buttons. @default "wrap" */
  layout?: AskAiLayout;
  /** Size preset. @default "md" */
  size?: AskAiSize;
  /** Custom base font size (px number or CSS value, e.g. 16 or "16px"). Overrides `size` preset for typography. */
  fontSize?: number | string;
  /** Title font size (px number or any CSS value). Overrides the `size` preset and `fontSize`. */
  titleSize?: number | string;
  /** Provider label font size (px number or any CSS value). Overrides the `size` preset and `fontSize`. */
  labelSize?: number | string;
  /** Text alignment. @default "center" */
  align?: AskAiAlign;
  /** Show a small icon before the title. Opt-in. @default false */
  showTitleIcon?: boolean;
  /** Custom title icon (any ReactNode). Used when `showTitleIcon` is true. @default "✦" */
  titleIcon?: ReactNode;
  /**
   * Title/subtitle alignment, independent from the icon row.
   * Falls back to `align` when omitted.
   */
  titleAlign?: AskAiAlign;
  /** Show text labels under or beside icons. Opt-in. @default false */
  showLabels?: boolean;
  /**
   * Position of the label relative to the icon: "bottom" (underneath) or "side" / "right" (beside / horizontal).
   * @default "bottom"
   */
  labelPosition?: AskAiLabelPosition;
  /** Show bordered pills around icons. Opt-in. @default false */
  showBorder?: boolean;
  /** Open links in a new tab. @default true */
  newTab?: boolean;
  /** rel attribute for links. @default "noopener noreferrer nofollow" */
  rel?: string;
  /** Show "AI answers may vary" disclaimer. @default false */
  showDisclaimer?: boolean;
  /** Fully editable disclaimer text. @default per-locale */
  disclaimerText?: string;
  /** Custom className on the root element. */
  className?: string;
  /** Custom inline style on the root element (overrides CSS vars too). */
  style?: CSSProperties;
  /** Hide the heading, show only icons. @default false */
  iconsOnly?: boolean;
  /** Optional click interceptor (analytics). Return false to cancel navigation. */
  onProviderClick?: (
    provider: AskAiProvider,
    href: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => void | false;
  /** Custom icon size in px (overrides `size` preset for icons only). */
  iconSize?: number;
}
