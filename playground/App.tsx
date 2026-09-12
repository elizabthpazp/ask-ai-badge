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
  AskAiSize,
  AskAiTheme,
  BuiltInProviderId,
} from "../src/types";

type Lang = "en" | "es";

const STR = {
  en: {
    navTry: "Try it",
    navFooter: "Footer",
    navSetup: "Setup",
    heroEyebrow: "React · Zero dependencies · 6 languages",
    heroTitleA: "Let visitors",
    heroTitleB: "ask AI about your product.",
    heroSub: "One badge for your footer. It opens ChatGPT, Claude, Gemini, Perplexity and Grok with a question about you — already written.",
    ctaTry: "Try it live",
    ctaInstall: "npm i ask-ai-badge",
    copied: "Copied",
    chip1: "No backend",
    chip2: "5 AIs, 1 click",
    chip3: "~8 KB gzip",
    tryEyebrow: "Interactive demo",
    tryTitle: "Add your info. Watch it work.",
    trySub: "Everything updates live — including the code below.",
    gInfo: "Your product",
    fName: "Name",
    fUrl: "Website URL",
    fDesc: "Description",
    fDescPh: "[Product] is a [category] that helps [audience]…",
    fPrompt: "Custom prompt (optional)",
    fPromptPh: "Empty = automatic brief",
    gProviders: "Assistants",
    gLook: "Look & feel",
    fTheme: "Theme",
    fLayout: "Layout",
    fSize: "Size",
    fAlign: "Align",
    fTitleAlign: "Title align",
    fTitleAlignAuto: "= general align",
    fIconPx: "Icon px",
    advanced: "Fine sizes (px)",
    fTitlePx: "Title",
    fLabelPx: "Label",
    flLabels: "Names",
    flBorder: "Border",
    flTitleIcon: "Title icon",
    flNewTab: "New tab",
    flIconsOnly: "Icons only",
    flDisclaimer: "Disclaimer",
    resolved: "Prompt sent to the AIs:",
    stageDesktop: "Desktop",
    stageTablet: "Tablet",
    stageMobile: "Mobile",
    footerEyebrow: "Real example",
    footerTitle: "This is how it looks in a footer.",
    footerSub: "Same live badge, inside a typical website footer.",
    colProduct: "Product",
    colCompany: "Company",
    colResources: "Resources",
    colLegal: "Legal",
    rights: "All rights reserved.",
    setupEyebrow: "Setup",
    setupTitle: "Three steps. No backend.",
    s1t: "Install",
    s2t: "Import",
    s2d: "Component + styles.",
    s3t: "Drop it",
    s3d: "Footer, pricing, docs — anywhere.",
    codeTitle: "Your code, generated live",
    linksTitle: "Generated links",
    noProviders: "Enable at least one assistant.",
    tryBtn: "Try →",
    tryCopyBtn: "Try (copy + open) →",
    copyNote: "· copies the prompt, opens the app",
    bothNote: "· opens with the question (+ backup copy)",
    copyBtn: "Copy",
    tick: "✓",
    madeWith: "MIT · Zero dependencies · Tree-shakeable",
  },
  es: {
    navTry: "Pruébalo",
    navFooter: "Footer",
    navSetup: "Instalar",
    heroEyebrow: "React · Cero dependencias · 6 idiomas",
    heroTitleA: "Deja que pregunten",
    heroTitleB: "a la IA sobre tu producto.",
    heroSub: "Un badge para tu footer. Abre ChatGPT, Claude, Gemini, Perplexity y Grok con una pregunta sobre ti — ya escrita.",
    ctaTry: "Pruébalo en vivo",
    ctaInstall: "npm i ask-ai-badge",
    copied: "Copiado",
    chip1: "Sin backend",
    chip2: "5 IAs, 1 clic",
    chip3: "~8 KB gzip",
    tryEyebrow: "Demo interactiva",
    tryTitle: "Agrega tu info. Míralo funcionar.",
    trySub: "Todo se actualiza en vivo — incluido el código de abajo.",
    gInfo: "Tu producto",
    fName: "Nombre",
    fUrl: "URL del sitio",
    fDesc: "Descripción",
    fDescPh: "[Product] es un(a) [categoría] que ayuda a [audiencia]…",
    fPrompt: "Prompt custom (opcional)",
    fPromptPh: "Vacío = brief automático",
    gProviders: "Asistentes",
    gLook: "Apariencia",
    fTheme: "Tema",
    fLayout: "Layout",
    fSize: "Tamaño",
    fAlign: "Alineación",
    fTitleAlign: "Título alinear",
    fTitleAlignAuto: "= alineación general",
    fIconPx: "Icono px",
    advanced: "Tamaños finos (px)",
    fTitlePx: "Título",
    fLabelPx: "Etiqueta",
    flLabels: "Nombres",
    flBorder: "Borde",
    flTitleIcon: "Icono título",
    flNewTab: "Pestaña nueva",
    flIconsOnly: "Solo iconos",
    flDisclaimer: "Disclaimer",
    resolved: "Prompt enviado a las IAs:",
    stageDesktop: "Escritorio",
    stageTablet: "Tablet",
    stageMobile: "Móvil",
    footerEyebrow: "Ejemplo real",
    footerTitle: "Así se ve en un footer.",
    footerSub: "El mismo badge en vivo, dentro de un footer típico.",
    colProduct: "Producto",
    colCompany: "Empresa",
    colResources: "Recursos",
    colLegal: "Legal",
    rights: "Todos los derechos reservados.",
    setupEyebrow: "Instalación",
    setupTitle: "Tres pasos. Sin backend.",
    s1t: "Instala",
    s2t: "Importa",
    s2d: "Componente + estilos.",
    s3t: "Suéltalo",
    s3d: "Footer, pricing, docs — donde sea.",
    codeTitle: "Tu código, generado en vivo",
    linksTitle: "Enlaces generados",
    noProviders: "Activa al menos un asistente.",
    tryBtn: "Probar →",
    tryCopyBtn: "Probar (copia + abre) →",
    copyNote: "· copia el prompt y abre la app",
    bothNote: "· abre con la pregunta (+ copia de respaldo)",
    copyBtn: "Copiar",
    tick: "✓",
    madeWith: "MIT · Cero dependencias · Tree-shakeable",
  },
} satisfies Record<Lang, Record<string, string>>;

