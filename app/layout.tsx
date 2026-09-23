import type { Metadata, Viewport } from "next";
import { Poppins, Righteous } from "next/font/google";
import { AppNav } from "@/components/layout/app-nav";
import { StorageNotice } from "@/components/layout/storage-notice";
import { StoreHydrationProvider } from "@/components/providers/store-hydration-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Krisband",
  description: "Band song queue and practice tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Krisband",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#100c0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${righteous.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <StoreHydrationProvider>
          <main
            className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col overflow-x-clip px-4 pt-[max(1.5rem,var(--safe-top))]"
            style={{
              paddingBottom: "calc(4.5rem + var(--safe-bottom))",
            }}
          >
            {children}
            <StorageNotice />
          </main>
          <AppNav />
        </StoreHydrationProvider>
      </body>
    </html>
  );
}
