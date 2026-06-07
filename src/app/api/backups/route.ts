import { listBackupFiles, runBackupCheck, getRecentChecks } from "@/lib/backup-checker";
import type { BackupFile, BackupCheck } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [files, checks] = await Promise.all([
      listBackupFiles(),
      Promise.resolve(getRecentChecks(30)),
    ]);

    return Response.json({ files, checks });
  } catch (err) {
    return Response.json(
      {
        files: [] as BackupFile[],
        checks: [] as BackupCheck[],
        error: String(err),
      },
      { status: 200 }
    );
  }
}

export async function POST() {
  try {
    const check = await runBackupCheck();
    return Response.json(check);
  } catch (err) {
    return Response.json(
      { error: `Backup-Check fehlgeschlagen: ${err}` },
      { status: 500 }
    );
  }
}
