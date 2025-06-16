import express from "express";
import cors from "cors";
import { initDB, saveOrGetOnlineRallyTableScrapeResult } from "./db/db.ts";
import { scrapeOnlineRallyResultsTable } from "./scrape-functions/onlineRallyResults.ts";
import { generateMessageForRallyResults } from "./openai/openaiMessage.ts";
import { sendMessageToWhatsApp } from "./whatsapp-web/whats.ts";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rota para obter os dados do rally
app.get("/api/online/rally-table", async (req, res) => {
  // Executa o scrape e salva/retorna do cache conforme a lógica de 1 minuto

  const result = await saveOrGetOnlineRallyTableScrapeResult();
  res.json(JSON.parse(result));
});

app.get("/api/online/rally-online-results", async (req, res) => {
  // Executa o scrape e salva/retorna do cache conforme a lógica de 1 minuto

  const result = await scrapeOnlineRallyResultsTable("83728");
  const resultTop = JSON.stringify(result.slice(0, 9), null, 2);
  const generatedMsg = await generateMessageForRallyResults(
    resultTop,
    `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results.php&rally_id=83728`
  );
  sendMessageToWhatsApp(generatedMsg);
  res.json(JSON.parse(resultTop));
});

// Rota de healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Inicia o servidor
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
