export async function getUpcomingWebinarForUser(db, telegramId) {
  const row = await db
    .prepare(
      "SELECT w.id, w.webinar_date, w.webinar_link, w.topic " +
        "FROM webinars w " +
        "JOIN webinar_registrations wr ON wr.webinar_id = w.id " +
        "JOIN users u ON u.id = wr.user_id " +
        "WHERE u.telegram_id = ? AND datetime(w.webinar_date) > datetime('now', '+3 hours') " +
        "ORDER BY datetime(w.webinar_date) ASC " +
        "LIMIT 1"
    )
    .bind(telegramId)
    .first();

  return row || null;
}

export async function getNextWebinar(db) {
  const row = await db
    .prepare(
      "SELECT id, webinar_date, webinar_link, topic " +
        "FROM webinars " +
        "WHERE datetime(webinar_date) > datetime('now', '+3 hours') " +
        "ORDER BY datetime(webinar_date) ASC " +
        "LIMIT 1"
    )
    .first();

  return row || null;
}

export async function createWebinar(db, webinarDate) {
  await db
    .prepare("INSERT INTO webinars (webinar_date) VALUES (?)")
    .bind(webinarDate)
    .run();
}

export async function registerUserToWebinar(db, userId, webinarId) {
  await db
    .prepare(
      "INSERT OR IGNORE INTO webinar_registrations (user_id, webinar_id) VALUES (?, ?)"
    )
    .bind(userId, webinarId)
    .run();
}

export async function isUserRegistered(db, userId, webinarId) {
  const row = await db
    .prepare(
      "SELECT user_id FROM webinar_registrations WHERE user_id = ? AND webinar_id = ?"
    )
    .bind(userId, webinarId)
    .first();

  return Boolean(row);
}

export async function getWebinarById(db, webinarId) {
  const row = await db
    .prepare("SELECT id, webinar_date, webinar_link, topic FROM webinars WHERE id = ?")
    .bind(webinarId)
    .first();

  return row || null;
}
