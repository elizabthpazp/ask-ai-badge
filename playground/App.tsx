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
  AskAiLabelPosition,
  AskAiLayout,
  AskAiSize,
  AskAiTheme,
  BuiltInProviderId,
} from "../src/types";

type Lang = "en" | "es";
type CtrlTab = "product" | "style" | "providers";
type OutputTab = "code" | "links";
type PkgManager = "npm" | "pnpm" | "bun" | "yarn";

const PKG_CONFIG: Record<
  PkgManager,
  {
    cmd: string;
    arg: string;
    pkg: string;
    color: string;
    accentBg: string;
    label: string;
  }
> = {
  npm: {
    cmd: "npm",
    arg: "i",
    pkg: "ask-ai-badge",
    color: "#ff4d4f",
    accentBg: "rgba(255, 77, 79, 0.16)",
    label: "npm",
  },
  pnpm: {
    cmd: "pnpm",
    arg: "add",
    pkg: "ask-ai-badge",
    color: "#f97316",
    accentBg: "rgba(249, 115, 22, 0.16)",
    label: "pnpm",
  },
  bun: {
    cmd: "bun",
    arg: "add",
    pkg: "ask-ai-badge",
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.16)",
    label: "bun",
  },
  yarn: {
    cmd: "yarn",
    arg: "add",
    pkg: "ask-ai-badge",
    color: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.16)",
    label: "yarn",
  },
};

function NpmLogo({ className = "p2-npm-logo" }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 250" className={className} aria-label="npm">
      <path
        fill="#cb3837"
        d="M240,250h100v-50h100V0H240V250z M340,50h50v100h-50V50z M480,0v200h100V50h50v150h50V50h50v150h50V0H480z M0,200h100V50h50v150h50V0H0V200z"
      />
    </svg>
  );
}

