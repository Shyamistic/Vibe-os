import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIBE_OS - Developer Flow State OS",
  description: "AI-powered flow state. 8 presets, binaural audio, focus tracking.",
  metadataBase: new URL('https://vibe-os.app'),
  openGraph: {
    title: 'VIBE_OS',
    description: 'Control your flow state. Control your outcomes.',
    url: 'https://vibe-os.app',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
