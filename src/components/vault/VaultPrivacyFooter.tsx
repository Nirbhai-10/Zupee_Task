import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { T } from "@/components/shared/T";

export function VaultPrivacyFooter() {
  return (
    <Card tone="cream" padding="md" className="border-saathi-deep-green-line">
      <CardContent className="!mt-0 flex items-start gap-3 text-body-sm text-saathi-ink-soft">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-saathi-deep-green" />
        <p>
          <T
            hi="Vault आपका private space है. Pati, mummy, family, कोई नहीं देख सकता. Saathi counselor team भी तभी देखती है जब आप explicitly share करें. Saathi कभी family को notify नहीं करता. Encryption AES-256."
            en="Vault is your private space. Your husband, parents, and family cannot see it. Saathi's counselor team only sees it if you explicitly share it. Saathi never notifies family. Encryption AES-256."
          />
        </p>
      </CardContent>
    </Card>
  );
}
