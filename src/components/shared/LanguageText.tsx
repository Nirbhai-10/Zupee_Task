import {
  htmlLang,
  isIndicScript,
  PRIMARY_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/languages";
import { resolveString, type StringId } from "@/lib/i18n/strings";
import { cn } from "@/lib/utils/cn";

type LanguageTextProps = {
  id: StringId;
  language?: LanguageCode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

/**
 * Renders a UI string with the right `lang` attribute so the Indic font
 * stack and per-script line-height kick in via globals.css.
 */
export function LanguageText({
  id,
  language = PRIMARY_LANGUAGE,
  as: Tag = "span",
  className,
}: LanguageTextProps) {
  const Component = Tag as React.ElementType;
  const value = resolveString(id, language);
  return (
    <Component
      lang={htmlLang(language)}
      className={cn(isIndicScript(language) ? "font-deva" : "font-sans", className)}
    >
      {value}
    </Component>
  );
}
