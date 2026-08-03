import app from "./app";
import { env } from "./config/env";
import { startNewsScheduler, startDigestScheduler } from "./jobs/scheduler";

const PORT = env.MAIN_SERVICE_PORT;

app.listen(PORT, () => {
  console.log(`📰 [main-service] listening on http://localhost:${PORT}`);
  startNewsScheduler();
  startDigestScheduler();
});
