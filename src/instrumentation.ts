export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: cron } = await import("node-cron");
    const { pollAllServices } = await import("./lib/poller");
    const { collectAllStats } = await import("./lib/stats-collector");

    cron.schedule("0 * * * *", () => {
      pollAllServices().catch(console.error);
    });

    cron.schedule("30 0 * * *", () => {
      collectAllStats().catch(console.error);
    });

    void pollAllServices().catch(console.error);
    void collectAllStats().catch(console.error);
  }
}
