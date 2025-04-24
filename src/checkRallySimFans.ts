import puppeteer from 'puppeteer';

async function checkRallySimFans() {
  const url = 'https://rallysimfans.hu/rbr/rally_online.php';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2' });
    if (response && response.ok()) {
      console.log('Página carregada com sucesso!');
    } else {
      console.error('Falha ao carregar a página.');
    }
  } catch (error) {
    console.error('Erro ao acessar a página:', error);
  } finally {
    await browser.close();
  }
}

checkRallySimFans();
