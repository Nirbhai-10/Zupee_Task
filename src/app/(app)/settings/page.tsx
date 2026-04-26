import { DayPlaceholder } from "@/components/shared/DayPlaceholder";

export default function SettingsPage() {
  return (
    <DayPlaceholder
      day={6}
      title="Settings"
      whatToExpect="Profile, language, notifications, privacy, family privacy, connected services, trust level, help."
    />
  );
}
