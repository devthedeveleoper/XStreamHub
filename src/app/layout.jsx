import { Inter } from "next/font/google";
import "./globals.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Provider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Aurahub",
  description: "A modern video streaming platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} flex flex-col h-full bg-gray-50`}>
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
        </Provider>
      </body>
    </html>
  );
}
