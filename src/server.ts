import { config } from "./config/env.config";
import { App } from "./app";

const app = new App().app;

app.listen(config.port, () => {
  console.log("=================================");
  console.log(`🚀 Servidor rodando na porta ${config.port}`);
  console.log(`📝 Ambiente: ${config.nodeEnv}`);
  console.log("=================================");
});
