import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

// Interfaces para tipagem
interface RallyData {
    name: string;
    description: string;
    startFinish: string;
    stagesLegs: string;
    creator: string;
    damage: string;
    openClose: string;
}

class RallyScraper {
    private readonly baseUrl: string = 'https://rallysimfans.hu/rbr/rally_online.php';

    /**
     * Faz o scraping dos dados dos rallies
     * @returns Promise<string> JSON com os dados dos rallies
     */
    public async scrapeRallyData(): Promise<string> {
        try {
            const html = await this.fetchPage();
            const rallies = await this.parseHtml(html);
            return this.convertToJson(rallies);
        } catch (error) {
            console.error('Erro ao fazer scraping:', error);
            throw error;
        }
    }

    /**
     * Faz a requisição HTTP para a página
     * @returns Promise<string> HTML da página
     */
    private async fetchPage(): Promise<string> {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer requisição HTTP:', error);
            throw error;
        }
    }

    /**
     * Faz o parsing do HTML e extrai os dados dos rallies
     * @param html HTML da página
     * @returns Array<RallyData> Array com os dados dos rallies
     */
    private parseHtml(html: string): RallyData[] {
        const $ = cheerio.load(html);
        const rallies: RallyData[] = [];

        $('table').each((_, table) => {
            $(table).find('tr').each((_, row) => {
                const columns = $(row).find('td');

                if (columns.length >= 7) {
                    const rallyName = $(columns[1]).text().trim();

                    if (rallyName && !rallyName.includes('Rally name')) {
                        const rallyData: RallyData = {
                            name: rallyName,
                            description: $(columns[2]).text().trim(),
                            startFinish: $(columns[3]).text().trim(),
                            stagesLegs: $(columns[4]).text().trim(),
                            creator: $(columns[5]).text().trim(),
                            damage: $(columns[6]).text().trim(),
                            openClose: $(columns[7]).text().trim()
                        };

                        rallies.push(rallyData);
                    }
                }
            });
        });

        return rallies;
    }

    /**
     * Converte o array de rallies para JSON
     * @param rallies Array com os dados dos rallies
     * @returns string JSON formatado
     */
    private convertToJson(rallies: RallyData[]): string {
        return JSON.stringify(rallies, null, 2);
    }

    /**
     * Salva os dados em um arquivo JSON
     * @param jsonData Dados em formato JSON
     * @param filename Nome do arquivo
     */
    public saveToFile(jsonData: string, filename: string): void {
        try {
            writeFileSync(filename, jsonData);
            console.log(`Dados salvos com sucesso em ${filename}`);
        } catch (error) {
            console.error('Erro ao salvar arquivo:', error);
            throw error;
        }
    }
}

// Função principal assíncrona para executar o scraping
async function main(): Promise<void> {
    try {
        const scraper = new RallyScraper();
        const jsonData = await scraper.scrapeRallyData();
        
        // Imprime os dados no console
        console.log(jsonData);
        
        // Opcional: salva os dados em um arquivo
        scraper.saveToFile(jsonData, 'rallies.json');
    } catch (error) {
        console.error('Erro na execução:', error);
        process.exit(1);
    }
}

// Executa o script
main();