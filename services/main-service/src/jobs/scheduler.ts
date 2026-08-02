import cron from "node-cron";
import { env } from "../config/env";
import { runAggregation } from "../services/newsAggregator/aggregate";

export function startNewsScheduler() {
  if (!cron.validate(env.NEWS_FETCH_CRON)) {
    console.error(`❌ Invalid NEWS_FETCH_CRON expression: "${env.NEWS_FETCH_CRON}". Scheduler not started.`);
    return;
  }

  console.log(`⏰ News aggregation scheduled: "${env.NEWS_FETCH_CRON}"`);
  cron.schedule(env.NEWS_FETCH_CRON, () => {
    runAggregation().catch((err) => console.error("❌ Scheduled aggregation run failed:", err));
  });

  // Kick off one run shortly after boot so the site has fresh data
  // without waiting for the first cron tick.
  setTimeout(() => {
    runAggregation().catch((err) => console.error("❌ Initial aggregation run failed:", err));
  }, 5_000);
}
