# ask-ai-badge

**Botón "Ask AI about your product" para React.** Añade a tu web (footer, pricing, docs, blog) un badge con accesos directos a **ChatGPT, Claude, Gemini, Perplexity y Grok** — cada uno abre la IA con una pregunta sobre tu producto ya escrita. Iconos oficiales en monocromo, 100% personalizable, multi-idioma y ultra ligero.

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

## Por qué existe

La gente ya no solo busca en Google: **pregunta a las IAs**. Si tu producto no aparece bien contado ahí, pierdes visibilidad. Este badge:

- **Pone tu empresa en la conversación IA** — un clic y el visitante pregunta a ChatGPT, Claude, Gemini, Perplexity o Grok sobre ti, con tu web como fuente.
- **Controlas el relato** — el prompt incluye tu descripción y tu URL oficial, así las respuestas parten de tu fuente, no de rumores.
- **Cero fricción** — sin backend, sin API keys, sin cuentas: son deep-links que abren cada IA con la pregunta lista.
- **Se ve bien en cualquier web** — iconos oficiales en blanco/negro/gris (`currentColor`), tema claro/oscuro/auto y responsive total.

## Demo en vivo

```bash
git clone <tu-repo>
npm install
npm run playground   # abre http://localhost:5199/
```

El playground permite editar textos, prompt, providers, idioma, tamaños y alineación, ver la web de ejemplo (claro/oscuro, ancho completo/tablet/móvil), copiar los links generados y copiar el código React resultante.

## Uso en 30 segundos

```bash
npm i ask-ai-badge
```

```tsx
import { AskAiBadge } from "ask-ai-badge";
import "ask-ai-badge/style.css";

export function Footer() {
  return <AskAiBadge />; // ya funciona: "[Product]" + https://example.com
}
```

Con tus datos:

```tsx
<AskAiBadge
  productName="MiProducto"
  productUrl="https://miproducto.com"
  description="**MiProducto** is a CRM designed to help sales teams close deals faster."
  locale="es"
/>
```

## Dónde ponerlo (y cómo ayuda a tu empresa)

| Lugar | Ejemplo | Para qué sirve |
|---|---|---|
| **Footer global** | `<AskAiBadge />` | Visibilidad en todas las páginas; el visitante verifica lo que lee con la IA. |
| **Final de landing / pricing** | `<AskAiBadge align="start" />` | Resuelve la duda justo antes de comprar ("¿esto me sirve?"). |
| **Docs / Blog** | `<AskAiBadge productName="MiProducto Docs" />` | Convierte cada artículo en una conversación: resume, traduce, explica. |
| **Página "About"** | `<AskAiBadge locale="en" showDisclaimer />` | Prensa e inversores obtienen el resumen oficial en segundos. |

## Lo que renderiza por defecto

- Título `Ask AI about [Product]` (centrado, sin icono, sin nombres, sin bordes — estilo limpio).
- 5 botones: **ChatGPT, Claude, Gemini, Perplexity, Grok** (Google disponible como opt-in).
- Cada botón abre la IA en **pestaña nueva** con tu pregunta. Ejemplo real (ChatGPT):

```
https://chatgpt.com/?q=**[Product]**%20is%20a%20...
```

## El prompt que reciben las IAs

Por defecto se envía un brief estructurado con tu producto y tu URL:

```
**[Product]** is a [product category / type] designed to help [target audience] [main goal or outcome].

It lets users [key action / capability], [key action / capability], and [key action / capability].

With **[Product]**, users can [main benefit], making it easier to [specific problem it solves / outcome it enables].

Summarize the key highlights from **[Product]**'s official website:
https://example.com
```

Tres niveles de control (de menor a mayor prioridad):

