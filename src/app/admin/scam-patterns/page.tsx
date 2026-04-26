import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function ScamPatternsAdminPage() {
  return (
    <DayPlaceholder
      day={6}
      title="Scam pattern admin"
      whatToExpect="CRUD interface for the pattern bank. Add new variants, regenerate embeddings, archive obsolete ones."
    />
  );
}
