import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Provider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalVideoPlayer from "@/components/GlobalVideoPlayer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
export const metadata = {
  title: "Aurahub",
  description: "A modern video streaming platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Provider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              theme="light"
            />
            <Navbar />
            <div className="flex-grow">{children}</div>
            <Footer />
            <GlobalVideoPlayer />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
