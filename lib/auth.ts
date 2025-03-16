import { hash, compare } from "bcryptjs"
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "@prisma/client"

// Secret key for JWT
const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

// Token expiration (24 hours)
const tokenExpiration = "24h"

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Create JWT token
export async function createToken(user: { id: string; email: string }): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(tokenExpiration)
    .sign(key)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<{ id: string; email: string }> {
  const { payload } = await jwtVerify(token, key)
  return payload as { id: string; email: string }
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  (await cookies()).set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })
}

// Get auth cookie
export async function getAuthCookie(): Promise<string | undefined> {
  return (await cookies()).get("auth-token")?.value
}

// Remove auth cookie
export async function removeAuthCookie(): Promise<void> {
  (await cookies()).delete("auth-token")
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthCookie()
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    return await prisma.user.findUnique({
      where: { id: payload.id },
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

