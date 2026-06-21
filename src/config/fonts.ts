import { Red_Hat_Display } from "next/font/google"

/** Loader + body class loads files. Set the same family name literally in globals.css --app-font (not var(--font-*) on :root). */
export const appFont = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
