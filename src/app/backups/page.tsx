import { listBackupFiles, getRecentChecks } from "@/lib/backup-checker";
import { BackupBrowser } from "@/components/backup-browser";
import type { BackupFile, BackupCheck } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BackupsPage() {
  let files: BackupFile[] = [];
  let checks: BackupCheck[] = [];
  let error: string | null = null;

  try {
    files = await listBackupFiles();
  } catch (err) {
    error = String(err);
  }

  try {
    checks = getRecentChecks(30);
  } catch {}

  return <BackupBrowser initialFiles={files} initialChecks={checks} initialError={error} />;
}
