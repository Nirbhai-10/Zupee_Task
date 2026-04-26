import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function DemoReplayPage() {
  return (
    <DayPlaceholder
      day={6}
      title="90-second demo replay"
      whatToExpect="Self-running replay of the full Anjali story — scam catch, ULIP audit, intake, plan, salary day cascade."
      cousins={[
        { href: "/demo/simulator", label: "Live simulator" },
        { href: "/demo/presenter", label: "Presenter panel" },
      ]}
    />
  );
}
