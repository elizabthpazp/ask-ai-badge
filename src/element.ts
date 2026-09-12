import {
  resolvePrompt,
  resolveProviders,
  buildProviderUrl,
  copyTextToClipboard,
  getMessages,
  interpolate,
} from "./providers";
import type { AskAiProvider } from "./types";
import { ICONS_RAW } from "./icons-raw";
import cssStyles from "./ask-ai-badge.css?inline";

const SIZE_PX: Record<string, number> = { sm: 18, md: 22, lg: 26 };

function toCssSize(v: number | string | undefined | null): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "number") return isNaN(v) ? undefined : `${v}px`;
  const str = String(v).trim();
  if (!str) return undefined;
  return /^\d+(\.\d+)?$/.test(str) ? `${str}px` : str;
}

export class AskAiBadgeElement extends HTMLElement {
  private _root: ShadowRoot;
  private _copiedId: string | null = null;
  private _copiedTimer: any = null;

  static get observedAttributes() {
    return [
      "product-name",
      "product-url",
      "description",
      "prompt",
      "prompt-template",
      "title",
      "subtitle",
      "locale",
      "messages",
      "providers",
      "labels",
      "base-urls",
      "theme",
      "layout",
      "size",
      "font-size",
      "align",
      "title-align",
      "title-size",
      "label-size",
      "show-labels",
      "label-position",
      "show-border",
      "new-tab",
      "rel",
      "show-disclaimer",
      "disclaimer-text",
      "icons-only",
      "icon-size",
      "show-title-icon",
      "title-icon",
    ];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this._copiedTimer) {
      clearTimeout(this._copiedTimer);
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  private parseJsonAttr<T>(name: string): T | undefined {
    const val = this.getAttribute(name);
    if (!val) return undefined;
    try {
      return JSON.parse(val) as T;
    } catch {
      return undefined;
    }
  }

  private getBoolAttr(name: string, defaultVal = false): boolean {
    if (!this.hasAttribute(name)) return defaultVal;
    const val = this.getAttribute(name);
    if (val === "false" || val === "0") return false;
    return true;
  }

  private render() {
    const productName = this.getAttribute("product-name") ?? "[Product]";
    const productUrl = this.getAttribute("product-url") ?? "https://example.com";
    const description = this.getAttribute("description") ?? undefined;
    const prompt = this.getAttribute("prompt") ?? undefined;
    const promptTemplate = this.getAttribute("prompt-template") ?? undefined;
    const rawTitle = this.getAttribute("title") ?? undefined;
    const subtitle = this.getAttribute("subtitle") ?? undefined;
    const locale = this.getAttribute("locale") ?? "en";
    const theme = this.getAttribute("theme") ?? "auto";
    const layout = this.getAttribute("layout") ?? "wrap";
    const size = this.getAttribute("size") ?? "md";
    const fontSize = this.getAttribute("font-size") ?? undefined;
    const align = this.getAttribute("align") ?? "center";
    const titleAlign = this.getAttribute("title-align") ?? undefined;
    const titleSize = this.getAttribute("title-size") ?? undefined;
    const labelSize = this.getAttribute("label-size") ?? undefined;
    const showLabels = this.getBoolAttr("show-labels", false);
    const labelPosition = this.getAttribute("label-position") ?? "bottom";
    const showBorder = this.getBoolAttr("show-border", false);
    const newTab = this.getBoolAttr("new-tab", true);
    const rel = this.getAttribute("rel") ?? "noopener noreferrer nofollow";
    const showDisclaimer = this.getBoolAttr("show-disclaimer", false);
    const disclaimerText = this.getAttribute("disclaimer-text") ?? undefined;
    const iconsOnly = this.getBoolAttr("icons-only", false);
    const showTitleIcon = this.getBoolAttr("show-title-icon", false);
    const titleIcon = this.getAttribute("title-icon") ?? "✦";

    const iconSizeAttr = this.getAttribute("icon-size");
    const parsedIconSize = iconSizeAttr ? parseInt(iconSizeAttr, 10) : undefined;
    const px = parsedIconSize ?? (SIZE_PX[size] || 22);

    const messages = this.parseJsonAttr<any>("messages");
    const labels = this.parseJsonAttr<Record<string, string>>("labels");
    const baseUrls = this.parseJsonAttr<Record<string, string>>("base-urls");
    const providersAttr = this.parseJsonAttr<any>("providers");

    const dict = getMessages(locale, messages);

    const resolvedPrompt = resolvePrompt({
      prompt,
      promptTemplate,
      description,
      productName,
      productUrl,
      locale,
      messages,
    });

    const resolvedTitle = interpolate(rawTitle ?? dict.title, { productName, productUrl });
    const resolvedSubtitle = subtitle ?? (dict.subtitle || undefined);
    const resolvedDisclaimer = disclaimerText ?? dict.disclaimer;
    const headerAlign = titleAlign ?? align;

    const list = resolveProviders(providersAttr, { labels, baseUrls });
    const items = list.map((provider) => ({
      provider,
      href: buildProviderUrl(provider, resolvedPrompt),
    }));

    // Custom CSS Variables
    const vars: string[] = [];
    const f = toCssSize(fontSize);
    const t = toCssSize(titleSize) ?? f;
    const l = toCssSize(labelSize) ?? (f ? `calc(${f} * 0.8)` : undefined);
    if (t) vars.push(`--aab-title-size: ${t};`);
    if (l) vars.push(`--aab-label-size: ${l};`);
    if (f) vars.push(`--aab-font-size: ${f};`);
    vars.push(`--aab-icon-size: ${px}px;`);
    vars.push(`--aab-icon-box: ${Math.round(Math.max(px * 1.6, px + 18))}px;`);

    const sectionClasses = [
      "aab",
      `aab--${theme}`,
      `aab--${layout}`,
      `aab--${size}`,
      `aab--align-${align}`,
      labelPosition !== "bottom" ? `aab--label-${labelPosition}` : "",
      iconsOnly ? "aab--icons-only" : "",
      showBorder ? "aab--bordered" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Build icons HTML
    const itemsHtml = items
      .map(({ provider, href }) => {
        const itemPx = provider.iconSize ?? px;
        const iconKey = provider.id.toLowerCase();
        const iconData = ICONS_RAW[iconKey] ?? ICONS_RAW.spark;
        const ariaLabel =
          provider.ariaLabel ??
          interpolate(dict.askTemplate, { productName, provider: provider.label });

        let pathSvg = "";
        if (Array.isArray(iconData.path)) {
          pathSvg = iconData.path.map((p) => `<path d="${p}"></path>`).join("");
        } else {
          pathSvg = `<path d="${iconData.path}"></path>`;
        }

        const isGrok = iconKey === "grok";
        const preserveAspect = isGrok ? 'preserveAspectRatio="xMidYMid meet"' : "";

        return `
          <li class="aab__item">
            <a
              class="aab__link"
              href="${escapeHtml(href)}"
              ${newTab ? 'target="_blank"' : ""}
              ${newTab ? `rel="${escapeHtml(rel)}"` : ""}
              aria-label="${escapeHtml(ariaLabel)}"
              title="${escapeHtml(ariaLabel)}"
              data-provider-id="${escapeHtml(provider.id)}"
            >
              <span class="aab__icon" style="width: ${itemPx}px; height: ${itemPx}px;">
                <svg
                  width="${itemPx}"
                  height="${itemPx}"
                  viewBox="${iconData.viewBox}"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                  ${preserveAspect}
                >
                  ${pathSvg}
                </svg>
              </span>
              ${showLabels ? `<span class="aab__label">${escapeHtml(provider.label)}</span>` : ""}
            </a>
          </li>
        `;
      })
      .join("");

    this._root.innerHTML = `
      <style>
        ${cssStyles}
        :host {
          display: inline-block;
          max-width: 100%;
        }
      </style>
      <section
        class="${sectionClasses}"
        style="${vars.join(" ")}"
        aria-label="${escapeHtml(resolvedTitle)}"
        data-product="${escapeHtml(productName)}"
      >
        ${
          !iconsOnly
            ? `
          <header class="aab__header aab__header--${escapeHtml(headerAlign)}">
            <h2 class="aab__title">
              ${showTitleIcon ? `<span class="aab__spark" aria-hidden="true">${escapeHtml(titleIcon)} </span>` : ""}
              ${escapeHtml(resolvedTitle)}
            </h2>
            ${resolvedSubtitle ? `<p class="aab__subtitle">${escapeHtml(resolvedSubtitle)}</p>` : ""}
          </header>
        `
            : ""
        }

        <nav class="aab__nav" aria-label="Ask an AI assistant">
          <ul class="aab__list">
            ${itemsHtml}
          </ul>
        </nav>

        ${showDisclaimer && !iconsOnly ? `<p class="aab__disclaimer">${escapeHtml(resolvedDisclaimer)}</p>` : ""}
        ${this._copiedId ? `<p class="aab__hint" role="status">${escapeHtml(dict.copiedHint)}</p>` : ""}
      </section>
    `;

    // Attach click listeners for providers and copying
    const links = this._root.querySelectorAll<HTMLAnchorElement>(".aab__link");
    links.forEach((link) => {
      const providerId = link.getAttribute("data-provider-id");
      const matched = items.find((it) => it.provider.id === providerId);
      if (!matched) return;
      const { provider, href } = matched;

      link.addEventListener("click", (e) => {
        // Dispatch custom event that allows cancellation
        const customEvent = new CustomEvent("provider-click", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { provider, href, originalEvent: e },
        });
        const notCancelled = this.dispatchEvent(customEvent);
        if (!notCancelled) {
          e.preventDefault();
          return;
        }

        if (provider.prefill === "copy") {
          e.preventDefault();
          if (typeof window !== "undefined") {
            window.open(href, newTab ? "_blank" : "_self", "noopener");
          }
          void copyTextToClipboard(resolvedPrompt).then((ok) => {
            if (ok) this.handleCopied(provider);
          });
        } else if (provider.prefill === "both") {
          void copyTextToClipboard(resolvedPrompt).then((ok) => {
            if (ok) this.handleCopied(provider);
          });
        }
      });
    });
  }

  private handleCopied(provider: AskAiProvider) {
    this._copiedId = provider.id;
    if (this._copiedTimer) clearTimeout(this._copiedTimer);
    this.render();

    this.dispatchEvent(
      new CustomEvent("copied", {
        bubbles: true,
        composed: true,
        detail: { provider, ok: true },
      })
    );

    this._copiedTimer = setTimeout(() => {
      if (this._copiedId === provider.id) {
        this._copiedId = null;
        this.render();
      }
    }, 4000);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (typeof customElements !== "undefined" && !customElements.get("ask-ai-badge")) {
  customElements.define("ask-ai-badge", AskAiBadgeElement);
}

export default AskAiBadgeElement;
