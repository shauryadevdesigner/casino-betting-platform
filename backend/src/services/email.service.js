import sgMail from "@sendgrid/mail";
import { env } from "../config/env.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, "../templates/emails");

if (env.sendgridApiKey) {
  sgMail.setApiKey(env.sendgridApiKey);
}

const queue = [];
let processing = false;

function loadTemplate(name, vars = {}) {
  try {
    let html = readFileSync(join(templatesDir, `${name}.html`), "utf8");
    for (const [k, v] of Object.entries(vars)) {
      html = html.replaceAll(`{{${k}}}`, String(v));
    }
    return html;
  } catch {
    return `<p>${vars.message || name}</p>`;
  }
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;
  const job = queue.shift();
  try {
    if (!env.sendgridApiKey) {
      console.log(`[email:skipped] ${job.subject} → ${job.to}`);
    } else {
      await sgMail.send({
        to: job.to,
        from: env.senderEmail,
        subject: job.subject,
        html: job.html,
      });
    }
  } catch (err) {
    console.error("Email send failed:", err.message);
  } finally {
    processing = false;
    if (queue.length) setImmediate(processQueue);
  }
}

export function queueEmail({ to, subject, template, vars = {} }) {
  queue.push({
    to,
    subject,
    html: loadTemplate(template, vars),
  });
  setImmediate(processQueue);
}

export const EmailTemplates = {
  passwordReset: (to, vars) =>
    queueEmail({ to, subject: "Reset your FastLuck password", template: "password-reset", vars }),
  emailVerification: (to, vars) =>
    queueEmail({ to, subject: "Verify your FastLuck email", template: "email-verification", vars }),
  depositConfirmation: (to, vars) =>
    queueEmail({ to, subject: "Deposit confirmed", template: "deposit-confirmation", vars }),
  withdrawalNotification: (to, vars) =>
    queueEmail({ to, subject: "Withdrawal submitted", template: "withdrawal-notification", vars }),
  referralInvitation: (to, vars) =>
    queueEmail({ to, subject: "You're invited to FastLuck", template: "referral-invitation", vars }),
  vipUpgrade: (to, vars) =>
    queueEmail({ to, subject: "VIP tier upgraded!", template: "vip-upgrade", vars }),
  dailyRewardClaim: (to, vars) =>
    queueEmail({ to, subject: "Daily reward claimed", template: "daily-reward-claim", vars }),
};
