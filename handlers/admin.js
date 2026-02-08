import {
  addDays,
  formatDateTime,
  toWebinarDateInput,
  toSqlDateTime,
} from "../services/datetime.js";
import { createWebinar } from "../services/webinar_service.js";
import { getBalance, getUserWithCoins } from "../services/coin_service.js";
import { getUserByTelegramId } from "../services/user_service.js";

export async function handleCreateWebinar({ message, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  try {
    const args = message.text.split(" ");
    let webinarDate;

    if (args.length > 1) {
      const dateInput = args.slice(1).join(" ");
      const parsed = toWebinarDateInput(dateInput);
      if (!parsed) {
        await telegram.sendMessage(env.BOT_TOKEN, {
          chat_id: message.chat.id,
          text:
            "❌ Неверный формат даты. Используйте: YYYY-MM-DD HH:MM\nНапример: /create_webinar 2025-12-31 19:00",
        });
        return;
      }
      webinarDate = parsed;
    } else {
      webinarDate = toSqlDateTime(addDays(new Date(), 1));
    }

    await createWebinar(env.DB, webinarDate);

    const formatted = formatDateTime(webinarDate);
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text: `✅ Вебинар успешно создан на ${formatted.date} в ${formatted.time}.`,
    });
  } catch (error) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text: "❌ Произошла ошибка при создании вебинара.",
    });
  }
}

export async function handleBalance({ message, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  try {
    const fromUser = message.from || message.from_user;
    const args = message.text.split(" ");
    const telegramId = args.length > 1 ? Number(args[1]) : fromUser?.id;

    if (!Number.isInteger(telegramId)) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: message.chat.id,
        text: "❌ Неверный формат. Используйте: /balance или /balance <telegram_id>",
      });
      return;
    }

    const balance = await getBalance(env.DB, telegramId);
    const user = await getUserByTelegramId(env.DB, telegramId);

    if (!user) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: message.chat.id,
        text: `❌ Пользователь с ID ${telegramId} не найден в базе.`,
      });
      return;
    }

    const formatted = formatDateTime(user.start_time);
    const direction = user.direction || "не выбрано";

    const text =
      "💰 Баланс AI Coins 🪙\n\n" +
      `👤 Пользователь: ${user.user_name || "Анонимно"}\n` +
      `🆔 Telegram ID: ${telegramId}\n` +
      `💵 Баланс: ${balance} монет\n` +
      `📍 Направление: ${direction}\n` +
      `📅 Дата регистрации: ${formatted.date} ${formatted.time || ""}`;

    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text,
    });
  } catch (error) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text: "❌ Произошла ошибка при проверке баланса.",
    });
  }
}

export async function handleUserStats({ message, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  try {
    const fromUser = message.from || message.from_user;
    const args = message.text.split(" ");
    const telegramId = args.length > 1 ? Number(args[1]) : fromUser?.id;

    if (!Number.isInteger(telegramId)) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: message.chat.id,
        text: "❌ Неверный формат. Используйте: /user_stats или /user_stats <telegram_id>",
      });
      return;
    }

    const userWithCoins = await getUserWithCoins(env.DB, telegramId);

    if (!userWithCoins) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: message.chat.id,
        text: `❌ Пользователь с ID ${telegramId} не найден.`,
      });
      return;
    }

    const operations = userWithCoins.coin_operations || [];
    const totalEarned = operations
      .filter((op) => op.operation_type === "earned")
      .reduce((sum, op) => sum + op.amount, 0);
    const totalSpent = operations
      .filter((op) => op.operation_type === "spent")
      .reduce((sum, op) => sum + Math.abs(op.amount), 0);

    let text =
      "📊 Статистика операций с монетами 🪙\n\n" +
      `👤 Пользователь: ${userWithCoins.user_name || "Анонимно"}\n` +
      `🆔 Telegram ID: ${telegramId}\n` +
      `💵 Текущий баланс: ${userWithCoins.ai_coins_balance} монет\n\n` +
      "📈 Статистика:\n" +
      `✅ Всего заработано: ${totalEarned} монет\n` +
      `❌ Всего потрачено: ${totalSpent} монет\n` +
      `📝 Всего операций: ${operations.length}\n\n` +
      "📜 Последние операции:";

    if (operations.length > 0) {
      const lastOps = operations.slice(0, 10);
      for (const op of lastOps) {
        const opType = op.operation_type === "earned" ? "➕" : "➖";
        const formatted = formatDateTime(op.created_at);
        const dateInfo = formatted.date
          ? ` (${formatted.date} ${formatted.time})`
          : "";
        text += `\n${opType} ${op.amount} монет - ${op.reason || ""}${dateInfo}`;
      }
    } else {
      text += "\nНет операций";
    }

    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text,
    });
  } catch (error) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: message.chat.id,
      text: "❌ Произошла ошибка при получении статистики.",
    });
  }
}
