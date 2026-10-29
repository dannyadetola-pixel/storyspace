const RESEND_ENDPOINT = "https://api.resend.com/emails";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[email] skipped "${subject}" to ${to}: RESEND_API_KEY or EMAIL_FROM is not set`
    );
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

function wrap(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1E1B16;">
      <h1 style="font-size: 20px; font-weight: 500; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="font-size: 12px; color: #888; margin-top: 32px;">StorySpace</p>
    </div>`;
}

export function welcomeEmail(username: string) {
  const name = escapeHtml(username);
  return {
    subject: "Welcome to StorySpace",
    html: wrap(
      `Welcome, ${name}`,
      `<p style="font-size: 15px; line-height: 1.6;">Your account is ready. Start a book, share a post, or find writers you like.</p>`
    ),
  };
}

export function signInAlertEmail(username: string, when: Date) {
  const name = escapeHtml(username);
  const time = when.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });
  return {
    subject: "New sign-in to StorySpace",
    html: wrap(
      "New sign-in",
      `<p style="font-size: 15px; line-height: 1.6;">Your account (${name}) was signed in on ${time} (Lagos time).</p>
       <p style="font-size: 15px; line-height: 1.6;">If this wasn't you, change your password right away.</p>`
    ),
  };
}