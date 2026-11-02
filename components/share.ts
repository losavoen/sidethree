"use client";

/** Opens the phone's share sheet, or copies the link where sharing isn't available. Returns what happened. */
export async function shareLink(title: string, text: string): Promise<"shared" | "copied" | "cancelled"> {
  const url = window.location.origin;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return "copied";
  } catch {
    return "cancelled";
  }
}
