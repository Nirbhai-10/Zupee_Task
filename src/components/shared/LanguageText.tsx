import {
  htmlLang,
  PRIMARY_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/languages";
import { resolveString, type StringId } from "@/lib/i18n/strings";
import { scriptForLanguage } from "@/lib/i18n/scripts";
import { cn } from "@/lib/utils/cn";

type LanguageTextProps = {
  id: StringId;
  language?: LanguageCode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

/**
 * Renders a UI string from the i18n registry with the right `lang`
 * attribute + `data-script` so globals.css applies per-script metrics.
 */
export function LanguageText({
  id,
  language = PRIMARY_LANGUAGE,
  as: Tag = "span",
  className,
}: LanguageTextProps) {
  const Component = Tag as React.ElementType;
  const value = resolveString(id, language);
  const script = scriptForLanguage(language);
  return (
    <Component
      lang={htmlLang(language)}
      data-script={script}
      className={cn(script === "latin" ? "font-sans" : "font-deva", className)}
    >
      {value}
    </Component>
  );
}
