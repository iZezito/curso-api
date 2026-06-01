import { users } from "@/drizzle/schema";
import { CreateUser, UpdateUser, User } from "./model";
import VerifyEmail from "@/emails/verify-email";
import { db } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { NotFoundError } from "@/errors";
import { password, randomUUIDv7 } from "bun";
import { renderToStaticMarkup } from "react-dom/server";
import { redis } from "@/lib/redis";
import { sendEmail } from "@/lib/mail";
import { renderVerifyEmail } from "@/emails/render";

export abstract class Service {
  static async createUser(user: CreateUser) {
    const hash = await password.hash(user.password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          ...user,
          emailVerified: false,
          password: hash,
        })
        .returning();

      const token = await this.createVerificationToken(newUser.id);
      console.log("token verificação", token);
      const html = renderVerifyEmail(
        `http://localhost:3000/api/v1/users/email-verification?token=${token}`,
      );

      sendEmail(newUser.email, "Verify your email", html);

      return newUser;
    } catch (error: any) {
      if (error?.cause?.errno === "23505") {
        return null;
      }
      throw error;
    }
  }

  static async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  static async createVerificationToken(userId: string) {
    const verificationToken = randomUUIDv7();

    await redis.setex(`verification-token:${verificationToken}`, 3600, userId);

    return verificationToken;
  }

  static async createPasswordResetToken(userId: string) {
    const resetToken = randomUUIDv7();
    console.log("reset token", resetToken);

    await redis.setex(`password-reset-token:${resetToken}`, 3600, userId);

    return resetToken;
  }

  static async findAll() {
    return await db.select().from(users);
  }

  static async findById(id: string) {
    const cachedUser = await redis.get(`user:${id}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      throw new NotFoundError("Usuário não encontrado!");
    }

    await redis.setex(`user:${id}`, 60 * 15, JSON.stringify(user));
    return user;
  }

  static async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await password.hash(newPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, userId));
  }

  static async updateEmailVerified(userId: string) {
    await db
      .update(users)
      .set({
        emailVerified: true,
      })
      .where(eq(users.id, userId));
  }

  static async update(user: UpdateUser, id: string) {
    const [updatedUser] = await db
      .update(users)
      .set({
        name: user.name,
        twoFactorAuthenticationEnabled: user.twoFactorAuthenticationEnabled,
      })
      .where(eq(users.id, id))
      .returning();
    if (!updatedUser) {
      throw new NotFoundError("Usuário não encontrado!");
    }
    return updatedUser;
  }

  static async delete(id: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) {
      throw new NotFoundError("Usuário não encontrado!");
    }
  }

  static async deleteMany(query: { id: string }[]) {
    const ids = query.map((q) => q.id);
    const [deletedUser] = await db
      .delete(users)
      .where(inArray(users.id, ids))
      .returning();

    if (!deletedUser) {
      throw new NotFoundError("Usuário não encontrado!");
    }
  }
}
