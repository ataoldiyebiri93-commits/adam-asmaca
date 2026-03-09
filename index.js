const express = require('express');
const app = express();
app.use(express.json());

const BOT_TOKEN = '8371320372:AAGddfjjTOuyp3x5nYt-NLnVpabJ_PW6DHk';
const GAME_URL = 'https://deluxe-clafoutis-356261.netlify.app/';

async function sendRequest(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  console.log(`${method} response:`, JSON.stringify(data));
  return data;
}

app.post('/webhook', async (req, res) => {
  console.log('Webhook geldi:', JSON.stringify(req.body));
  
  const update = req.body;
  const message = update.message;

  if (message) {
    const text = message.text || '';
    const chatId = message.chat.id;
    const firstName = message.from?.first_name || 'Oyuncu';

    // /oyun veya /oyun@xoxoyunbot komutunu yakala
    if (text.startsWith('/oyun') || text.startsWith('/oyna')) {
      await sendRequest('sendMessage', {
        chat_id: chatId,
        text: `🎮 *Adam Asmaca*\n\n${firstName} bir oyun başlattı\\! Tıkla ve oyna 👇`,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '▶️ Oyna!',
              web_app: { url: GAME_URL }
            }
          ]]
        }
      });
    }
  }

  res.sendStatus(200);
});

app.get('/', (_, res) => res.send('Bot çalışıyor ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot ${PORT} portunda çalışıyor`));
