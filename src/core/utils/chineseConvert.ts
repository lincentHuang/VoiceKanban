import { ConverterFactory } from "opencc-js/core";
import { from, to } from "opencc-js/preset/cn2t";

// Web Speech API sometimes returns Simplified characters for zh-TW
// recognition depending on the browser/OS speech engine. Normalize
// everything to Traditional (Taiwan) before it reaches the UI.
const simplifiedToTraditional = ConverterFactory(from.cn, to.tw);

export function toTraditionalChinese(text: string): string {
  if (!text) return text;
  return simplifiedToTraditional(text);
}
