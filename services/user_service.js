export async function ensureUser(db, telegramId, userName) {
  await db
    .prepare(
      "INSERT OR IGNORE INTO users (telegram_id, user_name) VALUES (?, ?)"
    )
    .bind(telegramId, userName)
    .run();

  const row = await db
    .prepare("SELECT * FROM users WHERE telegram_id = ?")
    .bind(telegramId)
    .first();

  return row || null;
}

export async function updateUserDirection(db, telegramId, direction) {
  await db
    .prepare("UPDATE users SET direction = ? WHERE telegram_id = ?")
    .bind(direction, telegramId)
    .run();
}

export async function getUserByTelegramId(db, telegramId) {
  const row = await db
    .prepare("SELECT * FROM users WHERE telegram_id = ?")
    .bind(telegramId)
    .first();

  return row || null;
}
