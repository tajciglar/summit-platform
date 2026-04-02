/**
 * Brevo (formerly Sendinblue) transactional email client — server-only.
 *
 * Sends post-purchase confirmation emails with:
 * - Order summary (product names, amounts)
 * - Signed Bunny CDN links for digital file delivery
 * - Styled HTML template (inline CSS for email client compatibility)
 *
 * Uses Brevo's v3 SMTP API directly via fetch — no SDK dependency needed.
 *
 * NEVER import this module from client-side code. The BREVO_API_KEY must
 * not be exposed to the browser.
 */

import { getSignedBunnyCdnUrl } from './bunny'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface BrevoRecipient {
  email: string
  name?: string
}

interface BrevoEmailPayload {
  sender: BrevoRecipient
  to: BrevoRecipient[]
  replyTo?: BrevoRecipient
  subject: string
  htmlContent: string
  textContent?: string
  tags?: string[]
  headers?: Record<string, string>
}

interface BrevoSendResponse {
  messageId: string
}

/**
 * Send a transactional email via Brevo.
 * Returns the Brevo messageId for logging.
 *
 * @throws Error if the API call fails (caller should catch and log)
 */
export async function sendEmail(payload: BrevoEmailPayload): Promise<string> {
  const apiKey = import.meta.env.BREVO_API_KEY
  if (!apiKey) throw new Error('[brevo.ts] BREVO_API_KEY is not configured')

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[brevo.ts] Brevo API error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as BrevoSendResponse
  return data.messageId
}

// ─── Order confirmation ──────────────────────────────────────────────────────

export interface OrderConfirmationParams {
  customerEmail: string
  customerName: string
  orderNumber: string
  summitName: string
  items: Array<{
    productName: string
    price: number   // in cents
    currency: string
    type: string
    /** Raw Bunny CDN paths for digital delivery */
    filePaths?: string[]
  }>
  /** Total charged in cents */
  amountTotal: number
  currency: string
}

/**
 * Send a purchase confirmation email with order details and digital delivery links.
 *
 * File delivery: For each item that has filePaths, generates signed Bunny CDN
 * URLs (valid for 24 hours) so the customer can immediately download their purchase.
 */
export async function sendOrderConfirmation(
  params: OrderConfirmationParams
): Promise<string> {
  const fromEmail = import.meta.env.BREVO_FROM_EMAIL || 'noreply@example.com'
  const fromName = import.meta.env.BREVO_FROM_NAME || params.summitName

  // ── Build signed download links ────────────────────────────────────────────
  const downloadLinks: Array<{ label: string; url: string }> = []

  for (const item of params.items) {
    for (const filePath of item.filePaths ?? []) {
      downloadLinks.push({
        label: item.productName,
        url: getSignedBunnyCdnUrl(filePath, 86400), // 24 hours
      })
    }
  }

  // ── Format currency amount ─────────────────────────────────────────────────
  const formattedTotal = formatCurrency(params.amountTotal, params.currency)

  // ── Build HTML email ───────────────────────────────────────────────────────
  const htmlContent = buildOrderConfirmationHtml({
    customerName: params.customerName,
    orderNumber: params.orderNumber,
    summitName: params.summitName,
    items: params.items,
    amountTotal: formattedTotal,
    downloadLinks,
  })

  const textContent = buildOrderConfirmationText({
    customerName: params.customerName,
    orderNumber: params.orderNumber,
    summitName: params.summitName,
    amountTotal: formattedTotal,
    downloadLinks,
  })

  return sendEmail({
    sender: { email: fromEmail, name: fromName },
    to: [{ email: params.customerEmail, name: params.customerName }],
    subject: `Your order confirmation — ${params.summitName}`,
    htmlContent,
    textContent,
    tags: ['order-confirmation', `order-${params.orderNumber}`],
  })
}

// ─── Email templates ──────────────────────────────────────────────────────────

function formatCurrency(amountCents: number, currency: string): string {
  const amount = amountCents / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  })
  return formatter.format(amount)
}

interface TemplateData {
  customerName: string
  orderNumber: string
  summitName: string
  items?: OrderConfirmationParams['items']
  amountTotal: string
  downloadLinks: Array<{ label: string; url: string }>
}

function buildOrderConfirmationHtml(data: TemplateData): string {
  const downloadSection =
    data.downloadLinks.length > 0
      ? `
      <tr>
        <td style="padding: 24px 0 0;">
          <h2 style="font-family: Arial, sans-serif; font-size: 18px; color: #111827; margin: 0 0 12px;">
            Your Downloads
          </h2>
          ${data.downloadLinks
            .map(
              (link) => `
          <a href="${escapeHtml(link.url)}"
             style="display:block; padding:12px 16px; margin-bottom:8px; background:#eff6ff;
                    border:1px solid #bfdbfe; border-radius:6px; color:#1d4ed8;
                    text-decoration:none; font-family:Arial,sans-serif; font-size:14px;">
            ⬇ ${escapeHtml(link.label)}
          </a>`
            )
            .join('\n')}
          <p style="font-family:Arial,sans-serif; font-size:12px; color:#6b7280; margin-top:8px;">
            Download links expire in 24 hours. Log in to your account to get fresh links.
          </p>
        </td>
      </tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;
                    box-shadow:0 1px 3px rgba(0,0,0,.1);max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1d4ed8;padding:32px 40px;">
            <h1 style="font-family:Arial,sans-serif;font-size:24px;color:#ffffff;margin:0;">
              ${escapeHtml(data.summitName)}
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="font-family:Arial,sans-serif;font-size:16px;color:#111827;margin:0 0 8px;">
                    Hi ${escapeHtml(data.customerName)},
                  </p>
                  <p style="font-family:Arial,sans-serif;font-size:16px;color:#374151;margin:0 0 24px;">
                    Thank you for your purchase! Your order has been confirmed.
                  </p>
                  <!-- Order details box -->
                  <table width="100%" cellpadding="0" cellspacing="0"
                         style="background:#f3f4f6;border-radius:6px;padding:16px;margin-bottom:24px;">
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;padding-bottom:4px;">
                        ORDER NUMBER
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:16px;font-weight:bold;
                                 color:#111827;padding-bottom:16px;">
                        ${escapeHtml(data.orderNumber)}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;padding-bottom:4px;">
                        TOTAL CHARGED
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#111827;">
                        ${escapeHtml(data.amountTotal)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${downloadSection}
              <tr>
                <td style="padding-top:32px;border-top:1px solid #e5e7eb;margin-top:32px;">
                  <p style="font-family:Arial,sans-serif;font-size:13px;color:#9ca3af;margin:0;">
                    If you have any questions, reply to this email and we'll be happy to help.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildOrderConfirmationText(data: Omit<TemplateData, 'items'>): string {
  const downloads =
    data.downloadLinks.length > 0
      ? `\n\nYOUR DOWNLOADS:\n${data.downloadLinks.map((l) => `- ${l.label}: ${l.url}`).join('\n')}\n\nDownload links expire in 24 hours.`
      : ''

  return `Hi ${data.customerName},

Thank you for your purchase! Your order has been confirmed.

Order Number: ${data.orderNumber}
Total Charged: ${data.amountTotal}
${downloads}

If you have any questions, reply to this email and we'll be happy to help.

${data.summitName}`
}

/** Escape HTML special characters to prevent injection in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
