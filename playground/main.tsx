import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./playground.css";
import "../src/ask-ai-badge.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
