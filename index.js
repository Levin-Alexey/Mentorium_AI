import { handleMessage, handleCallbackQuery } from "./handlers/index.js";
import * as telegram from "./services/telegram.js";

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
		},
	});
}

async function handleUpdate(update, env) {
	if (update.message) {
		await handleMessage(update.message, env, telegram);
		return;
	}

	if (update.callback_query) {
		await handleCallbackQuery(update.callback_query, env, telegram);
	}
}

export default {
	async fetch(request, env) {
		if (!env || !env.BOT_TOKEN) {
			return jsonResponse({ error: "BOT_TOKEN is not configured" }, 500);
		}

		if (request.method === "GET") {
			return jsonResponse({ ok: true, service: "mentoriumai" });
		}

		if (request.method !== "POST") {
			return jsonResponse({ error: "Method not allowed" }, 405);
		}

		let update;
		try {
			update = await request.json();
		} catch (error) {
			return jsonResponse({ error: "Invalid JSON" }, 400);
		}

		try {
			await handleUpdate(update, env);
		} catch (error) {
			return jsonResponse({ error: error.message }, 500);
		}

		return jsonResponse({ ok: true });
	},
};
