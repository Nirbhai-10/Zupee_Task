import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function GoalsPage() {
  return (
    <DayPlaceholder
      day={4}
      title="Aapke lakshya"
      whatToExpect="Active goal cards with milestones, allocation breakdowns, and the voice-driven goal creator."
      cousins={[
        { href: "/goals/new", label: "Naya goal" },
        { href: "/investments", label: "Investments" },
      ]}
    />
  );
}
