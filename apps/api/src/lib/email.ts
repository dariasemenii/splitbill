import { env } from "./env";

export async function sendLoginCode(email: string, code: string) {
  // У dev без ключа просто виводимо код у консоль
  if (!env.RESEND_API_KEY) {
    console.log(`[dev] Код входу для ${email}: ${code}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: email,
      subject: `Ваш код входу: ${code}`,
      text: `Ваш код для входу: ${code}\n\nКод дійсний 10 хвилин. Якщо ви не намагалися увійти, просто проігноруйте цей лист.`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    throw new Error("EMAIL_SEND_FAILED");
  }
}
