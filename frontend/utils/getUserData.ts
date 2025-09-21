"use client";

export function getUserData() {
  if (localStorage.getItem("userData"))
    return JSON.parse(localStorage.getItem("userData"))
  return null
}
