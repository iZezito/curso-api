import { db } from "@/lib/db";
import { WebHook } from "./model";
import { payments, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export abstract class PaymentService {
  static async createPayment(valor: number, userId: string) {
    const checkout = await this.createCheckout(valor);
    const response = await checkout.json();

    await db.insert(payments).values({
      amount: valor,
      userId: userId,
      externalId: response.data.id,
      status: response.data.status,
      paidAt: new Date(),
      pixQrCode: response.data.brCodeBase64,
      pixText: response.data.brCode,
    });
  }

  static async updatePayment(body: WebHook) {
    const [payment] = await db
      .update(payments)
      .set({
        status: body.data.transparent.status,
        paidAt: new Date(),
      })
      .where(eq(payments.externalId, body.data.transparent.id))
      .returning();

    await db
      .update(users)
      .set({ plan: "PREMIUM" })
      .where(eq(users.id, payment.userId));
  }

  static async createCheckout(amount: number) {
    return await fetch("https://api.abacatepay.com/v2/transparents/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Bun.env.ABACATE_PAY_TOKEN}`,
      },
      body: JSON.stringify({
        method: "PIX",
        data: {
          amount: amount,
          expiresIn: 3600,
          description: "1 mês de plano preemium",
        },
      }),
    });
  }

  static async getPayments(userId: string) {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
}
