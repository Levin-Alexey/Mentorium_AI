export async function handleHelp({ message, env, telegram }) {
  const text =
    "📚 Помощь:\n\n" +
    "Этот бот находится в разработке.\n" +
    "Скоро здесь появятся новые функции!\n\n" +
    "Команды:\n" +
    "/start - Начать работу\n" +
    "/help - Эта справка\n" +
    "/info - Информация о боте";

  await telegram.sendMessage(env.BOT_TOKEN, {
    chat_id: message.chat.id,
    text,
  });
}
