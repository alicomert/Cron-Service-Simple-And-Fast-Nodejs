const axios = require('axios');

async function sendTelegramMessage(chatId, text) {
  const telegramAPI = `https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage`;
  try {
    await axios.post(telegramAPI, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error('Telegram mesajı gönderilirken hata oluştu:', error);
  }
}

function checkTimeWindow(schedule) {
  if (!schedule.start || !schedule.end) {
    return true;
  }

  const now = new Date();
  const startTime = schedule.start.split(':').map(Number);
  const endTime = schedule.end.split(':').map(Number);
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime[0], startTime[1]);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime[0], endTime[1]);

  return now >= startDate && now <= endDate;
}

async function fetchUrl(url, schedule) {
  if (checkTimeWindow(schedule)) {
    try {
      console.log(`${url} üzerinden veri çekiliyor...`);
      const response = await axios.get(url);
      console.log(response.data);
    } catch (error) {
      console.error('Hata:', error);
      sendTelegramMessage(930115244, `Link yüklenemedi: ${url}`);
    }
    await new Promise(resolve => setTimeout(resolve, schedule.delay || 0));
  }
}

async function fetchDataWithTiming(urls, schedules) {
  const fetchPromises = urls.map((url, index) => {
    const schedule = schedules[index];
    return (async () => {
      while (true) {
        await fetchUrl(url, schedule);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Her URL için bekleme süresi
      }
    })();
  });

  await Promise.all(fetchPromises);
}

const urls = [
  'https://api.borsify.com/datasave/sonfiyatyedek.php',
  'https://api.borsify.com/telegram/telegramsave.php',
];

const schedules = [
  { delay: 10000 },
  { start: '19:00', end: '22:00', delay: 0 },
];

fetchDataWithTiming(urls, schedules);