```tsx
// 1. Tu descripción: núcleo del prompt + línea de resumen con tu URL
<AskAiBadge
  productName="MiProducto"
  productUrl="https://miproducto.com"
  description="**MiProducto** is a CRM designed to help sales teams close deals faster."
/>

// 2. Plantilla completa ({productName}, {productUrl}, {productUrlLine})
<AskAiBadge productName="MiProducto" promptTemplate="Dime todo sobre {productName}: {productUrl}" />

// 3. Prompt exacto (manda sobre todo)
<AskAiBadge productName="MiProducto" prompt="¿Qué es MiProducto y cuánto cuesta?" />
```

## Personalización total

```tsx
<AskAiBadge
  productName="MiProducto"
  productUrl="https://miproducto.com"
  locale="es"

  // Providers: quita, reordena, renombra o añade los tuyos
  providers={[
    "chatgpt",
    "perplexity",
    "google", // opt-in (fuera del default)
    { id: "docs", label: "Docs", href: "https://miproducto.com/docs", icon: <span>D</span> },
  ]}

  // Apariencia
  theme="auto"        // "light" | "dark" | "auto"
  layout="wrap"       // "row" | "wrap" | "grid" | "compact"
  size="md"           // "sm" | "md" | "lg"
  titleSize={20}      // px o CSS; manda sobre size (igual labelSize, iconSize)
  align="center"      // "start" | "center" | "end" (+ "left"/"right")
  titleAlign="start"  // título independiente (= align si se omite)
  showLabels          // nombres bajo los iconos (opt-in)
  showBorder          // píldoras con borde (opt-in)
  showTitleIcon       // icono ✦ ante el título (opt-in)

  // Comportamiento
  newTab              // default true (target=_blank + rel seguro)
  onProviderClick={(p, href) => console.log(p.id, href)}
/>
```

### Cómo llega la pregunta a cada IA

| Botón | Destino | Comportamiento |
|---|---|---|
| ChatGPT | `chatgpt.com` | `?q=` pre-rellena y envía |
| Claude | `claude.ai/new` | `?q=` + copia de respaldo |
| Gemini | AI Mode de Google (`udm=50`) | `?q=` + copia de respaldo |
| Google *(opt-in)* | `google.com/search` | `?q=` |
| Perplexity | `perplexity.ai/search` | `?q=` |
| Grok | `grok.com` | `?q=` |

> **Gemini**: `gemini.google.com/app` ignora el `?q=` (Google no ofrece pre-relleno ahí), así que el botón abre el **AI Mode con Gemini**, que sí responde en un clic. Como Google a veces descarta el `q` al arrancar, además **lo copia** (modo `"both"`).
>
> **Claude**: el `?q=` funciona, pero Anthropic muestra un aviso rojo de precaución en todo prompt llegado por link. El botón pre-rellena igual y deja copia de respaldo.
>
> Todo conmutable por provider con `prefill: "link" | "copy" | "both"`.

## Idiomas

`locale` traduce título, disclaimer, brief del prompt, aviso de copiado y etiquetas accesibles. Cualquier código no soportado cae a inglés; `messages` sobrescribe cualquier cadena.

| `locale` | Título |
|---|---|
| `en` (default) | Ask AI about {productName} |
| `es` | Pregunta a la IA sobre {productName} |
| `fr` | Interrogez l'IA sur {productName} |
| `de` | Frag die KI über {productName} |
| `pt` | Pergunte à IA sobre {productName} |
| `it` | Chiedi all'IA di {productName} |

```tsx
<AskAiBadge productName="MiProducto" locale="es" />
<AskAiBadge
  productName="MiProducto"
  locale="es"
  messages={{ title: "Consulta la IA sobre {productName}", askTemplate: "Consultar a {provider} sobre {productName}" }}
/>
```

## Estilos sin dependencias

CSS plano de ~4 KB (variables `--aab-*`, clases `aab--*`). Sin Tailwind ni CSS-in-JS:

```css
.mi-badge {
  --aab-fg: #111;
  --aab-border: #e5e5e5;
  --aab-radius: 999px;
  --aab-icon-box: 48px;
}
```

