import { getTwoFactorStatus } from "@/actions/twoFactorActions";
import TwoFactorSettings from "./two-factor-settings";

export default async function SecuritySettingsPage() {
  const status = await getTwoFactorStatus();

  return (
    <TwoFactorSettings
      initialEnabled={Boolean(status.ok && status.data?.enabled)}
      initialRecoveryCodeCount={
        status.ok ? (status.data?.recoveryCodeCount ?? 0) : 0
      }
    />
  );
}
