import { getBalance, addCoins } from "../services/coin_service.js";
import { ensureUser } from "../services/user_service.js";
import { getUpcomingWebinarForUser } from "../services/webinar_service.js";
import { getAdditionalButtons } from "./additional_buttons.js";
import { formatDateTime } from "../services/datetime.js";

const WEBINAR_GROUP_URL = "https://t.me/+VxGcD_UbVJE5NTNi";
const UPCOMING_WEBINAR_IMAGE =
  "https://image2url.com/images/1763063078779-f4fbaecb-7fe2-4524-99d5-e65417d77473.jpeg";
const DEFAULT_START_IMAGE =
  "https://image2url.com/images/1762884119936-b5ace70c-3771-4df5-8930-b265953e1e77.jpeg";

export async function handleStart({ message, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  const fromUser = message.from || message.from_user;
  if (!fromUser) {
    return;
  }

  await ensureUser(
    env.DB,
    fromUser.id,
    fromUser.username || null
  );

  const upcoming = await getUpcomingWebinarForUser(env.DB, fromUser.id);

  if (upcoming) {
    const inlineKeyboard = [];

    if (upcoming.webinar_link) {
      inlineKeyboard.push([
        {
          text: "🎥 Ссылка на вебинар",
          url: upcoming.webinar_link,
        },
      ]);
    }

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
      chat_id: message.chat.id,
      photo: UPCOMING_WEBINAR_IMAGE,
    });

    const formatted = formatDateTime(upcoming.webinar_date);

    const text =
      `🎉 <b>Приветсвую тебя, ${fromUser.first_name}!</b>\n` +
      "Отлично, что вернулся, скоро мы начинаем большое путешествие в мир ИИ! \n\n" +
      `<b>Ты зарегистрирован на вебинар: 📅 ${formatted.date} в ${formatted.time} МСК</b>\n\n` +
      "✅ <b>Всё готово к старту:</b>\n\n" +
      "🎥 Ссылка на вебинар, <b>под этим собщением</b>\n\n" +
      "📲 Напоминание придёт сюда, в чат, за 1 час до начала\n\n" +
      "🔐 Нажми на кнопку \"Закрытая группа по ИИ\" - там тебя ждут эксклюзивные знания!\n\n" +
      "💡 Будь с нами - всё самое важное будет приходить сюда!\n\n" +
      "⚡ До встречи! Готовься к мощным знаниям! 🚀";

    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });

    return;
  }

  const balance = await getBalance(env.DB, fromUser.id);
  if (balance === 0) {
    await addCoins(
      env.DB,
      fromUser.id,
      100,
      "регистрация",
      "Бонус за регистрацию при первом входе /start"
    );
  }

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🧑‍💻 Для личной эффективности (+50 🪙)",
          callback_data: "direction_personal",
        },
      ],
      [
        {
          text: "💼 Для бизнеса и масштабирования (+50 🪙)",
          callback_data: "direction_business",
        },
      ],
    ],
  };

  const caption =
    "👋 Привет!\n" +
    "Ты в игре. Твой бонусный счет открыт: +100 AI-Coins 🪙 начислены!\n\n" +
    "Чтобы вебинар прошел для тебя максимально полезно, я хочу адаптировать примеры эфира под твои задачи. За выбор направления я начислю еще 50 монет.\n\n" +
    "👇 Посмотри, что нас ждет на эфире (1 час):\n" +
    "🔹 Блок 1: ИИ как привычка (делегируем рутину).\n" +
    "🔹 Блок 2: Бесплатный арсенал (инструменты мощнее ChatGPT).\n" +
    "🔹 Блок 3: Тотальная автоматизация (схемы экономии времени).\n\n" +
    "🎁 <b>Твой подарок (База нейросетей) придет сразу после регистрации</b>\n\n" +
    "Для каких целей ты хочешь освоить ИИ?";

  await telegram.sendPhoto(env.BOT_TOKEN, {
    chat_id: message.chat.id,
    photo: DEFAULT_START_IMAGE,
    caption,
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}
