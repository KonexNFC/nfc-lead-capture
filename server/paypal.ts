import crypto from "crypto";

const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const BASE_URL =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const SKU_CATALOG: Record<
  string,
  {
    name: string;
    amount: string;
    currency: string;
    productType: "physical_card" | "digital";
    tier: "basic" | "premium" | "elite" | null;
  }
> = {
  "KONEX-BASIC": {
    name: "KONEX Basic NFC Card",
    amount: "19.99",
    currency: "GBP",
    productType: "physical_card",
    tier: "basic",
  },
  "KONEX-PREMIUM": {
    name: "KONEX Premium NFC Card",
    amount: "49.99",
    currency: "GBP",
    productType: "physical_card",
    tier: "premium",
  },
  "KONEX-ELITE": {
    name: "KONEX Elite NFC Card",
    amount: "79.99",
    currency: "GBP",
    productType: "physical_card",
    tier: "elite",
  },
  "KONEX-DIGITAL": {
    name: "KONEX Digital Profile",
    amount: "9.99",
    currency: "GBP",
    productType: "digital",
    tier: null,
  },
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export async function createPayPalOrder(
  sku: string,
  returnUrl: string,
  cancelUrl: string,
): Promise<{ orderId: string; approveUrl: string }> {
  const item = SKU_CATALOG[sku];
  if (!item) throw new Error(`Unknown SKU: ${sku}`);

  const accessToken = await getAccessToken();
  const requestId = crypto.randomUUID();

  const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": requestId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: sku,
          description: item.name,
          amount: {
            currency_code: item.currency,
            value: item.amount,
          },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "KONEX NFC",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        shipping_preference: item.productType === "digital" ? "NO_SHIPPING" : "GET_FROM_FILE",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal create order failed: ${error}`);
  }

  const data = (await response.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };

  const approveLink = data.links.find((l) => l.rel === "approve");
  if (!approveLink) throw new Error("No approve URL in PayPal response");

  return { orderId: data.id, approveUrl: approveLink.href };
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  captureId: string;
  status: string;
  email?: string;
  name?: string;
}> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `capture-${paypalOrderId}`,
      },
    },
  );

  const data = (await response.json()) as any;
  if (!response.ok) {
    throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`);
  }
  if (data.status !== "COMPLETED") {
    throw new Error(`Unexpected capture status: ${data.status}`);
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  const payer = data.payer;

  return {
    captureId: capture?.id || "",
    status: data.status,
    email: payer?.email_address,
    name: payer?.name
      ? `${payer.name.given_name} ${payer.name.surname}`.trim()
      : undefined,
  };
}

export async function verifyWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  rawBody: string,
  webhookId: string,
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `${BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody),
        }),
      },
    );

    const data = (await response.json()) as { verification_status: string };
    return data.verification_status === "SUCCESS";
  } catch (err) {
    console.error("[paypal] webhook verification error:", err);
    return false;
  }
}

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function getPayPalClientId(): string | undefined {
  return process.env.PAYPAL_CLIENT_ID;
}
