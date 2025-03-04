// app/main/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/core/Navbar"; // Verify this path exists
import Footer from "@/components/core/Footer"; // Verify this path exists
import { PaymentProvider } from "@/context/PaymentContext";
import Script from "next/script";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export default function MainLayout({ children }) {
  return (
    <div className="bg-background">
      <AuthProvider>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <PaymentProvider>
            <main className="flex-1 pt-16">{children}</main>
          </PaymentProvider>
          <Footer />
        </div>
      </AuthProvider>

      <div id="google_translate_element" className="hidden" />
      
      <Script src="/assets/lang-config.js" strategy="beforeInteractive" />
      <Script src="/assets/translation.js" strategy="beforeInteractive" />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=TranslateInit"
        strategy="afterInteractive"
      />
      <Script src="https://cdn.lordicon.com/lordicon.js" />
    </div>
  );
}