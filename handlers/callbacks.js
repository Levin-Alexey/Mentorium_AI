import { handleDirectionPersonal } from "./personal_direction.js";
import { handleDirectionBusiness } from "./business_direction.js";
import { handleSpeakerInfo } from "./speaker_info.js";
import { getPrivateChannelAlertText } from "./additional_actions.js";
import {
  handleRegisterFlow,
  handleConfirmRegistration,
} from "./registration.js";
import { handleEnrollCourse, handlePurchaseCourse } from "./enroll_course.js";

export async function handleCallback({ callbackQuery, env, telegram }) {
  const data = callbackQuery.data || "";

  if (data === "private_channel") {
    try {
      await telegram.answerCallbackQuery(env.BOT_TOKEN, {
        callback_query_id: callbackQuery.id,
        text: getPrivateChannelAlertText(),
        show_alert: true,
      });
    } catch (error) {
      console.error("private_channel answerCallbackQuery error:", error);
    }
    return;
  }

  try {
    await telegram.answerCallbackQuery(env.BOT_TOKEN, {
      callback_query_id: callbackQuery.id,
    });
  } catch (error) {
    // Telegram can return 400 if callback was already answered or expired.
    // This should not break business logic processing.
    console.error("answerCallbackQuery warning:", error);
  }

  if (env.KV && callbackQuery.id) {
    const dedupeKey = `cb:${callbackQuery.id}`;
    const alreadyHandled = await env.KV.get(dedupeKey);
    if (alreadyHandled) {
      return;
    }
    await env.KV.put(dedupeKey, "1", { expirationTtl: 3600 });
  }

  try {
    if (data === "direction_personal") {
      await handleDirectionPersonal({ callbackQuery, env, telegram });
    } else if (data === "direction_business") {
      await handleDirectionBusiness({ callbackQuery, env, telegram });
    } else if (data === "speaker_info") {
      await handleSpeakerInfo({ callbackQuery, env, telegram });
    } else if (data === "register" || data === "scale_business") {
      await handleRegisterFlow({ callbackQuery, env, telegram });
    } else if (data.startsWith("confirm_registration_")) {
      await handleConfirmRegistration({ callbackQuery, env, telegram });
    } else if (data === "enroll_course") {
      await handleEnrollCourse({ callbackQuery, env, telegram });
    } else if (data === "purchase_course") {
      await handlePurchaseCourse({ callbackQuery, env, telegram });
    }
  } catch (error) {
    // Avoid returning 500 on callback_query updates, otherwise Telegram retries
    // the same update and users get duplicate messages.
    console.error("callback handler error:", error);
  }
}
