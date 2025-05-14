import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface RallyResult {
  position: number;
  driver: string;
  realName: string;
  car: string;
  time: string;
  diffPrev: string;
  diffFirst: string;
  sr?: string;
}

export async function scrapeOnlineRallyResultsTable(rallyId: string | number) {
  const url = `https://rallysimfans.hu/rbr/rally_online.php?centerbox=rally_results.php&rally_id=${rallyId}`;
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    const $ = cheerio.load(html);
    // Encontrar o título do rally
    const rallyTitle = $('td:contains("Final standings for:")').text().trim();
    console.log(`Rally: ${rallyTitle}`);
    
    // Encontrar a tabela de resultados específica
    const results: RallyResult[] = [];
    
    // Selecionar a tabela correta que contém os resultados
    const resultTable = $('table').filter(function() {
      return $(this).find('tr:first-child td:contains("#")').length > 0;
    });
    
    // Contar o número total de linhas para depuração
    const totalRows = resultTable.find('tr').length;
    
    // Processar cada linha da tabela, pulando apenas o cabeçalho
    resultTable.find('tr').each((index, element) => {
      // Pular apenas a primeira linha (cabeçalho)
      if (index === 0) return;
      
      const tds = $(element).find('td');
      
      if (tds.length >= 7) {
        // Extrair a posição
        const positionText = $(tds[0]).text().trim();
        
        // Converter para número, mas aceitar posição 1 mesmo se houver problemas na conversão
        let position: number;
        if (index === 1) {
          // Para a primeira linha de dados (após o cabeçalho), forçar posição 1 se necessário
          position = parseInt(positionText, 10) || 1;
        } else {
          position = parseInt(positionText, 10);
        }
        
        // Processar a linha se tiver uma posição válida ou for a primeira linha de dados
        if (position || index === 1) {
          // Extrair informações do piloto
          const driverCell = $(tds[1]).html() || '';
          const driverText = $(tds[1]).text().trim();
          
          // Extrair driver e realName
          let driver = '';
          let realName = '';
          
          // Tentar extrair usando backticks
          const backtickMatch = driverText.match(/`([^`]+)`\s*\/\s*`([^`]+)`/);
          if (backtickMatch) {
            driver = backtickMatch[1].trim();
            realName = backtickMatch[2].trim();
          } else {
            // Tentar extrair diretamente do texto
            const parts = driverText.split('/');
            if (parts.length >= 2) {
              driver = parts[0].trim().replace(/`/g, '');
              realName = parts[1].trim().replace(/`/g, '');
            }
          }
          
          // Extrair outras informações
          const car = $(tds[3]).text().trim();
          const time = $(tds[4]).text().trim();
          const diffPrev = $(tds[5]).text().trim();
          const diffFirst = $(tds[6]).text().trim();
          
          // Definir posição como 1 para a primeira linha se não foi detectada
          if (index === 1 && !position) {
            position = 1;
          }
          
          results.push({
            position,
            driver,
            realName,
            car,
            time,
            diffPrev,
            diffFirst
          });
          
          console.log(`Adicionado resultado: Posição ${position}, Piloto: ${driver}`);
        }
      }
    });
    await browser.close();
    results.shift();
    return results
  } catch (error) {
    await browser.close();
    throw error;
  }
}

