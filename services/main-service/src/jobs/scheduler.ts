import cron from "node-cron";
import { env } from "../config/env";
import { runAggregation } from "../services/newsAggregator/aggregate";
import { runWeeklyDigest } from "../services/digest/generateDigest";

export function startNewsScheduler() {
  if (!cron.validate(env.NEWS_FETCH_CRON)) {
    console.error(`❌ Invalid NEWS_FETCH_CRON expression: "${env.NEWS_FETCH_CRON}". Scheduler not started.`);
    return;
  }

  console.log(`⏰ News aggregation scheduled: "${env.NEWS_FETCH_CRON}"`);
  cron.schedule(env.NEWS_FETCH_CRON, () => {
    runAggregation().catch((err) => console.error("❌ Scheduled aggregation run failed:", err));
  });

  setTimeout(() => {
    runAggregation().catch((err) => console.error("❌ Initial aggregation run failed:", err));
  }, 5_000);
}

export function startDigestScheduler() {
  if (!cron.validate(env.DIGEST_CRON)) {
    console.error(`❌ Invalid DIGEST_CRON expression: "${env.DIGEST_CRON}". Digest scheduler not started.`);
    return;
  }

  console.log(`⏰ Weekly digest scheduled: "${env.DIGEST_CRON}"`);
  cron.schedule(env.DIGEST_CRON, () => {
    runWeeklyDigest().catch((err) => console.error("❌ Scheduled digest run failed:", err));
  });
}
