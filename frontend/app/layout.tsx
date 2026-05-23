import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinFlow — AI-Powered Accounting for Small Businesses",
    template: "%s | FinFlow",
  },
  description:
    "India's simplest accounting platform. Create GST invoices, track inventory, and manage finances with AI — no accounting knowledge needed.",
  keywords: ["accounting", "GST", "invoicing", "inventory", "tally alternative", "small business"],
  authors: [{ name: "FinFlow" }],
  creator: "FinFlow",
  metadataBase: new URL("https://finflow.app"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://finflow.app",
    title: "FinFlow — AI-Powered Accounting",
    description: "Smarter, simpler accounting for Indian small businesses",
    siteName: "FinFlow",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366F1" },
    { media: "(prefers-color-scheme: dark)", color: "#4338CA" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
