export async function getBalance(db, telegramId) {
	const row = await db
		.prepare("SELECT ai_coins_balance FROM users WHERE telegram_id = ?")
		.bind(telegramId)
		.first();

	return row ? row.ai_coins_balance : 0;
}

export async function addCoins(db, telegramId, amount, reason, description) {
	const normalizedAmount = Math.abs(amount);
	const userRow = await db
		.prepare("SELECT id FROM users WHERE telegram_id = ?")
		.bind(telegramId)
		.first();

	if (!userRow) {
		return 0;
	}

	await db
		.prepare(
			"UPDATE users SET ai_coins_balance = ai_coins_balance + ? WHERE id = ?"
		)
		.bind(normalizedAmount, userRow.id)
		.run();

	await db
		.prepare(
			"INSERT INTO ai_coin_operations (user_id, amount, operation_type, reason, description) VALUES (?, ?, ?, ?, ?)"
		)
		.bind(userRow.id, normalizedAmount, "earned", reason, description || null)
		.run();

	const updated = await db
		.prepare("SELECT ai_coins_balance FROM users WHERE id = ?")
		.bind(userRow.id)
		.first();

	return updated ? updated.ai_coins_balance : normalizedAmount;
}

export async function subtractCoins(db, telegramId, amount, reason, description) {
	const normalizedAmount = Math.abs(amount);
	const userRow = await db
		.prepare("SELECT id, ai_coins_balance FROM users WHERE telegram_id = ?")
		.bind(telegramId)
		.first();

	if (!userRow) {
		return -1;
	}

	if (userRow.ai_coins_balance < normalizedAmount) {
		return -1;
	}

	await db
		.prepare(
			"UPDATE users SET ai_coins_balance = ai_coins_balance - ? WHERE id = ?"
		)
		.bind(normalizedAmount, userRow.id)
		.run();

	await db
		.prepare(
			"INSERT INTO ai_coin_operations (user_id, amount, operation_type, reason, description) VALUES (?, ?, ?, ?, ?)"
		)
		.bind(userRow.id, -normalizedAmount, "spent", reason, description || null)
		.run();

	const updated = await db
		.prepare("SELECT ai_coins_balance FROM users WHERE id = ?")
		.bind(userRow.id)
		.first();

	return updated ? updated.ai_coins_balance : userRow.ai_coins_balance;
}

export async function getUserWithCoins(db, telegramId) {
	const user = await db
		.prepare("SELECT * FROM users WHERE telegram_id = ?")
		.bind(telegramId)
		.first();

	if (!user) {
		return null;
	}

	const operations = await db
		.prepare(
			"SELECT * FROM ai_coin_operations WHERE user_id = ? ORDER BY created_at DESC"
		)
		.bind(user.id)
		.all();

	return {
		...user,
		coin_operations: operations?.results || [],
	};
}