100% responsive: `box-sizing` propio, título con balanceo, etiquetas con ellipsis, layouts `wrap`/`grid`/`row` con scroll táctil y *container queries* que compactan el badge en columnas angostas (con fallback).

## Rendimiento

- **JS ~20 KB (~8 KB gzip) + CSS ~4 KB (~1 KB gzip)**, cero dependencias (React es peer `>=18`).
- **Tree-shaking real**: importar solo un icono pesa ~3 KB.
- Cero peticiones de red (SVG inline, sin fuentes ni CDNs), sin CLS, renders memoizados y `prefers-reduced-motion` respetado.

## API

| Prop | Tipo | Default |
|---|---|---|
| `productName` | `string` | `"[Product]"` |
| `productUrl` | `string` | `"https://example.com"` |
| `description` | `string` (`{productName}`, `{productUrl}`) | brief estructurado |
| `prompt` | `string` (máxima prioridad) | — |
| `promptTemplate` | `string` | brief según `locale` |
| `title` / `subtitle` | `string` | según `locale` / — |
| `showTitleIcon` / `titleIcon` | `boolean` / `ReactNode` | `false` / `"✦"` |
| `locale` | `"en"\|"es"\|"fr"\|"de"\|"pt"\|"it"` | `"en"` |
| `messages` | `title, subtitle, disclaimer, promptTemplate, summarizeTemplate, askTemplate, copiedHint` | — |
| `providers` | `(id \| AskAiProvider)[]` — cada uno: `label, href, baseUrl, queryParam, buildUrl, prefill, icon, iconSize, hidden, ariaLabel` | 5 por defecto |
| `labels` / `baseUrls` | overrides por id | — |
| `theme` / `layout` / `size` | `"auto"\|"light"\|"dark"` / `"row"\|"wrap"\|"grid"\|"compact"` / `"sm"\|"md"\|"lg"` | `"auto"` / `"wrap"` / `"md"` |
| `titleSize` / `labelSize` / `iconSize` | `number` (px) o CSS / px global y por provider | preset de `size` |
| `align` / `titleAlign` | `"start"\|"center"\|"end"` (+`"left"`/`"right"`) | `"center"` / = `align` |
| `showLabels` `showBorder` `newTab` `iconsOnly` `showDisclaimer` | `boolean` | `false,false,true,false,false` |
| `disclaimerText` / `rel` | `string` | según `locale` / `"noopener noreferrer nofollow"` |
| `className` / `style` / `onProviderClick` | — | — |

Helpers: `buildProviderUrl`, `copyTextToClipboard`, `resolveProviders`, `resolvePrompt`, `getMessages`, `LOCALE_MESSAGES`, `BUILT_IN_BASE_URLS`, iconos (`ChatGptIcon`, `ClaudeIcon`, `GeminiIcon`, `GoogleIcon`, `PerplexityIcon`, `GrokIcon`).

## FAQ

**¿Funciona con Next.js / SSR?** Sí — no toca `window`/`document` al renderizar; el portapapeles solo se usa en el clic.

**¿Por qué Gemini abre Google y no gemini.google.com?** Porque la app de Gemini ignora el `?q=`. El AI Mode responde con Gemini en un clic; si prefieres la app, usa `prefill: "copy"` con su URL.

**¿Por qué Claude muestra un aviso rojo?** Es su política anti prompt-injection con links pre-rellenados; el texto llega igual y hay copia de respaldo.

**¿Puedo quitar IAs o añadir la mía?** Sí: `providers` acepta ids, reorden, `hidden`, y objetos totalmente custom (`href`/`buildUrl`/`icon`).

**¿Y las marcas?** Los iconos son trazados oficiales (Simple Icons CC0, excepto la marca vigente de Grok/xAI) en monocromo. Las marcas pertenecen a sus dueños: úsalas según sus guías.

## Licencia

MIT
