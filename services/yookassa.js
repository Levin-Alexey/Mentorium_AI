function buildBasicAuth(shopId, secretKey) {
  return btoa(`${shopId}:${secretKey}`);
}

export async function createPayment({
  shopId,
  secretKey,
  idempotenceKey,
  payload,
}) {
  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization: `Basic ${buildBasicAuth(shopId, secretKey)}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YooKassa API error: ${response.status} ${body}`);
  }

  return response.json();
}
