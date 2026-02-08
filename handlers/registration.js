import { getBalance, addCoins } from "../services/coin_service.js";
import { ensureUser, getUserByTelegramId } from "../services/user_service.js";
import {
  getNextWebinar,
  registerUserToWebinar,
  isUserRegistered,
  getWebinarById,
} from "../services/webinar_service.js";
import { getAdditionalButtons } from "./additional_buttons.js";
import { formatDateTime } from "../services/datetime.js";

const WEBINAR_GROUP_URL = "https://t.me/+VxGcD_UbVJE5NTNi";
const REGISTRATION_IMAGE =
  "https://image2url.com/images/1763061053554-10bed84f-dbf9-44ba-b230-8fc9a1549a99.jpeg";

export async function handleRegisterFlow({ callbackQuery, env, telegram }) {
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

  const nextWebinar = await getNextWebinar(env.DB);

  if (!nextWebinar) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text: "К сожалению, сейчас нет запланированных вебинаров.",
    });
    return;
  }

  const formatted = formatDateTime(nextWebinar.webinar_date);

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "✨ ПОДТВЕРДИТЬ УЧАСТИЕ ✨",
          callback_data: `confirm_registration_${nextWebinar.id}`,
        },
      ],
    ],
  };

  const text =
    "🏁 Финишная прямая!\n\n" +
    `🗓 Дата: ${formatted.date}\n` +
    `⏰ Время: ${formatted.time} МСК\n` +
    "📍 Место: Онлайн\n\n" +
    "⚠️ Важно: Чтобы забрать Базу нейросетей и активировать доступ к закрытой группе, нажми финальную кнопку регистрации.\n\n" +
    "За это действие я начислю еще +100 монет! 🪙";

  await telegram.sendMessage(env.BOT_TOKEN, {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

export async function handleConfirmRegistration({ callbackQuery, env, telegram }) {
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

  const webinarId = Number.parseInt(
    callbackQuery.data.split("_").pop(),
    10
  );

  if (!Number.isInteger(webinarId)) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text: "Произошла ошибка. Попробуйте снова.",
    });
    return;
  }

  await ensureUser(
    env.DB,
    fromUser.id,
    fromUser.username || null
  );

  const user = await getUserByTelegramId(env.DB, fromUser.id);
  if (!user) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text: "Произошла ошибка. Попробуйте снова.",
    });
    return;
  }

  const webinar = await getWebinarById(env.DB, webinarId);
  if (!webinar) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text: "Произошла ошибка. Попробуйте снова.",
    });
    return;
  }

  const alreadyRegistered = await isUserRegistered(env.DB, user.id, webinarId);

  if (alreadyRegistered) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text: "Вы уже зарегистрированы на этот вебинар.",
    });
    return;
  }

  await registerUserToWebinar(env.DB, user.id, webinarId);

  await addCoins(
    env.DB,
    fromUser.id,
    100,
    "подтверждение регистрации",
    "Бонус за подтверждение регистрации на вебинар"
  );

  const inlineKeyboard = [];

  inlineKeyboard.push([
    {
      text: "🔐 Закрытая группа по ИИ",
      url: WEBINAR_GROUP_URL,
    },
  ]);

  inlineKeyboard.push(...getAdditionalButtons());

  inlineKeyboard.push([
    {
      text: "ℹ️ Информация о спикере",
      callback_data: "speaker_info",
    },
  ]);

  await telegram.sendPhoto(env.BOT_TOKEN, {
    chat_id: chatId,
    photo: REGISTRATION_IMAGE,
  });

  const balance = await getBalance(env.DB, fromUser.id);
  const text =
    "🎉 УРА! ТЫ В СПИСКЕ УЧАСТНИКОВ!\n\n" +
    "✅ Регистрация пройдена.\n" +
    `💰 Твой баланс: ${balance} AI-Coins (Ты сможешь обменять их на скидку или бонусы в конце вебинара).\n\n` +
    "📲 Что дальше:\n" +
    "Ссылку на вход я пришлю в этот бот:\n" +
    "- в день эфира утром\n" +
    "- за 1 час до старта.\n\n" +
    "🔥 А ТЕПЕРЬ - ГЛАВНЫЙ БОНУС!\n" +
    "Я открыл тебе доступ в Закрытый канал, где уже лежит та самая полезная информация.\n\n" +
    "👇 Вступай прямо сейчас, пока ссылка активна";

  await telegram.sendMessage(env.BOT_TOKEN, {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
}
