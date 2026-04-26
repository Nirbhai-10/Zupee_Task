import type { VoiceProvider } from "./provider-interface";
import { SarvamVoiceProvider } from "./sarvam-voice";
import { BrowserVoiceProvider } from "./browser-voice";

export * from "./provider-interface";
export { SarvamVoiceProvider } from "./sarvam-voice";
export { BrowserVoiceProvider, decodeBrowserTTS } from "./browser-voice";

let cached: VoiceProvider | null = null;

/**
 * Auto-selects the best voice provider available. Sarvam if SARVAM_API_KEY
 * is set, otherwise the browser fallback. Cached at module level so we
 * don't re-instantiate on every call within a request.
 */
export function getVoiceProvider(): VoiceProvider {
  if (cached) return cached;
  const sarvam = new SarvamVoiceProvider();
  if (sarvam.isAvailable()) {
    cached = sarvam;
  } else {
    cached = new BrowserVoiceProvider();
  }
  return cached;
}

/** Reset the cached provider — useful in tests / when env changes. */
export function resetVoiceProvider() {
  cached = null;
}
