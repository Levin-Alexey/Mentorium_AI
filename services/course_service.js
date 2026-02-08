export async function getActiveCourse(db) {
  const row = await db
    .prepare(
      "SELECT id, course_name, start_date, price, description, course_link, is_active " +
        "FROM courses " +
        "WHERE is_active = 1 AND datetime(start_date) > datetime('now', '+3 hours') " +
        "ORDER BY datetime(start_date) ASC " +
        "LIMIT 1"
    )
    .first();

  return row || null;
}

export async function getCourseRegistration(db, userId, courseId) {
  const row = await db
    .prepare(
      "SELECT user_id, course_id FROM course_registrations WHERE user_id = ? AND course_id = ?"
    )
    .bind(userId, courseId)
    .first();

  return row || null;
}

export async function createCourseRegistration(db, userId, courseId) {
  await db
    .prepare(
      "INSERT OR IGNORE INTO course_registrations (user_id, course_id) VALUES (?, ?)"
    )
    .bind(userId, courseId)
    .run();
}
