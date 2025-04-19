import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "VJUTest - Hệ thống thi trắc nghiệm",
    template: "%s | VJUTest"
  },
  description: "Hệ thống thi trắc nghiệm trực tuyến chất lượng cao",
  keywords: ["thi trắc nghiệm", "giáo dục", "học tập", "kiểm tra"],
  authors: [{ name: "VJUTest Team" }],
}; 