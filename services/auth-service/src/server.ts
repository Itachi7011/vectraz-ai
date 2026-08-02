import app from "./app";

const PORT = process.env.AUTH_SERVICE_PORT ? Number(process.env.AUTH_SERVICE_PORT) : 5003;

app.listen(PORT, () => {
  console.log(`🔐 [auth-service] listening on http://localhost:${PORT}`);
});
