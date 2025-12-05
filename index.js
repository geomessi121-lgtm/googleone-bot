const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// التوكن بتاع البوت (هتغيره بعدين)
const token = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// صاحب البوت (آي ديك)
const ownerId = process.env.OWNER_ID || 123456789;

// آخر يوم للبيع: 9 ديسمبر 2025 الساعة 23:59 بتوقيت القاهرة
const SALE_DEADLINE = new Date('2025-12-09T23:59:59+02:00').getTime();

const bot = new TelegramBot(token, { polling: true });

// تحميل الحسابات من الملف
let accounts = [];
if (fs.existsSync('accounts.txt')) {
  accounts = fs.readFileSync('accounts.txt', 'utf8').split('\n').filter(Boolean);
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'مرحبا! هنا بتبيع حسابات Google One AI Premium 2TB + Gemini Advanced لمدة سنة ببلاش.\n\nالسعر: 15 دولار (أو 750 جنيه مصري).\nاكتب /buy عشان تشتري فورًا!');
});

bot.onText(/\/buy/, (msg) => {
  const chatId = msg.chat.id;
  const now = Date.now();

  if (now > SALE_DEADLINE) {
    bot.sendMessage(chatId, '❌ العرض الرسمي من جوجل انتهى يوم 9 ديسمبر 2025\nمفيش إمكانية تفعيل حسابات جديدة حاليًا.\nلو عايز حسابات جاهزة مفعلة قبل الميعاد، اشتري دلوقتي قبل ما يخلّصوا!');
    return;
  }

  if (accounts.length === 0) {
    bot.sendMessage(chatId, '❌ مفيش حسابات متوفرة حاليًا، جرب تاني بعد شوية!');
    return;
  }

  const account = accounts.shift();
  fs.writeFileSync('accounts.txt', accounts.join('\n'));

  bot.sendMessage(chatId, `تم الدفع! إليك الحساب:\n\nEmail: ${account.split(':')[0]}\nPassword: ${account.split(':')[1]}\n\nفعّله دلوقتي قبل 9-12-2025!\nشكرًا لشرائك.`);
  bot.sendMessage(ownerId, `بيع جديد! الحساب: ${account} إلى ${chatId}`);
});

console.log('البوت شغال!');
