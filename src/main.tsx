import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "react-error-boundary";
import PageError from "./components/organism/PageError";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import i18n from "./app/config/i18n";
import "./assets/scss/app.scss";
import { init } from "./app/util/helper.ts";

init();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary FallbackComponent={PageError}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
        <Toaster position="bottom-right" />
      </ErrorBoundary>
    </I18nextProvider>
  </React.StrictMode>
);
