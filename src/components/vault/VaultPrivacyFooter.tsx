import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function VaultPrivacyFooter() {
  return (
    <Card tone="cream" padding="md" className="border-saathi-deep-green-line">
      <CardContent className="!mt-0 flex items-start gap-3 text-body-sm text-saathi-ink-soft">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-saathi-deep-green" />
        <p>
          Vault aapka private space hai. Pati, mummy, family, koi nahi dekh sakta. Saathi
          counselor team bhi tabhi dekhti hai jab aap explicitly share karein. Saathi kabhi
          family ko notify nahi karta. Encryption AES-256.
        </p>
      </CardContent>
    </Card>
  );
}
