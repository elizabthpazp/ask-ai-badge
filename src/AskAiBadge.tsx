import { memo, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import type { AskAiBadgeProps, AskAiProvider } from "./types";
import {
  interpolate,
  resolvePrompt,
  resolveProviders,
  buildProviderUrl,
  copyTextToClipboard,
  getMessages,
} from "./providers";
import { BUILT_IN_ICONS, SparkIcon } from "./icons";
import "./ask-ai-badge.css";

const SIZE_PX = { sm: 18, md: 22, lg: 26 } as const;

interface LinkRowProps {
  provider: AskAiProvider;
  href: string;
  prompt: string;
  productName: string;
  askTemplate: string;
  iconSize: number;
  showLabels: boolean;
  newTab: boolean;
  rel: string;
  onProviderClick?: AskAiBadgeProps["onProviderClick"];
  onCopied?: (provider: AskAiProvider, ok: boolean) => void;
}

/** Memoized so typing in a parent form only re-renders rows that changed. */
const ProviderLink = memo(function ProviderLink({
  provider,
  href,
  prompt,
  productName,
  askTemplate,
  iconSize: globalIconSize,
  showLabels,
  newTab,
  rel,
  onProviderClick,
  onCopied,
}: LinkRowProps): JSX.Element {
  const Icon = BUILT_IN_ICONS[provider.id.toLowerCase()] ?? SparkIcon;
  const px = provider.iconSize ?? globalIconSize;
  const label =
    provider.ariaLabel ??
    interpolate(askTemplate, { productName, provider: provider.label });
  return (
    <li className="aab__item">
      <a
        className="aab__link"
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? rel : undefined}
        aria-label={label}
        title={label}
        onClick={(e) => {
          if (onProviderClick) {
            const r = onProviderClick(provider, href, e);
            if (r === false) return;
          }
          // Copy handoff ("copy"): the URL can't carry the prompt,
          // so copy it and open the app. window.open runs synchronously
          // to avoid popup blockers; the copy proceeds in parallel.
          if (provider.prefill === "copy") {
            e.preventDefault();
            if (typeof window !== "undefined") {
              window.open(href, newTab ? "_blank" : "_self", "noopener");
            }
            void copyTextToClipboard(prompt).then((ok) => onCopied?.(provider, ok));
          } else if (provider.prefill === "both") {
            // Native navigation carries the prompt; the copy is only
            // a backup in case the AI drops the query. No preventDefault,
            // so popup blockers never get involved.
            void copyTextToClipboard(prompt).then((ok) => {
              if (ok) onCopied?.(provider, ok);
            });
          }
        }}
        >
        <span className="aab__icon" style={{ width: px, height: px }}>
          {provider.icon ?? <Icon size={px} />}
        </span>
          {showLabels && <span className="aab__label">{provider.label}</span>}
        </a>
      </li>
  );
});

export function AskAiBadge({
  productName = "[Product]",
  productUrl = "https://example.com",
  description,
  prompt,
  promptTemplate,
  title,
  subtitle,
  showTitleIcon = false,
  titleIcon,
  locale = "en",
  messages,
  providers,
  labels,
  baseUrls,
  theme = "auto",
  layout = "wrap",
  size = "md",
  align = "center",
  titleAlign,
  titleSize,
  labelSize,
  showLabels = false,
  showBorder = false,
  newTab = true,
  rel = "noopener noreferrer nofollow",
  showDisclaimer = false,
  disclaimerText,
  className = "",
  style,
  iconsOnly = false,
  onProviderClick,
  iconSize,
}: AskAiBadgeProps): JSX.Element {
  const dict = useMemo(
    () => getMessages(locale, messages),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, JSON.stringify(messages)]
  );

  const resolvedPrompt = useMemo(
    () =>
      resolvePrompt({
        prompt,
        promptTemplate,
        description,
        productName,
        productUrl,
        locale,
        messages,
      }),
    [prompt, promptTemplate, description, productName, productUrl, locale, messages]
  );

  const resolvedTitle = useMemo(
    () => interpolate(title ?? dict.title, { productName, productUrl }),
    [title, dict, productName, productUrl]
  );

  const resolvedSubtitle = subtitle ?? (dict.subtitle || undefined);
  const resolvedDisclaimer = disclaimerText ?? dict.disclaimer;
  const headerAlign = titleAlign ?? align;

  const items = useMemo(() => {
    const list = resolveProviders(providers, { labels, baseUrls });
    return list.map((provider) => ({
      provider,
      href: buildProviderUrl(provider, resolvedPrompt),
    }));
  }, [providers, labels, baseUrls, resolvedPrompt]);

  const px = iconSize ?? SIZE_PX[size];

  // Transient "prompt copied" confirmation after a copy handoff.
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toCssSize = (v: number | string | undefined) =>
    v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

  // Explicit sizes win over the `size` preset; `style` still wins over all.
  const rootStyle = useMemo(() => {
    const vars: Record<string, string> = {};
    const t = toCssSize(titleSize);
    const l = toCssSize(labelSize);
    if (t) vars["--aab-title-size"] = t;
    if (l) vars["--aab-label-size"] = l;
    return { ...vars, ...style } as CSSProperties;
  }, [titleSize, labelSize, style]);

  return (
    <section
      className={[
        "aab",
        `aab--${theme}`,
        `aab--${layout}`,
        `aab--${size}`,
        `aab--align-${align}`,
        iconsOnly ? "aab--icons-only" : "",
        showBorder ? "aab--bordered" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      aria-label={resolvedTitle}
      data-product={productName}
    >
      {!iconsOnly && (
        <header className={`aab__header aab__header--${headerAlign}`}>
          <h2 className="aab__title">
            {showTitleIcon && (
              <span className="aab__spark" aria-hidden="true">
                {titleIcon ?? "✦"}{" "}
              </span>
            )}
            {resolvedTitle}
          </h2>
          {resolvedSubtitle ? <p className="aab__subtitle">{resolvedSubtitle}</p> : null}
        </header>
      )}

      <nav className="aab__nav" aria-label="Ask an AI assistant">
        <ul className="aab__list">
          {items.map(({ provider, href }) => (
            <ProviderLink
              key={provider.id}
              provider={provider}
              href={href}
              prompt={resolvedPrompt}
              productName={productName}
              askTemplate={dict.askTemplate}
              iconSize={px}
              showLabels={showLabels}
              newTab={newTab}
              rel={rel}
              onProviderClick={onProviderClick}
              onCopied={(p) => {
                setCopiedId(p.id);
                window.setTimeout(() => {
                  setCopiedId((cur) => (cur === p.id ? null : cur));
                }, 4000);
              }}
            />
          ))}
        </ul>
      </nav>

      {showDisclaimer && !iconsOnly && (
        <p className="aab__disclaimer">{resolvedDisclaimer}</p>
      )}
      {copiedId && (
        <p className="aab__hint" role="status">
          {dict.copiedHint}
        </p>
      )}
    </section>
  );
}

export default AskAiBadge;
