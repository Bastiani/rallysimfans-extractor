import whatsapp from 'whatsapp-web.js';
import { type Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

dotenv.config();

export function sendMessageToWhatsApp(message: string) {
    const { Client, LocalAuth } = whatsapp;

    const client = new Client({
        puppeteer: { headless: true },
        authStrategy: new LocalAuth() // Salva a sessão localmente
    });

    client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        // Lista todos os chats e filtra apenas os grupos
        // const chats = await client.getChats();
        // const groups = chats.filter(chat => chat.isGroup);
        // console.log('Grupos encontrados:');
        // groups.forEach(group => {
        //     console.log(`Nome: ${group.name} | ID: ${group.id._serialized}`);
        // });
        
        // const number = process.env.PHONE_NUMBER;
        const chatId = process.env.GROUP_ID || '';   

        client.sendMessage(chatId, message)
        .then((response: Message) => {
            console.log('Mensagem enviada!', response);
        })
        .catch((err: Error) => {
            console.error('Erro ao enviar mensagem:', err);
        });
    });

    client.initialize();
}
