"use server";

import { prisma } from "@/utils/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAction(_, formData) {
  const cookiesStore = cookies(); // Tidak perlu pakai 'await' di sini

  const name = formData.get("name");
  const email = formData.get("email"); // Perbaiki typo "emai"
  const password = formData.get("password");

  if (!email || !password) {
    return {
      status: "error",
      message: "All fields are required",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      status: "error",
      message: "User not found!",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return {
      status: "error",
      message: "Invalid Credentials!",
    };
  }

  const newSession = await prisma.session.create({
    data: {
      userId: user.id,
    },
  });

  cookiesStore.set("sessionId", newSession.id, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/");
}
