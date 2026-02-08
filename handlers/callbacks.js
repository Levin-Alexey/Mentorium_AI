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

  if (data === "direction_personal") {
    await handleDirectionPersonal({ callbackQuery, env, telegram });
  } else if (data === "direction_business") {
    await handleDirectionBusiness({ callbackQuery, env, telegram });
  } else if (data === "speaker_info") {
    await handleSpeakerInfo({ callbackQuery, env, telegram });
  } else if (data === "private_channel") {
    await telegram.answerCallbackQuery(env.BOT_TOKEN, {
      callback_query_id: callbackQuery.id,
      text: getPrivateChannelAlertText(),
      show_alert: true,
    });
    return;
  } else if (data === "register" || data === "scale_business") {
    await handleRegisterFlow({ callbackQuery, env, telegram });
  } else if (data.startsWith("confirm_registration_")) {
    await handleConfirmRegistration({ callbackQuery, env, telegram });
  } else if (data === "enroll_course") {
    await handleEnrollCourse({ callbackQuery, env, telegram });
  } else if (data === "purchase_course") {
    await handlePurchaseCourse({ callbackQuery, env, telegram });
  }

  await telegram.answerCallbackQuery(env.BOT_TOKEN, {
    callback_query_id: callbackQuery.id,
  });
}
