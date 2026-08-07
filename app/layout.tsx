import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "dmytro klochko — art & technology",
    description:
      "dmytro klochko — jaywalker at the intersection of art and technology. tech entrepreneur & tinkerer.",
    openGraph: {
      title: "dmytro klochko — art & technology",
      description: "jaywalker at the intersection of art and technology.",
      type: "website",
      url: "/",
      images: [
        {
          url: "/og.png",
          width: 1731,
          height: 909,
          alt: "dmytro klochko — jaywalker at the intersection of art and technology.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "dmytro klochko — art & technology",
      description: "jaywalker at the intersection of art and technology.",
      images: ["/og.png"],
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f6f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
