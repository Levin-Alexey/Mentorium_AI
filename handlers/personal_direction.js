import { addCoins } from "../services/coin_service.js";
import { updateUserDirection } from "../services/user_service.js";

const NEXT_STEP_TEXT =
  "🤯 Пока ИИ работает, я пью кофе или занимаюсь стратегией.\n\n" +
  "<b>Именно так выглядит личная эффективность с ИИ.</b> Ты перестаешь быть «белкой в колесе» и становишься архитектором своей жизни.\n\n" +
  "🔥 <b>На вебинаре за 1 час ты научишься:</b>\n" +
  "✅ Писать письма и отчеты за секунды (вместо часов мучений).\n" +
  "✅ Делать презентации и картинки, не будучи дизайнером.\n" +
  "✅ Учиться новому в 10 раз быстрее с персональным ИИ-ментором.\n\n" +
  "🎁 <b>Твой подарок уже ждет!</b> Я открываю тебе доступ в закрытый канал, где уже лежит база лучших нейросетей и инструкции.\n\n" +
  "👇 <b>Жми кнопку, чтобы забрать доступ и закрепить за собой место на эфире!</b>";

export async function handleDirectionPersonal({ callbackQuery, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  const chatId = callbackQuery.message?.chat?.id;
  const fromUser = callbackQuery.from || callbackQuery.from_user;
  if (!chatId) {
    console.error("direction_personal: chatId is missing", JSON.stringify(callbackQuery));
    return;
  }
  if (!fromUser) {
    console.error("direction_personal: fromUser is missing", JSON.stringify(callbackQuery));
    return;
  }

  await updateUserDirection(env.DB, fromUser.id, "personal");

  await addCoins(
    env.DB,
    fromUser.id,
    50,
    "выбор направления",
    "Бонус за выбор личного направления (personal)"
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
