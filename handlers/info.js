export async function handleInfo({ message, env, telegram }) {
  const text =
    "ℹ️ Информация о боте:\n\n" +
    "🔹 Название: AI Bot Education\n" +
    "🔹 Версия: 0.1.0\n" +
    "🔹 Фреймворк: Cloudflare Workers\n" +
    "🔹 Язык: JavaScript\n\n" +
    "Создан для образовательных целей 📖";

  await telegram.sendMessage(env.BOT_TOKEN, {
    chat_id: message.chat.id,
    text,
  });
}
