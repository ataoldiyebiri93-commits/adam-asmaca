const express = require('express');
const app = express();
app.use(express.json());

// CORS - Netlify'dan gelen isteklere izin ver
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const BOT_TOKEN = process.env.BOT_TOKEN;
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
              url: `https://t.me/xoxoyunbot/adamasmaca?startapp=${chatId}`
            }
          ]]
        }
      });
    }
  }

  res.sendStatus(200);
});


// Skor tablosu (bellekte tutuluyor)
const leaderboard = {};

app.post('/result', async (req, res) => {
  const { win, word, userName, chatId, wins, losses, streak } = req.body;
  console.log('Result geldi:', req.body);

  if (!chatId) return res.sendStatus(200);

  // Leaderboard güncelle
  if (!leaderboard[chatId]) leaderboard[chatId] = {};
  if (!leaderboard[chatId][userName]) leaderboard[chatId][userName] = { wins: 0, losses: 0 };
  if (win) leaderboard[chatId][userName].wins++;
  else leaderboard[chatId][userName].losses++;

  // Gruba sonuc mesaji at
  const emoji = win ? '\u{1F389}' : '\u{1F480}';
  const sonuc = win ? `"${word}" kelimesini bildi!` : `"${word}" kelimesini bilemedi!`;
  const streakText = (win && streak > 1) ? ` \u{1F525} ${streak} oyun serisi!` : '';

  const text = emoji + ' ' + userName + ' ' + sonuc + streakText + '\n\n' +
    '\u{1F3C6} Toplam: ' + wins + ' kazandi | \u{1F480} ' + losses + ' kaybetti\n\n' +
    '\u{1F447} Sen de oyna!';

  await sendRequest('sendMessage', {
    chat_id: chatId,
    text: text,
    reply_markup: {
      inline_keyboard: [[
        { text: '\u25B6\uFE0F Oyna!', url: 'https://t.me/xoxoyunbot/adamasmaca' }
      ]]
    }
  });

  res.sendStatus(200);
});

app.get('/', (_, res) => res.send('Bot calisiyor'));

// Bot komutlarini kaydet (bir kere calisir)
async function registerCommands() {
  await sendRequest('setMyCommands', {
    commands: [
      { command: 'oyun', description: '🎮 Adam Asmaca oyununu başlat' },
      { command: 'skor', description: '🏆 Liderlik tablosunu gör' }
    ],
    scope: { type: 'all_group_chats' }
  });
  console.log('Komutlar kaydedildi');
}

registerCommands();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot ${PORT} portunda çalışıyor`));
