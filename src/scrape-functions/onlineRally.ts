import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { sendMessageToWhatsApp } from '../whatsapp-web/whats.ts';
import { checkDate } from '../utils/checkDate.ts';
import { wasCheckDateTrue, setCheckDateTrue } from '../db/db.ts';
import { generateOpenAIMessage } from '../openai/openaiMessage.ts';

export async function scrapeOnlineRallyTable() {
  const url = 'https://rallysimfans.hu/rbr/rally_online.php';
  const urlLinkRally = 'https://rallysimfans.hu';
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
    // const dataRows = rallyTable.slice(5);
    let rallyData: any[] = [];
    // Precisamos buscar novamente as linhas da tabela no HTML para acessar o href corretamente
    const rallyTableSelector = $('table').eq(17);
    const rallyRows = rallyTableSelector.find('tr').slice(5);
    rallyRows.each((idx, rowElem) => {
      const cells = $(rowElem).find('th,td');
      // Busca o elemento com a classe rally_list_name
      const rallyLink = $(rowElem).find('.rally_list_name a');
      const href = `${urlLinkRally}${rallyLink.attr('href')}` || null;
      const name = rallyLink.text() || (cells.eq(1).text().trim() || null);
      rallyData.push({
        name,
        href,
        description: cells.eq(2).text().trim() || null,
        players_total: cells.eq(3).text().includes('/') ? parseInt(cells.eq(3).text().split('/')[0]) : null,
        players_finished: cells.eq(3).text().includes('/') ? parseInt(cells.eq(3).text().split('/')[1]) : null,
        stages_count: cells.eq(4).text().includes('/') ? parseInt(cells.eq(4).text().split('/')[0]) : null,
        legs_count: cells.eq(4).text().includes('/') ? parseInt(cells.eq(4).text().split('/')[1]) : null,
        creator: cells.eq(5).text().trim() || null,
        damage_model: cells.eq(6).text().trim() || null,
        schedule: cells.eq(7).text() ? {
          start: cells.eq(7).text().split(' ')[0] && cells.eq(7).text().split(' ')[1] ? cells.eq(7).text().split(' ')[0] + ' ' + cells.eq(7).text().split(' ')[1] : null,
          end: cells.eq(7).text().split(' ')[2] && cells.eq(7).text().split(' ')[3] ? cells.eq(7).text().split(' ')[2] + ' ' + cells.eq(7).text().split(' ')[3] : null
        } : null
      });
    });

    // Filtra apenas linhas com 'name' válido
    rallyData = rallyData
      .filter(r => r.name && r.name.trim() !== '' && ['lacka6', 'bruno kruger', 'bastiani rafael'].includes(r.creator?.toLowerCase()))
      // Processa apenas os dados de 'bastiani rafael' e verifica se a data já foi validada com sucesso
      // Executa checkDate apenas para 'bastiani rafael' e só se não foi executado com sucesso para a mesma data
    for (const r of rallyData) {
      if (r.creator?.toLowerCase() === 'bastiani rafael' && r.schedule?.start) {
        const alreadyChecked = await wasCheckDateTrue(r.creator, r.schedule.start);
        if (!alreadyChecked) {
          const result = await checkDate(r.schedule.start);
          if (result === true) {
            await setCheckDateTrue(r.creator, r.schedule.start);
            const message = await generateOpenAIMessage(r.name, r.href);
            sendMessageToWhatsApp(message);
          }
        }
      }
    }
    return JSON.stringify(rallyData, null, 2)
  } catch (error) {
    console.error('Erro ao extrair a tabela:', error);
    return { error: 'Failed to extract table', details: error }
  } finally {
    await browser.close();
  }
}
