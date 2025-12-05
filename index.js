const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const ownerId = process.env.OWNER_ID || 123456789;

const SALE_DEADLINE = new Date('2025-12-09T23:59:59+02:00').getTime();

const bot = new TelegramBot(token, { polling: true });

let accounts = [];
if (fs.existsSync('accounts.txt')) {
  accounts = fs.readFileSync('accounts.txt', 'utf8').split('\n').filter(Boolean);
}

const pricesUSD = { 1: 20, 5: 17, 50: 15 };
const pricesEGP = { 1: 950, 5: 800, 50: 700 };

function getPrice(qty, currency) {
  if (currency === 'EGP') {
    if (qty >= 50) return pricesEGP[50];
    if (qty >= 5) return pricesEGP[5];
    return pricesEGP[1];
  } else {
    if (qty >= 50) return pricesUSD[50];
    if (qty >= 5) return pricesUSD[5];
    return pricesUSD[1];
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const now = Date.now();
  if (now > SALE_DEADLINE) {
    return bot.sendMessage(chatId, 'العرض انتهى يوم 9-12-2025\nمفيش تفعيل حسابات جديدة حاليًا');
  }

  bot.sendMessage(chatId, `Google One AI Premium 2TB + Gemini Advanced لمدة سنة كاملة

الأسعار:
• 1–4 حسابات → 20 دولار (950 جنيه فودافون كاش)
• 5+ حسابات → 17 دولار (800 جنيه فودافون كاش)
• 50+ حسابات → 15 دولار (700 جنيه فودافون كاش)

اكتب الكمية اللي عايزها (مثلاً 10)
أو اكتب "كاش 10" لو هتدفع فودافون كاش`, { parse_mode: 'Markdown' });
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  let text = msg.text?.trim().toLowerCase();
  if (!text || text.startsWith('/')) return;

  const now = Date.now();
  if (now > SALE_DEADLINE) return bot.sendMessage(chatId, 'العرض انتهى');

  let quantity, isCash = false;
  if (text.includes('كاش') || text.includes('cash') || text.includes('vodafone')) {
    isCash = true;
    quantity = parseInt(text.replace(/\D/g, ''));
  } else {
    quantity = parseInt(text);
  }

  if (isNaN(quantity) || quantity < 1 || quantity > 500)
    return bot.sendMessage(chatId, 'اكتب رقم صحيح من 1 لـ 500');

  if (accounts.length < quantity)
    return bot.sendMessage(chatId, `متوفر حاليًا ${accounts.length} حساب بس`);

  const price = getPrice(quantity, isCash ? 'EGP' : 'USD');
  const total = price * quantity;
  const currency = isCash ? 'جنيه' : 'دولار';

  let paymentMessage = isCash
    ? `ادفع ${total} جنيه على فودافون كاش: 01023474152`
    : `ادفع ${total} دولار على أي طريقة:
1️⃣ Payeer: P1117065175
2️⃣ USDT TRC20: TX3WE3yjR3QEcccxhnXyArrxUaPaQheR3t`;

  bot.sendMessage(chatId, `طلبك جاهز!

الكمية: ${quantity} حساب
سعر الحساب: ${price} ${currency}
الإجمالي: *${total} ${currency}*

${paymentMessage}

ابعت السكرين شوت هنا وهتوصلك الحسابات في ثواني`, { parse_mode: 'Markdown' });

  bot.sendMessage(ownerId, `طلب جديد! ${isCash ? '(فودافون كاش)' : '(دولار)'}
الزبون: ${chatId}
الكمية: ${quantity}
الإجمالي: ${total} ${currency}`);
});

console.log('البوت شغال 100%!');
