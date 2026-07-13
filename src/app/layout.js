import { AuthProvider } from "../context/AuthContext";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Walletly",
  description: "Your personal finance companion",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
