import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function DefensesPage() {
  return (
    <DayPlaceholder
      day={2}
      title="Defenses feed"
      whatToExpect="Year-to-date savings hero, filter chips, reverse-chronological defense feed with verdict badges and savings stats."
      cousins={[{ href: "/home", label: "Home" }]}
    />
  );
}