const ALL: BuiltInProviderId[] = ["chatgpt", "claude", "gemini", "google", "perplexity", "grok"];

const FOOT_LINKS: Record<string, string[]> = {
  colProduct: ["Features", "Pricing", "Changelog", "Roadmap"],
  colCompany: ["About", "Blog", "Careers", "Contact"],
  colResources: ["Docs", "API", "Status", "Community"],
  colLegal: ["Privacy", "Terms", "Security", "Cookies"],
};

export function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const t = STR[lang];

  const [productName, setProductName] = useState("[Product]");
  const [productUrl, setProductUrl] = useState("https://example.com");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState<AskAiTheme>("auto");
  const [layout, setLayout] = useState<AskAiLayout>("wrap");
  const [size, setSize] = useState<AskAiSize>("md");
  const [align, setAlign] = useState<AskAiAlign>("center");
  const [titleAlign, setTitleAlign] = useState<AskAiAlign | "">("");
  const [iconSize, setIconSize] = useState("");
  const [titleSize, setTitleSize] = useState("");
  const [labelSize, setLabelSize] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const [showBorder, setShowBorder] = useState(false);
  const [showTitleIcon, setShowTitleIcon] = useState(false);
  const [newTab, setNewTab] = useState(true);
  const [iconsOnly, setIconsOnly] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [stageW, setStageW] = useState<"full" | "480" | "320">("full");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    chatgpt: true, claude: true, gemini: true, google: false, perplexity: true, grok: true,
  });
  const [labels, setLabels] = useState<Record<string, string>>({ ...BUILT_IN_LABELS });

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1400);
  };

  const providers = useMemo(
    () => ALL.filter((id) => enabled[id]).map((id) => ({ id, label: labels[id] || id })),
    [enabled, labels]
  );

  const resolvedPrompt = useMemo(
    () =>
      resolvePrompt({
        prompt: prompt.trim() ? prompt : undefined,
        description: description.trim() ? description : undefined,
        productName: productName.trim() || "[Product]",
        productUrl: productUrl.trim() || undefined,
        locale: lang,
      }),
    [prompt, description, productName, productUrl, lang]
  );

  const links = useMemo(() => {
    const list = resolveProviders(providers);
    return list.map((provider) => ({ ...provider, href: buildProviderUrl(provider, resolvedPrompt) }));
  }, [providers, resolvedPrompt]);

  const badge = (
    <AskAiBadge
      productName={productName.trim() || "[Product]"}
      productUrl={productUrl.trim() || undefined}
      description={description.trim() || undefined}
      locale={lang}
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
      showTitleIcon={showTitleIcon}
      newTab={newTab}
      iconsOnly={iconsOnly}
      showDisclaimer={showDisclaimer}
    />
  );

  const code = useMemo(() => {
    const provStr = providers
      .map((p) =>
        p.label !== BUILT_IN_LABELS[p.id as BuiltInProviderId]
          ? `{ id: "${p.id}", label: "${p.label}" }`
          : `"${p.id}"`
      )
      .join(", ");
    return [
      `import { AskAiBadge } from "ask-ai-badge";`,
      `import "ask-ai-badge/style.css";`,
      ``,
      `<AskAiBadge`,
      `  productName="${productName}"`,
      productUrl.trim() ? `  productUrl="${productUrl}"` : null,
      description.trim() ? `  description="${description}"` : null,
      `  locale="${lang}"`,
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
      showTitleIcon ? `  showTitleIcon` : null,
      !newTab ? `  newTab={false}` : null,
      iconsOnly ? `  iconsOnly` : null,
      showDisclaimer ? `  showDisclaimer` : null,
      `/>`,
    ]
      .filter((l): l is string => l !== null)
      .join("\n");
  }, [productName, productUrl, description, lang, providers, theme, layout, size, titleSize, labelSize, iconSize, align, titleAlign, showLabels, showBorder, showTitleIcon, newTab, iconsOnly, showDisclaimer]);

  const flag = (label: string, value: boolean, set: (v: boolean) => void) => (
    <label className="p2-check" key={label}>
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div className={`p2${dark ? " p2--dark" : ""}`}>
      {/* NAV */}
      <nav className="p2-nav">
        <a className="p2-brand" href="#top">
          <span aria-hidden>✦</span> ask-ai-badge
        </a>
        <div className="p2-nav-right">
          <a href="#try">{t.navTry}</a>
          <a href="#footer-demo">{t.navFooter}</a>
          <a href="#setup">{t.navSetup}</a>
          <div className="p2-seg" role="group" aria-label="Language">
            {(["en", "es"] as Lang[]).map((l) => (
              <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="p2-iconbtn" onClick={() => setDark((d) => !d)} aria-label="theme">
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="p2-hero" id="top">
        <p className="p2-eyebrow">{t.heroEyebrow}</p>
        <h1>
          {t.heroTitleA}
          <br />
          {t.heroTitleB}
        </h1>
        <p className="p2-sub">{t.heroSub}</p>
        <div className="p2-cta">
          <a href="#try" className="p2-btn">{t.ctaTry} ↓</a>
          <button className="p2-btn p2-btn--ghost" onClick={() => copy("npm i ask-ai-badge", "install")}>
            <code>{t.ctaInstall}</code> {copiedId === "install" ? t.tick : "⧉"}
          </button>
        </div>
        <div className="p2-chips">
          <span>{t.chip1}</span>
          <span>{t.chip2}</span>
          <span>{t.chip3}</span>
        </div>
      </header>

      {/* TRY */}
      <section className="p2-section" id="try">
        <p className="p2-eyebrow">{t.tryEyebrow}</p>
        <h2>{t.tryTitle}</h2>
        <p className="p2-sub">{t.trySub}</p>

        <div className="p2-try">
          <aside className="p2-controls">
            <h3>{t.gInfo}</h3>
            <label>{t.fName}<input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="[Product]" /></label>
            <label>{t.fUrl}<input value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://example.com" /></label>
            <label>{t.fDesc}<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.fDescPh} rows={2} /></label>
            <label>{t.fPrompt}<input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.fPromptPh} /></label>

            <h3>{t.gProviders}</h3>
            <div className="p2-provs">
              {ALL.map((id) => (
                <label key={id} className={`p2-prov${enabled[id] ? " on" : ""}`}>
                  <input type="checkbox" checked={!!enabled[id]} onChange={() => setEnabled((e) => ({ ...e, [id]: !e[id] }))} />
                  {labels[id]}
                </label>
              ))}
            </div>

            <h3>{t.gLook}</h3>
            <div className="p2-grid2">
              <label>{t.fTheme}
                <select value={theme} onChange={(e) => setTheme(e.target.value as AskAiTheme)}>
                  <option value="auto">auto</option><option value="light">light</option><option value="dark">dark</option>
                </select>
              </label>
              <label>{t.fLayout}
                <select value={layout} onChange={(e) => setLayout(e.target.value as AskAiLayout)}>
                  <option value="wrap">wrap</option><option value="row">row</option>
                  <option value="grid">grid</option><option value="compact">compact</option>
                </select>
              </label>
              <label>{t.fSize}
                <select value={size} onChange={(e) => setSize(e.target.value as AskAiSize)}>
                  <option value="sm">sm</option><option value="md">md</option><option value="lg">lg</option>
                </select>
              </label>
              <label>{t.fAlign}
                <select value={align} onChange={(e) => setAlign(e.target.value as AskAiAlign)}>
                  <option value="start">start</option><option value="center">center</option><option value="end">end</option>
                </select>
              </label>
              <label>{t.fTitleAlign}
                <select value={titleAlign} onChange={(e) => setTitleAlign(e.target.value as AskAiAlign | "")}>
                  <option value="">{t.fTitleAlignAuto}</option>
                  <option value="start">start</option><option value="center">center</option><option value="end">end</option>
                </select>
              </label>
              <label>{t.fIconPx}
                <input value={iconSize} onChange={(e) => setIconSize(e.target.value)} placeholder="auto" inputMode="numeric" />
              </label>
            </div>
            <details className="p2-details">
              <summary>{t.advanced}</summary>
              <div className="p2-grid2">
                <label>{t.fTitlePx}<input value={titleSize} onChange={(e) => setTitleSize(e.target.value)} placeholder="auto" inputMode="numeric" /></label>
                <label>{t.fLabelPx}<input value={labelSize} onChange={(e) => setLabelSize(e.target.value)} placeholder="auto" inputMode="numeric" /></label>
              </div>
            </details>
            <div className="p2-flags">
              {flag(t.flLabels, showLabels, setShowLabels)}
              {flag(t.flBorder, showBorder, setShowBorder)}
              {flag(t.flTitleIcon, showTitleIcon, setShowTitleIcon)}
              {flag(t.flNewTab, newTab, setNewTab)}
              {flag(t.flIconsOnly, iconsOnly, setIconsOnly)}
              {flag(t.flDisclaimer, showDisclaimer, setShowDisclaimer)}
            </div>
            <p className="p2-resolved"><strong>{t.resolved}</strong> {resolvedPrompt}</p>
          </aside>

          <div className="p2-stage">
            <div className="p2-stage-bar">
              <span className="p2-dots" aria-hidden><i /><i /><i /></span>
              <div className="p2-seg">
                {(["full", "480", "320"] as const).map((w) => (
                  <button key={w} className={stageW === w ? "on" : ""} onClick={() => setStageW(w)}>
                    {w === "full" ? "◦" : w}
                  </button>
                ))}
              </div>
              <span className="p2-stage-name">
                {stageW === "full" ? t.stageDesktop : stageW === "480" ? t.stageTablet : t.stageMobile}
              </span>
            </div>
            <div
              className="p2-showcase"
              style={stageW === "full" ? undefined : { maxWidth: `${stageW}px`, marginInline: "auto", width: "100%" }}
            >
              <p className="p2-kicker">{productUrl.trim() || "https://example.com"}</p>
              <h2 className="p2-product">{productName.trim() || "[Product]"}</h2>
              {description.trim() && <p className="p2-desc">{description.trim()}</p>}
              <div className="p2-badgebox">{badge}</div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL FOOTER */}
      <section className="p2-section" id="footer-demo">
        <p className="p2-eyebrow">{t.footerEyebrow}</p>
        <h2>{t.footerTitle}</h2>
        <p className="p2-sub">{t.footerSub}</p>
        <footer className="p2-realfooter">
          <div className="p2-realfooter-badge">{badge}</div>
          <div className="p2-realfooter-cols">
            {(Object.keys(FOOT_LINKS) as (keyof typeof FOOT_LINKS)[]).map((col) => (
              <div key={col}>
                <h4>{t[col as keyof typeof STR.en]}</h4>
                <ul>
                  {FOOT_LINKS[col].map((l) => (
                    <li key={l}><a href="#footer-demo">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="p2-realfooter-bottom">
            <span>© 2026 {productName.trim() || "[Product]"}</span>
            <span>{t.rights}</span>
          </div>
        </footer>
      </section>

      {/* SETUP */}
      <section className="p2-section" id="setup">
        <p className="p2-eyebrow">{t.setupEyebrow}</p>
        <h2>{t.setupTitle}</h2>
        <div className="p2-steps">
          <div className="p2-step"><span>1</span><div><h4>{t.s1t}</h4><code>npm i ask-ai-badge</code></div></div>
          <div className="p2-step"><span>2</span><div><h4>{t.s2t}</h4><p>{t.s2d}</p><code>import {"{AskAiBadge}"} from "ask-ai-badge";</code></div></div>
          <div className="p2-step"><span>3</span><div><h4>{t.s3t}</h4><p>{t.s3d}</p><code>{`<AskAiBadge productName="${productName.trim() || "[Product]"}" />`}</code></div></div>
        </div>
        <div className="p2-grid2col">
          <div className="p2-card">
            <div className="p2-card-head"><h3>{t.codeTitle}</h3>
              <button className="p2-btn p2-btn--sm" onClick={() => copy(code, "code")}>
                {copiedId === "code" ? t.copied : t.copyBtn}
              </button>
            </div>
            <pre className="p2-code">{code}</pre>
          </div>
          <div className="p2-card">
            <h3>{t.linksTitle}</h3>
            {links.length === 0 && <p className="p2-muted">{t.noProviders}</p>}
            <ul className="p2-links">
              {links.map((l) => (
                <li key={l.id}>
                  <strong>{l.label}
                    {l.prefill === "copy" && <em> {t.copyNote}</em>}
                    {l.prefill === "both" && <em> {t.bothNote}</em>}
                  </strong>
                  <code>{l.href}</code>
                  <div className="p2-links-actions">
                    {l.prefill === "copy" ? (
                      <button
                        onClick={() => {
                          void copyTextToClipboard(resolvedPrompt).then(() => window.open(l.href, "_blank", "noopener"));
                        }}
                      >{t.tryCopyBtn}</button>
                    ) : (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={l.prefill === "both" ? () => { void copyTextToClipboard(resolvedPrompt); } : undefined}
                      >{t.tryBtn}</a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="p2-mini">✦ ask-ai-badge — {t.madeWith}</footer>
    </div>
  );
}
