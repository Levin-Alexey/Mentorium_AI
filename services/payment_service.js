export async function getSuccessfulPayment(db, userId, courseId) {
  const row = await db
    .prepare(
      "SELECT id, status FROM payments WHERE user_id = ? AND course_id = ? AND status = 'succeeded' LIMIT 1"
    )
    .bind(userId, courseId)
    .first();

  return row || null;
}

export async function createPayment(db, payment) {
  await db
    .prepare(
      "INSERT INTO payments (user_id, course_id, payment_id, amount, currency, status, payment_metadata) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      payment.userId,
      payment.courseId,
      payment.paymentId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.metadata
    )
    .run();
}
