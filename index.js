const express = require('express');
const app = express();
app.use(express.json());

const BOT_TOKEN = '8371320372:AAGddfjjTOuyp3x5nYt-NLnVpabJ_PW6DHk';
const GAME_URL = 'https://deluxe-clafoutis-356261.netlify.app/';
const GAME_SHORT_NAME = 'adamasmaca';

async function sendRequest(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

app.post('/webhook', async (req, res) => {
  const update = req.body;

  // /oyun komutu → gruba butonlu mesaj gönder
  if (update.message?.text?.startsWith('/oyun')) {
    const chatId = update.message.chat.id;
    const firstName = update.message.from.first_name || 'Oyuncu';

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

  // Callback query (eski game API için)
  if (update.callback_query?.game_short_name === GAME_SHORT_NAME) {
    await sendRequest('answerCallbackQuery', {
      callback_query_id: update.callback_query.id,
      url: GAME_URL
    });
  }

  res.sendStatus(200);
});

app.get('/', (_, res) => res.send('Bot çalışıyor ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot ${PORT} portunda çalışıyor`));
