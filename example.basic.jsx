import { AskAiBadge } from "ask-ai-badge";
import "ask-ai-badge/style.css";

// Básico — footer
export function Basic() {
  return <AskAiBadge productName="[Product]" productUrl="https://example.com" />;
}

// Español + descripción + idioma
export function Localized() {
  return (
    <AskAiBadge
      productName="[Product]"
      productUrl="https://example.com"
      locale="es"
      description="**[Product]** es un CRM diseñado para ayudar a equipos de ventas a cerrar negocios más rápido."
    />
  );
}

// Español + custom
export function Custom() {
  return (
    <AskAiBadge
      productName="[Product]"
      productUrl="https://example.com"
      title="Pregunta a la IA sobre {productName}"
      subtitle="Compara respuestas entre modelos"
      prompt="¿Qué es {productName} ({productUrl}) y para qué sirve?"
      providers={["chatgpt", "claude", "perplexity", "grok"]}
      theme="auto"
      layout="wrap"
      align="center"
      showDisclaimer
      disclaimerText="Las respuestas de la IA pueden variar."
    />
  );
}
