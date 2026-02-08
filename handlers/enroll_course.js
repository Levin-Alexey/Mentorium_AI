import { ensureUser } from "../services/user_service.js";
import { getActiveCourse, getCourseRegistration } from "../services/course_service.js";
import { getSuccessfulPayment, createPayment } from "../services/payment_service.js";
import { createPayment as createYooKassaPayment } from "../services/yookassa.js";
import { formatDateTime } from "../services/datetime.js";

const COURSE_PHOTO =
  "https://image2url.com/images/1763093675664-50aea332-8b0b-4d62-89ac-d06086940beb.jpeg";

function buildCourseCaption(course) {
  if (!course) {
    return "Подробности об обучении позже...";
  }

  const formatted = formatDateTime(course.start_date);

  return (
    "🚀 Полный курс по ИИ\n" +
    `📅 Дата старта: ${formatted.date} в ${formatted.time} МСК\n` +
    `💰 Цена: ${Number(course.price).toFixed(2)} ₽\n\n` +
    "Что вы получите:\n" +
    "4 интенсивных вебинара по 1.5 часа в прямом эфире\n" +
    "Каждый день — новый модуль с практическими навыками\n" +
    "📚 Программа курса:\n" +
    "День 1: Основы AI и умные чат-боты\n\n" +
    "Что такое LLM и как они работают (простым языком)\n" +
    "Топовые нейросети: Claude Sonnet, DeepSeek, Qwen, Perplexity\n" +
    "Создание эффективных промптов для рабочих задач\n" +
    "Чат-боты для автоматизации клиентской поддержки\n" +
    "✅ Результат: экономия 5-10 часов в неделю\n\n" +
    "День 2: AI для контента — изображения и видео\n\n" +
    "Генерация изображений: Midjourney, DALL-E, Stable Diffusion, Flux\n" +
    "Создание видео: Runway, Pika, Kling AI\n" +
    "Контент для соцсетей, рекламы и презентаций\n" +
    "✅ Результат: профессиональный контент без дизайнера\n\n" +
    "День 3: 3D-аватары и виртуальные презентации\n\n" +
    "Создание AI-аватаров для видео\n" +
    "Виртуальные ассистенты и спикеры\n" +
    "Применение в обучении, продажах и маркетинге\n" +
    "✅ Результат: масштабирование личного бренда\n\n" +
    "День 4: Автоматизация бизнес-процессов с N8N\n\n" +
    "No-code автоматизация рабочих процессов\n" +
    "Интеграция AI с CRM, почтой, мессенджерами\n" +
    "Создание автоматических воронок\n" +
    "✅ Результат: автоматизация до 70% рутины\n\n\n" +
    "🎁 Бонусы участникам:\n" +
    "✔️ Все записи вебинаров в личном кабинете\n" +
    "✔️ Доступ в закрытую группу с дополнительными материалами\n" +
    "✔️ Готовые шаблоны промптов и чек-листы\n" +
    "✔️ Поддержка и ответы на вопросы в чате участников\n" +
    "✔️ База знаний с инструкциями и кейсами\n\n" +
    "⏰ Формат проведения:\n" +
    "🔴 Прямые эфиры каждый будний день в течение недели\n" +
    "📹 Время: 20:00 МСК (1.5 часа)\n" +
    "🔄 Гибкий график: можете выбрать удобный поток каждую неделю\n\n" +
    "👥 Для кого этот курс:\n\n" +
    "Для специалистов — повышение личной эффективности\n" +
    "Для владельцев бизнеса — автоматизация и масштабирование\n" +
    "Для начинающих — с нуля до уверенного применения AI\n\n" +
    "Никакого программирования! Только практические инструменты, которые работают уже сегодня.\n\n" +
    `Цена курса: ${Number(course.price).toFixed(2)} ₽\n` +
    `Старт ближайшего потока: ${formatted.date}`
  );
}

export async function handleEnrollCourse({ callbackQuery, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  const chatId = callbackQuery.message?.chat?.id;
  if (!chatId) {
    return;
  }

  try {
    const course = await getActiveCourse(env.DB);
    const caption = buildCourseCaption(course);
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "💬 Получить консультацию и задать вопрос",
            url: "https://t.me/LevinMSK",
          },
        ],
        [
          {
            text: "💳 Получить доступ к курсу",
            callback_data: "purchase_course",
          },
        ],
      ],
    };

    try {
      await telegram.sendPhoto(env.BOT_TOKEN, {
        chat_id: chatId,
        photo: COURSE_PHOTO,
        caption,
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    } catch (error) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: chatId,
        text: caption,
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    const fallbackKeyboard = {
      inline_keyboard: [
        [
          {
            text: "🙋‍♂️ Получить консультацию или задать вопрос",
            url: "https://t.me/LevinMSK",
          },
        ],
        [
          {
            text: "🚀 Записаться на курс",
            callback_data: "purchase_course",
          },
        ],
      ],
    };

    try {
      await telegram.sendPhoto(env.BOT_TOKEN, {
        chat_id: chatId,
        photo: COURSE_PHOTO,
        caption: "Подробности об обучении позже...",
        reply_markup: fallbackKeyboard,
      });
    } catch (fallbackError) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: chatId,
        text: "Подробности об обучении позже...",
        reply_markup: fallbackKeyboard,
      });
    }
  }
}

