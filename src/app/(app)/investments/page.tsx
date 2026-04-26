import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function InvestmentsPage() {
  return (
    <DayPlaceholder
      day={4}
      title="Aapke nivesh"
      whatToExpect="Portfolio table, salary day history, instrument-level performance, tax view."
      cousins={[
        { href: "/goals", label: "Goals" },
        { href: "/timeline", label: "Timeline" },
      ]}
    />
  );
}
