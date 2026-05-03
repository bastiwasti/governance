export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: cron } = await import("node-cron");
    const { pollAllServices } = await import("./lib/poller");

    cron.schedule("0 * * * *", () => {
      pollAllServices().catch(console.error);
    });

    // Initial poll on startup — fire and forget so server starts immediately
    void pollAllServices().catch(console.error);
  }
}
