/**
 * THE IMPORTS
 * Why: To bring in the tools needed for Auth, SEO, Fonts, and UI.
 */
import { ClerkProvider } from "@clerk/nextjs" // WHY: Wraps the app to provide User Auth context (Login/Session).
import type { Metadata, Viewport } from "next" // WHY: TypeScript types to ensure SEO and Viewport settings are valid.
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google" // WHY: Optimized Google Fonts that load locally (no layout shift).
import { Toaster } from "@/components/ui/sonner" // WHY: A component to show "Success/Error" popup notifications.
import { SanityLive } from "@/sanity/lib/live" // WHY: Enables real-time content updates from Sanity CMS without refreshing.
import "./globals.css" // WHY: The global stylesheet (Tailwind) that applies to every page.

/**
 * FONT CONFIGURATIONS
 * Why: We define these as CSS Variables so we can use them in Tailwind/CSS.
 */

// Body font: Inter (highly readable for long text)
// INTER: This is a "Variable Font" (One file handles all weights)

const inter = Inter({
  variable: "--font-inter", // Creates a CSS variable: var(--font-inter)
  subsets: ["latin"], // Only download English/Western characters (saves 90% file size)
  display: "swap", // FONT DISPLAY OPTIONS EXPLAINED BELOW
})

// Heading font: Plus Jakarta Sans (Modern and geometric)
// PLUS JAKARTA: We choose specific weights to keep the file light

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"], // Only download Latin characters
  display: "swap",
  // WHY: We only want these 4 thicknesses.
  // If we didn't add this, we might download weights we never use, wasting bandwidth.
  weight: ["500", "600", "700", "800"],
})

// Code font: Geist Mono
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

/**
 * 💡 DEEP DIVE: font-display (The "display" option)
 * 1. swap (Your choice): Shows system font (Arial) instantly. Swaps to fancy font whenever it finishes downloading.
 *    - Use when: Content readability is top priority.
 * 2. block: Hides text for up to 3s. If font isn't ready, shows system font. Swaps eventually.
 *    - Use when: Seeing the "wrong" font ruins the brand (e.g., a stylized Logo).
 * 3. fallback: Hides text for 100ms. If font isn't ready, shows system font. Only swaps if fancy font arrives within 3s.
 *    - Use when: You want a pretty font but don't want to annoy the user with "jumping text" 10 seconds later.
 * 4. optional: Hides text for 100ms. If not ready, shows system font and GIVES UP. No swapping later.
 *    - Use when: You want the best performance and zero layout shift.
 */

/**
 * METADATA (SEO)
 * Why: This tells Google and Social Media what your site is.
 */
export const metadata: Metadata = {
  title: {
    default: "Nestwell | Find Your Perfect Home", // Title for the Home Page
    template: "%s | Nestwell", // If you go to /about, the tab says "About | Nestwell"
  },
  description: "Making your first home journey simple...", // Shown in search results
  keywords: ["real estate", "homes"], // Help search engines categorize the site
  authors: [{ name: "Nestwell" }],
  creator: "Nestwell",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),

  // OpenGraph: How the site looks on Facebook/LinkedIn/WhatsApp
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Nestwell",
    title: "Nestwell | Find Your Perfect Home",
    description: "Making your first home journey simple...",
  },

  // Twitter: X.com has its own specific format for "Cards"
  twitter: {
    card: "summary_large_image", // Shows a big image preview on Twitter
    title: "Nestwell | Find Your Perfect Home",
    description: "Making your first home journey simple...",
  },

  robots: {
    index: true, // Tell Google: "Yes, list this site in search results"
    follow: true, // Tell Google: "Yes, follow the links on this site"
  },
}

/**
 * VIEWPORT
 * Why: Configures how the site looks on mobile device browsers.
 */
export const viewport: Viewport = {
  themeColor: [
    // Changes the browser's address bar color to match your theme
    { media: "(prefers-color-scheme: light)", color: "#FBF9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#2D2824" },
  ],
  width: "device-width", // Ensures the site is as wide as the phone screen
  initialScale: 1, // Prevents the browser from "zooming out" on load
}

/**
 * THE ROOT LAYOUT COMPONENT
 * Why: This is the actual HTML wrapper for your entire application.
 */
export default function RootLayout({
  children, // This is a placeholder for the page content (e.g., Home page)
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      {" "}
      {/* Wraps the app so useAuth() and <UserButton /> work anywhere */}
      <html lang="en" suppressHydrationWarning>
        {/* lang="en": Important for Screen Readers and SEO. */}
        {/* suppressHydrationWarning: Stops errors when browser extensions (like Grammarly/DarkReader) change the code. */}

        <head>
          {/* Preconnect: Tells the browser to "start the connection" to these servers 
              immediately before even asking for data. Saves 100-300ms. */}
          <link rel="preconnect" href="https://cdn.sanity.io" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>

        <body
          className={`
            ${inter.variable} 
            ${plusJakarta.variable} 
            ${geistMono.variable} 
            font-body antialiased
          `}
          /* ^ WHY: We inject the font variables and use "font-body" (defined in Tailwind) 
               to apply the font. antialiased makes text look smoother on Mac/PC. */
        >
          {/* SKIP LINK: 
              Accessibility feature. If a user presses 'Tab', this button appears.
              Pressing 'Enter' skips the Menu and goes to the main content. */}
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          {children} {/* YOUR PAGE CONTENT GOES HERE */}
          <Toaster />{" "}
          {/* Global component that stays "listening" for popup alerts */}
          <SanityLive />{" "}
          {/* Global component that listens for CMS content changes */}
        </body>
      </html>
    </ClerkProvider>
  )
}
