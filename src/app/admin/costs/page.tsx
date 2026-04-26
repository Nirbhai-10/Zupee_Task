import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function CostsPage() {
  return (
    <DayPlaceholder
      day={6}
      title="LLM cost dashboard"
      whatToExpect="Today's spend, per-feature + per-model breakdown, cost-per-user, anomaly flags."
    />
  );
}
