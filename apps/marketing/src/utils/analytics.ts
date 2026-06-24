/* eslint-disable no-console */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Checks whether Google Analytics (gtag) is loaded and configured.
 */
export function isGAInitialized(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Tracks a pageview event manually.
 * @param path The URL path (e.g. /waitlist)
 * @param title Optional title of the page
 */
export function trackPageView(path: string, title?: string) {
  if (isGAInitialized() && GA_MEASUREMENT_ID) {
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
    });
  } else if (import.meta.env.DEV) {
    console.log(`[GA DEV] Pageview: ${path} - "${title || document.title}"`);
  }
}

/**
 * Tracks a custom event in Google Analytics.
 * @param action The event action name (e.g. 'wallet_connect', 'waitlist_signup')
 * @param category The event category (e.g. 'engagement')
 * @param label The event label/value detail (e.g. 'phantom', 'user@example.com')
 * @param value An optional numeric value
 * @param extraParams Optional additional key-value parameters for custom details
 */
export function trackEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number,
  extraParams?: Record<string, unknown>,
) {
  if (isGAInitialized()) {
    window.gtag?.("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...extraParams,
    });
  } else if (import.meta.env.DEV) {
    console.log(
      `[GA DEV] Event: "${action}" | Category: ${category} | Label: ${label} | Value: ${value}`,
      extraParams,
    );
  }
}