export async function handlePurchaseCourse({ callbackQuery, env, telegram }) {
  if (!env.DB) {
    throw new Error("D1 database binding is not configured");
  }

  const chatId = callbackQuery.message?.chat?.id;
  const fromUser = callbackQuery.from || callbackQuery.from_user;
  if (!chatId) {
    return;
  }
  if (!fromUser) {
    return;
  }

  const shopId = env.PAYMENT_SHOP_ID;
  const secretKey = env.PAYMENT_SECRET_KEY;

  if (!shopId || !secretKey) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text: "❌ Платежные реквизиты не настроены.",
    });
    return;
  }

  const telegramId = fromUser.id;
  const userName = fromUser.first_name || "Пользователь";
  const webhookUrl = env.WEBHOOK_URL || "https://lexi.neuronaikids.ru/webhook";

  try {
    await ensureUser(
      env.DB,
      telegramId,
      fromUser.username || null
    );

    const userRow = await env.DB
      .prepare("SELECT * FROM users WHERE telegram_id = ?")
      .bind(telegramId)
      .first();

    if (!userRow) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: chatId,
        text: "❌ Пользователь не найден.",
      });
      return;
    }

    const course = await getActiveCourse(env.DB);
    if (!course) {
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: chatId,
        text: "❌ В данный момент нет доступных курсов для покупки.",
      });
      return;
    }

    const registration = await getCourseRegistration(
      env.DB,
      userRow.id,
      course.id
    );

    if (registration) {
      const formatted = formatDateTime(course.start_date);
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: chatId,
        text:
          `✅ Вы уже зарегистрированы на курс <b>${course.course_name}</b>!\n\n` +
          `📅 Дата старта: ${formatted.date} в ${formatted.time} МСК`,
        parse_mode: "HTML",
      });
      return;
    }

    const existingPayment = await getSuccessfulPayment(
      env.DB,
      userRow.id,
      course.id
    );

    if (existingPayment) {
      const formatted = formatDateTime(course.start_date);
      await telegram.sendMessage(env.BOT_TOKEN, {
        chat_id: chatId,
        text:
          `✅ У вас уже есть оплаченный доступ к курсу <b>${course.course_name}</b>!\n\n` +
          `📅 Дата старта: ${formatted.date} в ${formatted.time} МСК`,
        parse_mode: "HTML",
      });
      return;
    }

    const paymentId = crypto.randomUUID();
    const defaultEmail = env.DEFAULT_CUSTOMER_EMAIL || "";

    let customerData = {};
    if (defaultEmail) {
      customerData.email = defaultEmail;
    } else {
      customerData.email = `user_${telegramId}@telegram.local`;
    }

    const paymentPayload = {
      amount: {
        value: Number(course.price).toFixed(2),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: webhookUrl,
      },
      capture: true,
      description: `Оплата курса: ${course.course_name}`,
      receipt: {
        customer: customerData,
        items: [
          {
            description: course.course_name,
            quantity: "1.00",
            amount: {
              value: Number(course.price).toFixed(2),
              currency: "RUB",
            },
            vat_code: 1,
            payment_subject: "service",
            payment_mode: "full_prepayment",
          },
        ],
      },
      metadata: {
        user_id: String(userRow.id),
        telegram_id: String(telegramId),
        user_name: userName,
        course_id: String(course.id),
        course_name: course.course_name,
      },
    };

    const paymentResponse = await createYooKassaPayment({
      shopId,
      secretKey,
      idempotenceKey: paymentId,
      payload: paymentPayload,
    });

    if (!paymentResponse?.confirmation?.confirmation_url) {
      throw new Error("Отсутствует ссылка на оплату");
    }

    await createPayment(env.DB, {
      userId: userRow.id,
      courseId: course.id,
      paymentId,
      amount: Number(course.price).toFixed(2),
      currency: "RUB",
      status: "pending",
      metadata: JSON.stringify(paymentResponse.metadata || {}),
    });

    const paymentUrl = paymentResponse.confirmation.confirmation_url;
    const formatted = formatDateTime(course.start_date);
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "💳 Получить доступ к курсу",
            url: paymentUrl,
          },
        ],
      ],
    };

    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text:
        "🎯 Вы приняли правильное решение!\n\n" +
        `🚀 <b>${course.course_name}</b>\n` +
        `📅 Старт: ${formatted.date} в ${formatted.time} МСК\n` +
        `💰 Всего ${Number(course.price).toFixed(2)} ₽\n\n` +
        "Это меньше, чем 1 час работы дизайнера,\n" +
        "а навыки останутся с Вами навсегда!\n\n" +
        "🎁 <b>Бонусом получите:</b>\n" +
        "- Записи всех вебинаров\n" +
        "- Доступ в закрытую группу\n" +
        "- Готовые шаблоны и промпты\n\n" +
        "Получитие доступ уже сейчас 👇",
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (error) {
    await telegram.sendMessage(env.BOT_TOKEN, {
      chat_id: chatId,
      text:
        "❌ Произошла ошибка при создании платежа. Попробуйте позже.\n\n" +
        `Ошибка: ${error.message}`,
    });
  }
}
