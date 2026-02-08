const TELEGRAM_API_BASE = "https://api.telegram.org";

async function apiRequest(token, method, payload) {
  const url = `${TELEGRAM_API_BASE}/bot${token}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${body}`);
  }

  return response.json();
}

export async function sendMessage(token, payload) {
  return apiRequest(token, "sendMessage", payload);
}

export async function sendPhoto(token, payload) {
  return apiRequest(token, "sendPhoto", payload);
}

export async function answerCallbackQuery(token, payload) {
  return apiRequest(token, "answerCallbackQuery", payload);
}
