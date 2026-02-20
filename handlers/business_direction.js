import { addCoins } from "../services/coin_service.js";
import { updateUserDirection } from "../services/user_service.js";

const NEXT_STEP_TEXT =
  "🤯 Поздравляю! Твой баланс: 150 AI-Coins 🪙\n\n" +
  "<b>Представь, что автономно может работает ТВОЙ бизнес</b>\n\n" +
  "💰 Реальные цифры моих клиентов:\n" +
  "Кофейня: Чат-бот принимает заказы ➡️ +30% к выручке\n" +
  "Салон красоты: Автозапись клиентов ➡️ минус 2 часа рутины\n" +
  "Ритейл: ИИ генерит контент ➡️ охваты ×3.\n\n" +
  "🎁 <b>Твой подарок (База нейросетей) уже ждет. Но сначала - давай закрепим твое место, чтобы система не аннулировала монет</b>\n\n" +
  "👇 Жми кнопку ниже.";

export async function handleDirectionBusiness({ callbackQuery, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  const chatId = callbackQuery.message?.chat?.id;
  const fromUser = callbackQuery.from || callbackQuery.from_user;
  if (!chatId) {
    return;
  }
  if (!fromUser) {
    return;
  }

  await updateUserDirection(env.DB, fromUser.id, "business");

  await addCoins(
    env.DB,
    fromUser.id,
    50,
    "выбор направления",
    "Бонус за выбор бизнес направления (business)"
  );

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "➡️ ЗАБРАТЬ ПОДАРОК И ЗАПИСАТЬСЯ",
          callback_data: "register",
        },
      ],
    ],
  };

  await telegram.sendMessage(env.BOT_TOKEN, {
    chat_id: chatId,
    text: NEXT_STEP_TEXT,
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}
