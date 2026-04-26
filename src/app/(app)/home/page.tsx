import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function HomePage() {
  return (
    <DayPlaceholder
      day={2}
      title="Anjali's home dashboard"
      whatToExpect="Greeting strip, savings hero, quick actions, latest defense, goals, salary day countdown, and the persistent Saathi chat panel."
      cousins={[
        { href: "/family", label: "Family" },
        { href: "/goals", label: "Goals" },
        { href: "/defenses", label: "Defenses" },
      ]}
    />
  );
}
