"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

// Registers the service worker, then shows an install prompt when the browser
// allows it. iPhone Safari has no install prompt, so it gets instructions instead.
export default function PwaRegister() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installed, setInstalled] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    const isIosSafari = isIos && !/CriOS|FxiOS/.test(ua);
    if (!standalone && isIosSafari) setShowIosHint(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed || (!deferred && !showIosHint)) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs rounded-2xl border border-black/10 bg-app-surface p-4 shadow-lg dark:border-white/10 dark:bg-app-surface-dark">
      <p className="text-sm font-semibold text-app-text dark:text-app-text-dark">
        Install StorySpace
      </p>
      {deferred ? (
        <>
          <p className="mt-1 text-xs text-app-text/70 dark:text-app-text-dark/70">
            Open it from your home screen or desktop, without a browser window.
          </p>
          <button
            type="button"
            onClick={install}
            className="mt-3 rounded-full bg-app-primary dark:bg-app-primary-dark px-4 py-1.5 text-sm font-medium text-white"
          >
            Install
          </button>
        </>
      ) : (
        <p className="mt-1 text-xs text-app-text/70 dark:text-app-text-dark/70">
          Tap the Share button, then &ldquo;Add to Home Screen&rdquo;.
        </p>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-2 block text-xs text-app-text/50 underline dark:text-app-text-dark/50"
      >
        Not now
      </button>
    </div>
  );
}