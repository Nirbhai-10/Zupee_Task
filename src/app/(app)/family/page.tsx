import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function FamilyPage() {
  return (
    <DayPlaceholder
      day={5}
      title="Aapki family"
      whatToExpect="Custom-drawn family tree with Anjali at the centre, per-member visibility controls, money-flow diagram, and add-member flow."
      cousins={[
        { href: "/home", label: "Home" },
        { href: "/goals", label: "Goals" },
      ]}
    />
  );
}
