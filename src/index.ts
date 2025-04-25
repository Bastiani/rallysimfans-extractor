import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

async function scrapeRallyTable() {
  const url = 'https://rallysimfans.hu/rbr/rally_online.php';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    const $ = cheerio.load(html);
    const tables: string[][][] = [];
    $('table').each((i, table) => {
      const rows: string[][] = [];
      $(table)
        .find('tr')
        .each((j, row) => {
          const cells: string[] = [];
          $(row)
            .find('th,td')
            .each((k, cell) => {
              cells.push($(cell).text().trim());
            });
          rows.push(cells);
        });
      tables.push(rows);
    });
    // Seleciona a tabela 18 (índice 17)
    const rallyTable = tables[17];
    if (!rallyTable || rallyTable.length < 2) {
      console.error('Tabela de rally não encontrada ou vazia.');
      return;
    }
    // Remove a primeira linha (dados duplicados)
    const dataRows = rallyTable.slice(5);
    let rallyData = dataRows.map(row => {
      return {
        name: row[1] || null,
        description: row[2] || null,
        players_total: row[3] && row[3].includes('/') ? parseInt(row[3].split('/')[0]) : null,
        players_finished: row[3] && row[3].includes('/') ? parseInt(row[3].split('/')[1]) : null,
        stages_count: row[4] && row[4].includes('/') ? parseInt(row[4].split('/')[0]) : null,
        legs_count: row[4] && row[4].includes('/') ? parseInt(row[4].split('/')[1]) : null,
        creator: row[5] || null,
        damage_model: row[6] || null,
        schedule: row[7] ? {
          start: row[7].split(' ')[0] && row[7].split(' ')[1] ? row[7].split(' ')[0] + ' ' + row[7].split(' ')[1] : null,
          end: row[7].split(' ')[2] && row[7].split(' ')[3] ? row[7].split(' ')[2] + ' ' + row[7].split(' ')[3] : null
        } : null
      };
    });
    // Filtra apenas linhas com 'name' válido e limita para 10 registros
    rallyData = rallyData
      .filter(r => r.name && r.name.trim() !== '' && ['lacka6', 'bruno kruger', 'bastiani rafael'].includes(r.creator?.toLowerCase()))
      .slice(0, 10);
    return JSON.stringify(rallyData, null, 2)
  } catch (error) {
    console.error('Erro ao extrair a tabela:', error);
    return { error: 'Failed to extract table', details: error }
  } finally {
    await browser.close();
  }
}

// Rota para obter os dados do rally
app.get('/api/rally', async (req, res) => {
  // try {
    const data = await scrapeRallyTable();
    res.json(JSON.parse(data as string));
  // } catch (error) {
    // res.status(500).json({ error: 'Failed to fetch rally data', details: error });
  // }
});

// Rota de healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
