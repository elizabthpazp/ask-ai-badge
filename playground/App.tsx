import { useMemo, useState } from "react";
import { AskAiBadge } from "../src/index";
import {
  BUILT_IN_LABELS,
  buildProviderUrl,
  copyTextToClipboard,
  resolvePrompt,
  resolveProviders,
} from "../src/providers";
import type {
  AskAiAlign,
  AskAiLayout,
  AskAiLocale,
  AskAiSize,
  AskAiTheme,
  BuiltInProviderId,
} from "../src/types";

const ALL: BuiltInProviderId[] = [
  "chatgpt",
  "claude",
  "gemini",
  "google",
  "perplexity",
  "grok",
];

function copy(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

export function App() {
  const [productName, setProductName] = useState("[Product]");
  const [productUrl, setProductUrl] = useState("https://example.com");
  const [description, setDescription] = useState("");
  const [locale, setLocale] = useState<AskAiLocale>("en");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState<AskAiTheme>("auto");
  const [layout, setLayout] = useState<AskAiLayout>("wrap");
  const [size, setSize] = useState<AskAiSize>("md");
  const [align, setAlign] = useState<AskAiAlign>("center");
  const [titleAlign, setTitleAlign] = useState<AskAiAlign | "">("");
  const [showLabels, setShowLabels] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const [newTab, setNewTab] = useState(true);
  const [iconsOnly, setIconsOnly] = useState(false);
  const [showTitleIcon, setShowTitleIcon] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerText, setDisclaimerText] = useState(
    "AI answers may vary. Verify important facts."
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    chatgpt: true,
    claude: true,
    gemini: true,
    google: false,
    perplexity: true,
    grok: true,
  });
  const [labels, setLabels] = useState<Record<string, string>>({
    ...BUILT_IN_LABELS,
  });
  const [titleSize, setTitleSize] = useState("");
  const [labelSize, setLabelSize] = useState("");
  const [iconSize, setIconSize] = useState("");
  const [darkPage, setDarkPage] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<"full" | "400" | "300">("full");
  const [copied, setCopied] = useState<string | null>(null);

  const providers = useMemo(
    () =>
      ALL.filter((id) => enabled[id]).map((id) => ({
        id,
        label: labels[id] || id,
      })),
    [enabled, labels]
  );

  const resolvedPrompt = useMemo(
    () =>
      resolvePrompt({
        prompt: prompt.trim() ? prompt : undefined,
        description: description.trim() ? description : undefined,
        productName: productName.trim() || "[Product]",
        productUrl: productUrl.trim() || undefined,
        locale,
      }),
    [prompt, description, productName, productUrl, locale]
  );

  const links = useMemo(() => {
    const list = resolveProviders(providers);
    return list.map((provider) => ({
      ...provider,
      href: buildProviderUrl(provider, resolvedPrompt),
    }));
  }, [providers, resolvedPrompt]);

  const code = useMemo(() => {
    const provStr = providers
      .map((p) =>
        p.label !== BUILT_IN_LABELS[p.id as BuiltInProviderId]
          ? `{ id: "${p.id}", label: "${p.label}" }`
          : `"${p.id}"`
      )
      .join(", ");
    const lines = [
      `import { AskAiBadge } from "ask-ai-badge";`,
      `import "ask-ai-badge/style.css";`,
      ``,
      `<AskAiBadge`,
      `  productName="${productName}"`,
      productUrl.trim() ? `  productUrl="${productUrl}"` : null,
      description.trim() ? `  description="${description}"` : null,
      locale !== "en" ? `  locale="${locale}"` : null,
      title.trim() ? `  title="${title}"` : null,
      showTitleIcon ? `  showTitleIcon` : null,
      subtitle.trim() ? `  subtitle="${subtitle}"` : null,
      prompt.trim() ? `  prompt="${prompt}"` : null,
      `  providers={[${provStr}]}`,
      theme !== "auto" ? `  theme="${theme}"` : null,
      layout !== "wrap" ? `  layout="${layout}"` : null,
      size !== "md" ? `  size="${size}"` : null,
      titleSize.trim() ? `  titleSize={${Number(titleSize)}}` : null,
      labelSize.trim() ? `  labelSize={${Number(labelSize)}}` : null,
      iconSize.trim() ? `  iconSize={${Number(iconSize)}}` : null,
      align !== "center" ? `  align="${align}"` : null,
      titleAlign ? `  titleAlign="${titleAlign}"` : null,
      showLabels ? `  showLabels` : null,
      showBorder ? `  showBorder` : null,
      !newTab ? `  newTab={false}` : null,
      iconsOnly ? `  iconsOnly` : null,
      showDisclaimer ? `  showDisclaimer` : null,
      showDisclaimer && disclaimerText !== "AI answers may vary. Verify important facts."
        ? `  disclaimerText="${disclaimerText}"`
        : null,
      `/>`,
    ].filter((l): l is string => l !== null);
    return lines.join("\n");
  }, [
    productName,
    productUrl,
    description,
    locale,
    title,
    showTitleIcon,
    subtitle,
    prompt,
    providers,
    theme,
    layout,
    size,
    titleSize,
    labelSize,
    iconSize,
    align,
    titleAlign,
    showLabels,
    showBorder,
    newTab,
    iconsOnly,
    showDisclaimer,
    disclaimerText,
  ]);

  const toggle = (id: string) =>
    setEnabled((e) => ({ ...e, [id]: !e[id] }));

  const flag = (
    label: string,
    value: boolean,
    set: (v: boolean) => void
  ) => (
    <label className="pg-check">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => set(e.target.checked)}
      />
      {label}
    </label>
  );

  return (
    <div className="pg">
      <header className="pg-top">
        <div>
          <h1>
            <span aria-hidden>✦</span> ask-ai-badge · Playground
          </h1>
          <p>
            Edita todo a la izquierda y mira el resultado en vivo. Los botones
            abren de verdad cada IA con tu prompt.
          </p>
        </div>
        <div className="pg-top-actions">
          <label className="pg-field pg-inline">
            Ancho vista
            <select
              value={previewWidth}
              onChange={(e) => setPreviewWidth(e.target.value as "full" | "400" | "300")}
            >
              <option value="full">Completo</option>
              <option value="400">400px (tablet)</option>
              <option value="300">300px (móvil)</option>
            </select>
          </label><button
            className={darkPage ? "pg-btn" : "pg-btn pg-btn--ghost"}
            onClick={() => setDarkPage((d) => !d)}
          >
            {darkPage ? "☀ Página clara" : "☾ Página oscura"}
          </button>
          <button
            className="pg-btn"
            onClick={() => {
              copy(code);
              setCopied("code");
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            {copied === "code" ? "✓ Copiado" : "⧉ Copiar código"}
          </button>
        </div>
      </header>

      <div className="pg-body">
        {/* ── Controles ─────────────────────────────── */}
        <aside className="pg-panel">
          <section>
            <h2>Textos</h2>
            <label className="pg-field">
              Producto
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="[Product]"
              />
            </label>
            <label className="pg-field">
              URL del producto
              <input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </label>
            <label className="pg-field">
              Título <code>{"{productName}"}</code>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vacío = según idioma"
              />
            </label>
            <label className="pg-field">
              Subtítulo
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="(opcional)"
              />
            </label>
            <label className="pg-field">
              Descripción del producto
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="[Product] is a CRM designed to help sales teams… (opcional)"
                rows={3}
              />
            </label>
            <label className="pg-field">
              Idioma (locale)
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as AskAiLocale)}
              >
                <option value="en">en — English</option>
                <option value="es">es — Español</option>
                <option value="fr">fr — Français</option>
                <option value="de">de — Deutsch</option>
                <option value="pt">pt — Português</option>
                <option value="it">it — Italiano</option>
              </select>
            </label>
            <label className="pg-field">
              Prompt enviado a las IAs
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Vacío = plantilla automática"
                rows={3}
              />
            </label>
            <p className="pg-hint">
              Prompt resuelto: <em>{resolvedPrompt}</em>
            </p>
          </section>

          <section>
            <h2>Proveedores y etiquetas</h2>
            {ALL.map((id) => (
              <div className="pg-prov" key={id}>
                <label className="pg-check">
                  <input
                    type="checkbox"
                    checked={!!enabled[id]}
                    onChange={() => toggle(id)}
                  />
                  <code>{id}</code>
                </label>
                <input
                  className="pg-label-input"
                  value={labels[id]}
                  onChange={(e) =>
                    setLabels((l) => ({ ...l, [id]: e.target.value }))
                  }
                  aria-label={`Etiqueta para ${id}`}
                />
              </div>
            ))}
          </section>

          <section>
            <h2>Apariencia</h2>
            <div className="pg-row">
              <label className="pg-field">
                Tema
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as AskAiTheme)}
                >
                  <option value="auto">auto</option>
                  <option value="light">light</option>
                  <option value="dark">dark</option>
                </select>
              </label>
              <label className="pg-field">
                Layout
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as AskAiLayout)}
                >
                  <option value="wrap">wrap</option>
                  <option value="row">row</option>
                  <option value="grid">grid</option>
                  <option value="compact">compact</option>
                </select>
              </label>
            </div>
            <div className="pg-row">
              <label className="pg-field">
                Tamaño
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as AskAiSize)}
                >
                  <option value="sm">sm</option>
                  <option value="md">md</option>
                  <option value="lg">lg</option>
                </select>
              </label>
              <label className="pg-field">
                Alineación
                <select
                  value={align}
                  onChange={(e) => setAlign(e.target.value as AskAiAlign)}
                >
                  <option value="start">start</option>
                  <option value="center">center</option>
                  <option value="end">end</option>
                  <option value="left">left</option>
                  <option value="right">right</option>
                </select>
              </label>
            </div>
            <label className="pg-field">
              Alineación del título
              <select
                value={titleAlign}
                onChange={(e) => setTitleAlign(e.target.value as AskAiAlign | "")}
              >
                <option value="">= alineación general</option>
                <option value="start">start</option>
                <option value="center">center</option>
                <option value="end">end</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </label>
            <div className="pg-row">
              <label className="pg-field">
                Título (px)
                <input
                  value={titleSize}
                  onChange={(e) => setTitleSize(e.target.value)}
                  placeholder="preset"
                  inputMode="numeric"
                />
              </label>
              <label className="pg-field">
                Etiqueta (px)
                <input
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value)}
                  placeholder="preset"
                  inputMode="numeric"
                />
              </label>
            </div>
            <label className="pg-field">
              Icono (px, global)
              <input
                value={iconSize}
                onChange={(e) => setIconSize(e.target.value)}
                placeholder="preset (18/22/26)"
                inputMode="numeric"
              />
            </label>
            <div className="pg-flags">
              {flag("Etiquetas", showLabels, setShowLabels)}
              {flag("Borde", showBorder, setShowBorder)}
              {flag("Icono título", showTitleIcon, setShowTitleIcon)}
              {flag("Abrir en pestaña nueva", newTab, setNewTab)}
              {flag("Solo iconos", iconsOnly, setIconsOnly)}
              {flag("Disclaimer", showDisclaimer, setShowDisclaimer)}
            </div>
            {showDisclaimer && (
              <label className="pg-field">
                Texto del disclaimer
                <input
                  value={disclaimerText}
                  onChange={(e) => setDisclaimerText(e.target.value)}
                />
              </label>
            )}
          </section>
        </aside>

        {/* ── Vista previa ──────────────────────────── */}
        <main className="pg-main">
          <section
            className={`pg-site${darkPage ? " pg-site--dark" : ""}`}
            style={
              previewWidth === "full"
                ? undefined
                : { maxWidth: `${previewWidth}px`, marginInline: "auto", width: "100%" }
            }
          >
            
            <div className="pg-site-hero">
              <p className="pg-site-kicker">TU WEB · HERO</p>
              <h2>{productName.trim() || "[Product]"}</h2>
              <p>Así se vería al final de tu página o en el footer.</p>
            </div>
            <footer className="pg-site-footer">
              <AskAiBadge
                productName={productName.trim() || "[Product]"}
                productUrl={productUrl.trim() || undefined}
                description={description.trim() || undefined}
                locale={locale}
                title={title.trim() ? title : undefined}
                showTitleIcon={showTitleIcon}
                subtitle={subtitle.trim() || undefined}
                prompt={prompt.trim() ? prompt : undefined}
                providers={providers}
                theme={theme}
                layout={layout}
                size={size}
                titleSize={titleSize.trim() ? Number(titleSize) : undefined}
                labelSize={labelSize.trim() ? Number(labelSize) : undefined}
                iconSize={iconSize.trim() ? Number(iconSize) : undefined}
                align={align}
                titleAlign={titleAlign || undefined}
                showLabels={showLabels}
                showBorder={showBorder}
                newTab={newTab}
                iconsOnly={iconsOnly}
                showDisclaimer={showDisclaimer}
                disclaimerText={disclaimerText}
              />
         
              <p className="pg-site-copy">
                © 2026 {productName.trim() || "[Product]"} · Footer de ejemplo
              </p>
            </footer>
          </section>

          <section className="pg-card">
            <h2>Enlaces generados</h2>
            {links.length === 0 && (
              <p className="pg-hint">Activa al menos un proveedor.</p>
            )}
            <ul className="pg-links">
              {links.map((l) => (
                <li key={l.id}>
                  <strong>
                    {l.label}
                    {l.prefill === "copy" && (
                      <em className="pg-hint"> · copia el prompt y abre la app</em>
                    )}
                    {l.prefill === "both" && (
                      <em className="pg-hint"> · abre con la pregunta (+ copia de respaldo)</em>
                    )}
                  </strong>
                  <code>{l.href}</code>
                  <div className="pg-links-actions">
                    {l.prefill === "copy" ? (
                      <button
                        className="pg-btn pg-btn--ghost pg-btn--sm"
                        onClick={() => {
                          void copyTextToClipboard(resolvedPrompt).then(() => {
                            window.open(l.href, "_blank", "noopener");
                          });
                        }}
                      >
                        Probar (copia + abre) →
                      </button>
                    ) : (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={
                          l.prefill === "both"
                            ? () => {
                                void copyTextToClipboard(resolvedPrompt);
                              }
                            : undefined
                        }
                      >
                        Probar →
                      </a>
                    )}
                    <button
                      className="pg-btn pg-btn--ghost pg-btn--sm"
                      onClick={() => {
                        copy(l.href);
                        setCopied(l.id);
                        setTimeout(() => setCopied(null), 1200);
                      }}
                    >
                      {copied === l.id ? "✓" : "⧉ Copiar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="pg-card">
            <h2>Código React</h2>
            <pre className="pg-code">{code}</pre>
          </section>
        </main>
      </div>
    </div>
  );
}
