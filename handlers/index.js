import { handleStart } from "./start.js";
import { handleHelp } from "./help.js";
import { handleInfo } from "./info.js";
import { handleCallback } from "./callbacks.js";
import { handleCreateWebinar, handleBalance, handleUserStats } from "./admin.js";

function normalizeCommand(text) {
  const [first] = text.trim().split(" ");
  return first.split("@")[0];
}

export async function handleMessage(message, env, telegram) {
  const fromUser = message.from || message.from_user;
  if (
    typeof message.text !== "string" ||
    !fromUser ||
    !message.chat
  ) {
    return;
  }

  const command = normalizeCommand(message.text);

  if (command === "/start") {
    await handleStart({ message, env, telegram });
    return;
  }

  if (command === "/help") {
    await handleHelp({ message, env, telegram });
    return;
  }

  if (command === "/info") {
    await handleInfo({ message, env, telegram });
    return;
  }

  if (command === "/create_webinar") {
    await handleCreateWebinar({ message, env, telegram });
    return;
  }

  if (command === "/balance") {
    await handleBalance({ message, env, telegram });
    return;
  }

  if (command === "/user_stats") {
    await handleUserStats({ message, env, telegram });
    return;
  }
}

export async function handleCallbackQuery(callbackQuery, env, telegram) {
  await handleCallback({ callbackQuery, env, telegram });
}
