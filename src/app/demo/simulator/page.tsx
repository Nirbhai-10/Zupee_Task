import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function SimulatorPage() {
  return (
    <DayPlaceholder
      day={2}
      title="WhatsApp simulator"
      whatToExpect="Three live phone frames (Anjali, mother-in-law, husband) with real-time message routing via Supabase Realtime."
      cousins={[{ href: "/demo/presenter", label: "Presenter panel" }]}
    />
  );
}
