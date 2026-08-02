import type { Response } from "express";
import { env } from "../config/env";
import { expiresInToMs } from "./jwt";

const isProd = env.NODE_ENV === "production";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: expiresInToMs(env.JWT_ACCESS_EXPIRES_IN),
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: expiresInToMs(env.JWT_REFRESH_EXPIRES_IN),
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}