const STR = {
  en: {
    navTry: "Try it",
    navFooter: "Footer",
    navSetup: "Setup",
    heroEyebrow: "React · Zero dependencies · 6 languages",
    heroTitleA: "Let visitors ",
    heroTitleB: "ask AI about your product.",
    heroSub: "One badge for your footer. It opens ChatGPT, Claude, Gemini, Perplexity and Grok with a question about you — already written.",
    ctaTry: "Try it live",
    ctaSetup: "Setup guide",
    ctaInstall: "npm i ask-ai-badge",
    copied: "Copied",
    terminalCopy: "Copy",
    terminalCopied: "Copied!",
    terminalClickToCopy: "Click to copy",
    chip1: "No backend",
    chip2: "5 AIs, 1 click",
    chip3: "~8 KB gzip",
    tryEyebrow: "Interactive demo",
    tryTitle: "Add your info. Watch it work.",
    trySub: "Everything updates live — including the code below.",
    tabProduct: "Product",
    tabStyle: "Style",
    tabProviders: "AIs",
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
    fLabelPos: "Label position",
    fLabelPosBottom: "Underneath",
    fLabelPosSide: "Beside icon",
    fFontSize: "Font size (px)",
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
    resolved: "Prompt sent to AIs:",
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
    codeTitle: "Generated code",
    linksTitle: "Generated links",
    noProviders: "Enable at least one assistant.",
    tryBtn: "Try →",
    tryCopyBtn: "Try (copy + open) →",
    copyNote: "· copies the prompt, opens the app",
    bothNote: "· opens with the question (+ backup copy)",
    copyBtn: "Copy",
    tick: "✓",
    madeWith: "MIT · Zero dependencies · Tree-shakeable",
    outputCode: "Code",
    outputLinks: "Links",
  },
  es: {
    navTry: "Pruébalo",
    navFooter: "Footer",
    navSetup: "Instalar",
    heroEyebrow: "React · Cero dependencias · 6 idiomas",
    heroTitleA: "Deja que pregunten ",
    heroTitleB: "a la IA sobre tu producto.",
    heroSub: "Un badge para tu footer. Abre ChatGPT, Claude, Gemini, Perplexity y Grok con una pregunta sobre ti — ya escrita.",
    ctaTry: "Pruébalo en vivo",
    ctaSetup: "Ver instalación",
    ctaInstall: "npm i ask-ai-badge",
    copied: "Copiado",
    terminalCopy: "Copiar",
    terminalCopied: "¡Copiado!",
    terminalClickToCopy: "Clic para copiar",
    chip1: "Sin backend",
    chip2: "5 IAs, 1 clic",
    chip3: "~8 KB gzip",
    tryEyebrow: "Demo interactiva",
    tryTitle: "Agrega tu info. Míralo funcionar.",
    trySub: "Todo se actualiza en vivo — incluido el código de abajo.",
    tabProduct: "Producto",
    tabStyle: "Estilo",
    tabProviders: "IAs",
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
    fLabelPos: "Posición nombres",
    fLabelPosBottom: "Abajo",
    fLabelPosSide: "Al lado",
    fFontSize: "Tamaño letra (px)",
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
    outputCode: "Código",
    outputLinks: "Enlaces",
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

  // Control panel tabs
  const [ctrlTab, setCtrlTab] = useState<CtrlTab>("product");
  // Output tabs (code vs links)
  const [outputTab, setOutputTab] = useState<OutputTab>("code");
  // Package manager for hero terminal
  const [pkgMgr, setPkgMgr] = useState<PkgManager>("npm");

  const [productName, setProductName] = useState("[Product]");
  const [productUrl, setProductUrl] = useState("https://example.com");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState<AskAiTheme>("auto");
  const [layout, setLayout] = useState<AskAiLayout>("wrap");
  const [size, setSize] = useState<AskAiSize>("md");
  const [fontSize, setFontSize] = useState("");
  const [align, setAlign] = useState<AskAiAlign>("center");
  const [titleAlign, setTitleAlign] = useState<AskAiAlign | "">("");
  const [iconSize, setIconSize] = useState("");
  const [titleSize, setTitleSize] = useState("");
  const [labelSize, setLabelSize] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const [labelPosition, setLabelPosition] = useState<AskAiLabelPosition>("bottom");
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
    navigator.clipboard?.writeText(text).catch(() => { });
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
      fontSize={fontSize.trim() ? Number(fontSize) : undefined}
      titleSize={titleSize.trim() ? Number(titleSize) : undefined}
      labelSize={labelSize.trim() ? Number(labelSize) : undefined}
      iconSize={iconSize.trim() ? Number(iconSize) : undefined}
      align={align}
      titleAlign={titleAlign || undefined}
      showLabels={showLabels}
      labelPosition={labelPosition}
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
      fontSize.trim() ? `  fontSize={${Number(fontSize)}}` : null,
      titleSize.trim() ? `  titleSize={${Number(titleSize)}}` : null,
      labelSize.trim() ? `  labelSize={${Number(labelSize)}}` : null,
      iconSize.trim() ? `  iconSize={${Number(iconSize)}}` : null,
      align !== "center" ? `  align="${align}"` : null,
      titleAlign ? `  titleAlign="${titleAlign}"` : null,
      showLabels ? `  showLabels` : null,
      showLabels && labelPosition !== "bottom" ? `  labelPosition="${labelPosition}"` : null,
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
        <div className="p2-brand-group">
          <a className="p2-brand" href="#top">
            <span aria-hidden>✦</span> ask-ai-badge
          </a>
          <a
            href="https://elijs.dev/"
            target="_blank"
            rel="noreferrer"
            className="p2-creator-pill"
            title="Created by elijs.dev"
          >
            <span className="p2-creator-sparkle" aria-hidden="true">✨</span>
            <span>by <strong>elijs.dev</strong></span>
          </a>
        </div>
        <div className="p2-nav-right">
          <a href="#try">{t.navTry}</a>
          <a href="#footer-demo">{t.navFooter}</a>
          <a href="#setup">{t.navSetup}</a>
          <a
            href="https://www.npmjs.com/package/ask-ai-badge"
            target="_blank"
            rel="noreferrer"
            className="p2-npm-nav"
            title="ask-ai-badge on npm"
          >
            <NpmLogo />
            <span className="p2-npm-ver">v1.0.3</span>
          </a>
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
          <span className="p2-grad">{t.heroTitleB}</span>
        </h1>
        <p className="p2-sub">{t.heroSub}</p>

        {/* Interactive terminal */}
        <div className="p2-terminal-wrapper">
          <div className="p2-terminal" role="region" aria-label="Terminal install command">
            <div className="p2-terminal-bar">
              <div className="p2-terminal-dots" aria-hidden="true">
                <span className="p2-tdot p2-tdot-close" />
                <span className="p2-tdot p2-tdot-min" />
                <span className="p2-tdot p2-tdot-max" />
              </div>

              <div className="p2-terminal-tabs" role="tablist" aria-label="Package managers">
                {(["npm", "pnpm", "bun", "yarn"] as PkgManager[]).map((pm) => {
                  const active = pkgMgr === pm;
                  const cfg = PKG_CONFIG[pm];
                  return (
                    <button
                      key={pm}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`p2-terminal-tab ${active ? "active" : ""}`}
                      onClick={() => setPkgMgr(pm)}
                      style={{
                        "--tab-color": cfg.color,
                        "--tab-bg": cfg.accentBg,
                      } as React.CSSProperties}
                    >
                      <span className="p2-tab-dot" aria-hidden="true" />
                      <span className="p2-tab-name">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className={`p2-terminal-copy-btn ${copiedId === "terminal" ? "copied" : ""}`}
                onClick={() =>
                  copy(
                    `${PKG_CONFIG[pkgMgr].cmd} ${PKG_CONFIG[pkgMgr].arg} ${PKG_CONFIG[pkgMgr].pkg}`,
                    "terminal"
                  )
                }
                title={t.terminalClickToCopy}
                aria-label="Copy install command"
              >
                {copiedId === "terminal" ? (
                  <>
                    <svg className="p2-ticon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13.25 4.75 6 12 2.75 8.75" />
                    </svg>
                    <span>{t.terminalCopied}</span>
                  </>
                ) : (
                  <>
                    <svg className="p2-ticon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{t.terminalCopy}</span>
                  </>
                )}
              </button>
            </div>

            <div
              className="p2-terminal-body"
              onClick={() =>
                copy(
                  `${PKG_CONFIG[pkgMgr].cmd} ${PKG_CONFIG[pkgMgr].arg} ${PKG_CONFIG[pkgMgr].pkg}`,
                  "terminal"
                )
              }
              title={t.terminalClickToCopy}
            >
              <div className="p2-terminal-line">
                <span className="p2-t-path" aria-hidden="true">~</span>
                <span className="p2-t-prompt" aria-hidden="true">❯</span>
                <span
                  className="p2-t-cmd"
                  style={{ color: PKG_CONFIG[pkgMgr].color }}
                >
                  {PKG_CONFIG[pkgMgr].cmd}
                </span>
                <span className="p2-t-arg">{PKG_CONFIG[pkgMgr].arg}</span>
                <span className="p2-t-pkg">{PKG_CONFIG[pkgMgr].pkg}</span>
                <span className="p2-t-cursor" aria-hidden="true" />
              </div>
              <span className="p2-t-hint">{copiedId === "terminal" ? `✓ ${t.terminalCopied}` : t.terminalClickToCopy}</span>
            </div>
          </div>
        </div>

        <div className="p2-cta">
          <a href="#try" className="p2-btn">{t.ctaTry} ↓</a>
          <a href="#setup" className="p2-btn p2-btn--ghost">{t.ctaSetup} →</a>
        </div>
        <div className="p2-chips">
          <span>{t.chip1}</span>
          <span>{t.chip2}</span>
          <span>{t.chip3}</span>
          <a
            href="https://elijs.dev/"
            target="_blank"
            rel="noreferrer"
            className="p2-chip-creator"
            title="Portfolio de Eli"
          >
            ✦ by <strong>elijs.dev</strong>
          </a>
        </div>
      </header>

      {/* TRY — Interactive demo */}
      <section className="p2-section" id="try">
        <p className="p2-eyebrow">{t.tryEyebrow}</p>
        <h2>{t.tryTitle}</h2>
        <p className="p2-sub">{t.trySub}</p>

        <div className="p2-try">
          {/* Tabbed controls panel */}
          <aside className="p2-controls">
            <div className="p2-ctrl-tabs">
              {(["product", "style", "providers"] as CtrlTab[]).map((tab) => (
                <button key={tab} className={ctrlTab === tab ? "on" : ""} onClick={() => setCtrlTab(tab)}>
                  {tab === "product" ? t.tabProduct : tab === "style" ? t.tabStyle : t.tabProviders}
                </button>
              ))}
            </div>

            <div className="p2-ctrl-body" key={ctrlTab}>
              {/* Product tab */}
              {ctrlTab === "product" && (
                <>
                  <label>{t.fName}<input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="[Product]" /></label>
                  <label>{t.fUrl}<input value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://example.com" /></label>
                  <label>{t.fDesc}<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.fDescPh} rows={2} /></label>
                  <label>{t.fPrompt}<input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.fPromptPh} /></label>
                  <p className="p2-resolved"><strong>{t.resolved}</strong> {resolvedPrompt}</p>
                </>
              )}

              {/* Style tab */}
              {ctrlTab === "style" && (
                <>
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
                    <label>{t.fFontSize}
                      <input value={fontSize} onChange={(e) => setFontSize(e.target.value)} placeholder="auto (px)" inputMode="numeric" />
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
                    <label>{t.fLabelPos}
                      <select
                        value={labelPosition}
                        onChange={(e) => {
                          const pos = e.target.value as AskAiLabelPosition;
                          setLabelPosition(pos);
                          if (pos === "side" && !showLabels) setShowLabels(true);
                        }}
                      >
                        <option value="bottom">{t.fLabelPosBottom}</option>
                        <option value="side">{t.fLabelPosSide}</option>
                      </select>
                    </label>
                    <label>{t.fIconPx}
                      <input value={iconSize} onChange={(e) => setIconSize(e.target.value)} placeholder="auto (px)" inputMode="numeric" />
                    </label>
                  </div>
                  <details className="p2-details" open={Boolean(titleSize || labelSize)}>
                    <summary>{t.advanced}</summary>
                    <div className="p2-grid2">
                      <label>{t.fTitlePx}<input value={titleSize} onChange={(e) => setTitleSize(e.target.value)} placeholder="auto (px)" inputMode="numeric" /></label>
                      <label>{t.fLabelPx}<input value={labelSize} onChange={(e) => setLabelSize(e.target.value)} placeholder="auto (px)" inputMode="numeric" /></label>
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
                </>
              )}

              {/* Providers tab */}
              {ctrlTab === "providers" && (
                <>
                  <h3>{t.gProviders}</h3>
                  <div className="p2-provs">
                    {ALL.map((id) => (
                      <label key={id} className={`p2-prov${enabled[id] ? " on" : ""}`}>
                        <input type="checkbox" checked={!!enabled[id]} onChange={() => setEnabled((e) => ({ ...e, [id]: !e[id] }))} />
                        {labels[id]}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Live preview stage */}
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

      {/* FOOTER DEMO */}
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
        <div className="p2-steps-grid">
          {/* STEP 1: Install */}
          <div
            className="p2-step-term"
            onClick={() => copy(`${PKG_CONFIG[pkgMgr].cmd} ${PKG_CONFIG[pkgMgr].arg} ${PKG_CONFIG[pkgMgr].pkg}`, "step1")}
            title={t.terminalClickToCopy}
          >
            <div className="p2-step-term-bar">
              <div className="p2-step-dots" aria-hidden="true">
                <span className="p2-tdot p2-tdot-close" />
                <span className="p2-tdot p2-tdot-min" />
                <span className="p2-tdot p2-tdot-max" />
              </div>
              <div className="p2-step-pill">
                <span className="p2-step-num">01</span>
                <span className="p2-step-name">{t.s1t}</span>
              </div>
              <button
                type="button"
                className={`p2-step-copy ${copiedId === "step1" ? "copied" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  copy(`${PKG_CONFIG[pkgMgr].cmd} ${PKG_CONFIG[pkgMgr].arg} ${PKG_CONFIG[pkgMgr].pkg}`, "step1");
                }}
                aria-label="Copy step 1"
                title={t.terminalClickToCopy}
              >
                {copiedId === "step1" ? "✓" : "⧉"}
              </button>
            </div>
            <div className="p2-step-term-body">
              <div className="p2-terminal-line">
                <span className="p2-t-prompt">$</span>
                <span className="p2-t-cmd" style={{ color: PKG_CONFIG[pkgMgr].color }}>{PKG_CONFIG[pkgMgr].cmd}</span>
                <span className="p2-t-arg">{PKG_CONFIG[pkgMgr].arg}</span>
                <span className="p2-t-pkg">{PKG_CONFIG[pkgMgr].pkg}</span>
              </div>
              <p className="p2-step-desc">✦ {t.chip1} · ~8 KB gzip</p>
            </div>
          </div>

          {/* STEP 2: Import */}
          <div
            className="p2-step-term"
            onClick={() => copy(`import { AskAiBadge } from "ask-ai-badge";\nimport "ask-ai-badge/style.css";`, "step2")}
            title={t.terminalClickToCopy}
          >
            <div className="p2-step-term-bar">
              <div className="p2-step-dots" aria-hidden="true">
                <span className="p2-tdot p2-tdot-close" />
                <span className="p2-tdot p2-tdot-min" />
                <span className="p2-tdot p2-tdot-max" />
              </div>
              <div className="p2-step-pill">
                <span className="p2-step-num">02</span>
                <span className="p2-step-name">{t.s2t}</span>
              </div>
              <button
                type="button"
                className={`p2-step-copy ${copiedId === "step2" ? "copied" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  copy(`import { AskAiBadge } from "ask-ai-badge";\nimport "ask-ai-badge/style.css";`, "step2");
                }}
                aria-label="Copy step 2"
                title={t.terminalClickToCopy}
              >
                {copiedId === "step2" ? "✓" : "⧉"}
              </button>
            </div>
            <div className="p2-step-term-body">
              <div className="p2-terminal-line">
                <span className="p2-syntax-kw">import</span>
                <span className="p2-syntax-brace">{" {"}</span>
                <span className="p2-syntax-comp">AskAiBadge</span>
                <span className="p2-syntax-brace">{"}"}</span>
                <span className="p2-syntax-kw">from</span>
                <span className="p2-syntax-str">"ask-ai-badge"</span>;
              </div>
              <div className="p2-terminal-line">
                <span className="p2-syntax-kw">import</span>
                <span className="p2-syntax-str">"ask-ai-badge/style.css"</span>;
              </div>
              <p className="p2-step-desc">✦ {t.s2d}</p>
            </div>
          </div>

          {/* STEP 3: Drop it */}
          <div
            className="p2-step-term"
            onClick={() => copy(`<AskAiBadge productName="${productName.trim() || "[Product]"}" />`, "step3")}
            title={t.terminalClickToCopy}
          >
            <div className="p2-step-term-bar">
              <div className="p2-step-dots" aria-hidden="true">
                <span className="p2-tdot p2-tdot-close" />
                <span className="p2-tdot p2-tdot-min" />
                <span className="p2-tdot p2-tdot-max" />
              </div>
              <div className="p2-step-pill">
                <span className="p2-step-num">03</span>
                <span className="p2-step-name">{t.s3t}</span>
              </div>
              <button
                type="button"
                className={`p2-step-copy ${copiedId === "step3" ? "copied" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  copy(`<AskAiBadge productName="${productName.trim() || "[Product]"}" />`, "step3");
                }}
                aria-label="Copy step 3"
                title={t.terminalClickToCopy}
              >
                {copiedId === "step3" ? "✓" : "⧉"}
              </button>
            </div>
            <div className="p2-step-term-body">
              <div className="p2-terminal-line">
                <span className="p2-syntax-tag">&lt;</span>
                <span className="p2-syntax-comp">AskAiBadge</span>
              </div>
              <div className="p2-terminal-line" style={{ paddingLeft: "1.2rem" }}>
                <span className="p2-syntax-prop">productName</span>=
                <span className="p2-syntax-str">"{productName.trim() || "[Product]"}"</span>
              </div>
              <div className="p2-terminal-line">
                <span className="p2-syntax-tag">/&gt;</span>
              </div>
              <p className="p2-step-desc">✦ {t.s3d}</p>
            </div>
          </div>
        </div>

        {/* Code & Links — unified card with tabs */}
        <div className="p2-grid2col">
          <div className="p2-card">
            <div className="p2-output-tabs">
              <button className={outputTab === "code" ? "on" : ""} onClick={() => setOutputTab("code")}>{t.outputCode}</button>
              <button className={outputTab === "links" ? "on" : ""} onClick={() => setOutputTab("links")}>{t.outputLinks}</button>
            </div>

            {outputTab === "code" && (
              <>
                <div className="p2-card-head">
                  <h3>{t.codeTitle}</h3>
                  <button className="p2-btn p2-btn--sm" onClick={() => copy(code, "code")}>
                    {copiedId === "code" ? t.copied : t.copyBtn}
                  </button>
                </div>
                <pre className="p2-code">{code}</pre>
              </>
            )}

            {outputTab === "links" && (
              <>
                <h3 style={{ marginBottom: "0.5rem" }}>{t.linksTitle}</h3>
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
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="p2-mini">
        <div className="p2-mini-links">
          <a
            href="https://www.npmjs.com/package/ask-ai-badge"
            target="_blank"
            rel="noreferrer"
            className="p2-npm-link"
            title="ask-ai-badge on npm"
          >
            <NpmLogo />
            <span>ask-ai-badge</span>
          </a>
          <span className="p2-mini-sep">·</span>
          <span className="p2-mini-creator">
            {lang === "es" ? "Creado con ❤️ por" : "Crafted with ❤️ by"}{" "}
            <a
              href="https://elijs.dev/"
              target="_blank"
              rel="noreferrer"
              className="p2-creator-link"
            >
              Eli (elijs.dev)
            </a>
          </span>
          <span className="p2-mini-sep">·</span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  );
}
