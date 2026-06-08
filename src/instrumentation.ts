export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[instrumentation] register() called, setting up cron jobs...");

    const { default: cron } = await import("node-cron");
    const { pollAllServices } = await import("./lib/poller");
    const { collectAllStats } = await import("./lib/stats-collector");
    const { runRetention } = await import("./lib/retention");

    cron.schedule("0 * * * *", () => {
      console.log("[cron] polling all services");
      pollAllServices().catch(console.error);
    });

    cron.schedule("30 0 * * *", () => {
      console.log("[cron] collecting stats");
      collectAllStats().catch(console.error);
    });

    const { collectAllInfra } = await import("./lib/ssh-collector");

    cron.schedule("*/5 * * * *", () => {
      console.log("[cron] collecting infra metrics");
      collectAllInfra().catch(console.error);
    });

    cron.schedule("0 3 * * *", () => {
      console.log("[cron] running retention");
      runRetention();
    });

    const { runBackupCheck } = await import("./lib/backup-checker");

    cron.schedule("0 4 * * *", () => {
      console.log("[cron] running backup check");
      runBackupCheck().catch(console.error);
    });

    console.log("[instrumentation] cron jobs registered. Running initial tasks...");

    void pollAllServices()
      .then(() => console.log("[instrumentation] initial poll done"))
      .catch(console.error);
    void collectAllStats()
      .then(() => console.log("[instrumentation] initial stats done"))
      .catch(console.error);
    void collectAllInfra()
      .then(() => console.log("[instrumentation] initial infra done"))
      .catch(console.error);

    console.log("[instrumentation] setup complete, node-cron should be ticking");
  }
}
