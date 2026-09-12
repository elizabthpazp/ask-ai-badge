# ask-ai-badge

**"Ask AI about your product" button for React.** Drop it anywhere on your site (footer, pricing, docs, blog) and get deep links to **ChatGPT, Claude, Gemini, Perplexity, and Grok** — each one opens the AI with a question about your product already written. Official monochrome icons, 100% customizable, multi-language, and ultra light.

[![npm version](https://img.shields.io/npm/v/ask-ai-badge.svg)](https://www.npmjs.com/package/ask-ai-badge)
[![license](https://img.shields.io/npm/l/ask-ai-badge.svg)](https://www.npmjs.com/package/ask-ai-badge)
[![react](https://img.shields.io/badge/react-%3E%3D18-blue.svg)](https://react.dev)
[![typescript](https://img.shields.io/badge/types-TypeScript-blue.svg)](https://www.typescriptlang.org)

```
+--------------------------------------------------+
|            Ask AI about [Product]                |
|                                                  |
|   (ChatGPT)  (Claude)  (Gemini)  (Perplexity)   |
|                    (Grok)                        |
+--------------------------------------------------+
```

> **Keywords / SEO:** react ai badge, ask ai button, ask chatgpt about my website, "ask ai" footer badge, ai discovery widget, chatgpt claude gemini perplexity grok links, llm deep links, ai search badge, nextjs ai component, i18n react badge.

## Why it exists

People no longer just search on Google — **they ask AIs**. If your product isn't well told there, you lose visibility. This badge:

- **Puts your company in the AI conversation** — one click and visitors ask ChatGPT, Claude, Gemini, Perplexity, or Grok about you, with your site as the source.
- **Lets you control the narrative** — the prompt includes your description and your official URL, so answers start from your source, not rumors.
- **Zero friction** — no backend, no API keys, no accounts: just deep links that open each AI with the question ready.
- **Looks good on any site** — official icons in black/white/gray (`currentColor`), light/dark/auto theme, fully responsive.

## Live demo

```bash
git clone <your-repo>
npm install
npm run playground   # opens http://localhost:5199/
```

The playground lets you edit copy, prompt, providers, language, sizes, and alignment, preview the example site (light/dark, full/tablet/mobile widths), copy the generated links, and copy the resulting React code.

## 30-second usage

```bash
npm i ask-ai-badge
```

```tsx
import { AskAiBadge } from "ask-ai-badge";
import "ask-ai-badge/style.css";

export function Footer() {
  return <AskAiBadge />; // works out of the box: "[Product]" + https://example.com
}
```

With your own data:

```tsx
<AskAiBadge
  productName="MyProduct"
  productUrl="https://myproduct.com"
  description="**MyProduct** is a CRM designed to help sales teams close deals faster."
  locale="es"
/>
```

## Where to put it (and how it helps your business)

| Spot | Example | What it's for |
|---|---|---|
| **Global footer** | `<AskAiBadge />` | Visibility on every page; visitors fact-check what they read with AI. |
| **Landing / pricing bottom** | `<AskAiBadge align="start" />` | Answers doubts right before buying ("is this for me?"). |
| **Docs / Blog** | `<AskAiBadge productName="MyProduct Docs" />` | Turns every article into a conversation: summarize, translate, explain. |
| **About page** | `<AskAiBadge locale="en" showDisclaimer />` | Press and investors get the official summary in seconds. |

## Default render

- `Ask AI about [Product]` heading (centered, no icon, no names, no borders — clean style).
- 5 buttons: **ChatGPT, Claude, Gemini, Perplexity, Grok** (Google available opt-in).
- Each button opens the AI in a **new tab** with your question. Real example (ChatGPT):

```
https://chatgpt.com/?q=**[Product]**%20is%20a%20...
```

## The prompt AIs receive

A structured brief with your product and URL is sent by default:

```
**[Product]** is a [product category / type] designed to help [target audience] [main goal or outcome].

It lets users [key action / capability], [key action / capability], and [key action / capability].

With **[Product]**, users can [main benefit], making it easier to [specific problem it solves / outcome it enables].

Summarize the key highlights from **[Product]**'s official website:
https://example.com
```

Three control levels (lowest to highest priority):

```tsx
// 1. Your description: core of the prompt + summary line with your URL
<AskAiBadge
  productName="MyProduct"
  productUrl="https://myproduct.com"
  description="**MyProduct** is a CRM designed to help sales teams close deals faster."
/>

// 2. Full custom template ({productName}, {productUrl}, {productUrlLine})
<AskAiBadge productName="MyProduct" promptTemplate="Tell me everything about {productName}: {productUrl}" />

// 3. Exact prompt (wins over everything)
<AskAiBadge productName="MyProduct" prompt="What is MyProduct and how much does it cost?" />
```

## Total customization

```tsx
<AskAiBadge
  productName="MyProduct"
  productUrl="https://myproduct.com"
  locale="es"

  // Providers: remove, reorder, rename, or add your own
  providers={[
    "chatgpt",
    "perplexity",
    "google", // opt-in (not in the default set)
    { id: "docs", label: "Docs", href: "https://myproduct.com/docs", icon: <span>D</span> },
  ]}

  // Appearance
  theme="auto"        // "light" | "dark" | "auto"
  layout="wrap"       // "row" | "wrap" | "grid" | "compact"
  size="md"           // "sm" | "md" | "lg"
  titleSize={20}      // px or CSS; wins over size (same for labelSize, iconSize)
  align="center"      // "start" | "center" | "end" (+ "left"/"right")
  titleAlign="start"  // independent heading (= align when omitted)
  showLabels          // names under icons (opt-in)
  showBorder          // bordered pills (opt-in)
  showTitleIcon       // ✦ icon before the heading (opt-in)

  // Behavior
  newTab              // default true (target=_blank + safe rel)
  onProviderClick={(p, href) => console.log(p.id, href)}
/>
```

### How the question reaches each AI

| Button | Destination | Behavior |
|---|---|---|
| ChatGPT | `chatgpt.com` | `?q=` prefills and sends |
| Claude | `claude.ai/new` | `?q=` + clipboard backup |
| Gemini | Google AI Mode (`udm=50`) | `?q=` + clipboard backup |
| Google *(opt-in)* | `google.com/search` | `?q=` |
| Perplexity | `perplexity.ai/search` | `?q=` |
| Grok | `grok.com` | `?q=` |

> **Gemini**: `gemini.google.com/app` **ignores** `?q=` — Google offers no URL prefill there (it only works with extensions), so the box always came up empty. That's why the Gemini button opens **Google AI Mode** (`udm=50`), which accepts the question via URL and answers it with Gemini in one click. And since Google sometimes drops `q` while booting AI Mode, the button **also copies the prompt**: if the box arrives empty, paste with Ctrl+V and you're done. That's the `"both"` mode (link + backup), configurable per provider alongside `"link"` and `"copy"`:
>
> ```tsx
> providers={[{ id: "gemini", label: "Gemini", baseUrl: "https://gemini.google.com/app", prefill: "copy" }]}
> ```
>
> **Claude**: `claude.ai/new?q=...` does prefill, but Anthropic always shows a red *"Use caution… Malicious conversation content…"* notice on any prompt arriving via link. Since that notice can't be avoided, Claude also **copies a backup prompt** (if the box ever arrives empty, paste with Ctrl+V):
>
> ```tsx
> providers={[{ id: "claude", label: "Claude", prefill: "link" }]} // link only, no copy
> providers={[{ id: "claude", label: "Claude", prefill: "copy" }]} // copy only, clean app
> ```

## Languages

`locale` translates the heading, disclaimer, prompt brief, copy hint, and accessible labels. Unsupported codes fall back to English; `messages` overrides any string.

| `locale` | Default heading |
|---|---|
| `en` (default) | Ask AI about {productName} |
| `es` | Pregunta a la IA sobre {productName} |
| `fr` | Interrogez l'IA sur {productName} |
| `de` | Frag die KI über {productName} |
| `pt` | Pergunte à IA sobre {productName} |
| `it` | Chiedi all'IA di {productName} |

```tsx
<AskAiBadge productName="MyProduct" locale="es" />
<AskAiBadge
  productName="MyProduct"
  locale="es"
  messages={{ title: "Consulta la IA sobre {productName}", askTemplate: "Consultar a {provider} sobre {productName}" }}
/>
```

## Dependency-free styling

Plain ~4 KB CSS (`--aab-*` variables, `aab--*` classes). No Tailwind, no CSS-in-JS:

```css
.my-badge {
  --aab-fg: #111;
  --aab-border: #e5e5e5;
  --aab-radius: 999px;
  --aab-icon-box: 48px;
}
```

100% responsive: own `box-sizing`, balanced headings, ellipsized labels, `wrap`/`grid`/`row` layouts (rows scroll safely: no clipping, no unreachable start), icons always contained in their box (even custom ones and large `iconSize`), and *container queries* that compact the badge in narrow columns (with fallback).

## Performance

- **JS ~20 KB (~8 KB gzip) + CSS ~4 KB (~1 KB gzip)**, zero dependencies (React is peer `>=18`).
- **Real tree-shaking**: importing a single icon weighs ~3 KB.
- Zero network requests (inline SVG, no fonts or CDNs), no CLS, memoized renders, and `prefers-reduced-motion` respected.

## API

| Prop | Type | Default |
|---|---|---|
| `productName` | `string` | `"[Product]"` |
| `productUrl` | `string` | `"https://example.com"` |
| `description` | `string` (`{productName}`, `{productUrl}`) | structured brief |
| `prompt` | `string` (highest priority) | — |
| `promptTemplate` | `string` | brief per `locale` |
| `title` / `subtitle` | `string` | per `locale` / — |
| `showTitleIcon` / `titleIcon` | `boolean` / `ReactNode` | `false` / `"✦"` |
| `locale` | `"en"\|"es"\|"fr"\|"de"\|"pt"\|"it"` | `"en"` |
| `messages` | `title, subtitle, disclaimer, promptTemplate, summarizeTemplate, askTemplate, copiedHint` | — |
| `providers` | `(id \| AskAiProvider)[]` — each: `label, href, baseUrl, queryParam, buildUrl, prefill, icon, iconSize, hidden, ariaLabel` | 5 by default |
| `labels` / `baseUrls` | per-id overrides | — |
| `theme` / `layout` / `size` | `"auto"\|"light"\|"dark"` / `"row"\|"wrap"\|"grid"\|"compact"` / `"sm"\|"md"\|"lg"` | `"auto"` / `"wrap"` / `"md"` |
| `titleSize` / `labelSize` / `iconSize` | `number` (px) or CSS / global px and per provider | `size` preset |
| `align` / `titleAlign` | `"start"\|"center"\|"end"` (+`"left"`/`"right"`) | `"center"` / = `align` |
| `showLabels` `showBorder` `newTab` `iconsOnly` `showDisclaimer` | `boolean` | `false,false,true,false,false` |
| `disclaimerText` / `rel` | `string` | per `locale` / `"noopener noreferrer nofollow"` |
| `className` / `style` / `onProviderClick` | — | — |

Helpers: `buildProviderUrl`, `copyTextToClipboard`, `resolveProviders`, `resolvePrompt`, `getMessages`, `LOCALE_MESSAGES`, `BUILT_IN_BASE_URLS`, icons (`ChatGptIcon`, `ClaudeIcon`, `GeminiIcon`, `GoogleIcon`, `PerplexityIcon`, `GrokIcon`).

## FAQ

**Does it work with Next.js / SSR?** Yes — it never touches `window`/`document` while rendering; the clipboard is only used on click.

**Why does Gemini open Google instead of gemini.google.com?** Because the Gemini app ignores `?q=`. AI Mode answers with Gemini in one click; if you prefer the app, use `prefill: "copy"` with its URL.

**Why does Claude show a red notice?** It's Anthropic's policy against link-prefilled prompts; the text still arrives, plus there's a clipboard backup.

**Can I remove AIs or add my own?** Yes: `providers` accepts ids, reordering, `hidden`, and fully custom objects (`href`/`buildUrl`/`icon`).

**What about trademarks?** Icons are official artwork (Simple Icons CC0, except xAI's current Grok mark) rendered in monochrome. Brands belong to their owners — follow their guidelines.

## License

MIT
