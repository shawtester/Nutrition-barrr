import AuthContextProvider from "@/context/AuthContext"; // Adjust the import path as needed
import "./globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "NUTRIBOX",
  description: "Generated by create next app",
};

// WhatsApp Floating Button Component
// WhatsApp Floating Button Component
function WhatsAppButton() {
  const predefinedText = encodeURIComponent(
    "Hello, I am interested in buying whey protein supplements. Can you provide more details?"
  );

  return (
    <a
      href={`https://wa.me/917428794189?text=${predefinedText}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition duration-300 z-50"
      title="Chat with us on WhatsApp"
    >
      <img
        src="/whatsapp.png" // Add this image to your public folder
        alt="WhatsApp"
        className="w-10 h-10"
      />
    </a>
  );
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NextUIProvider>
          <Toaster />
          <AuthContextProvider>
            {children}
          </AuthContextProvider>
          {/* Add the WhatsApp button */}
          <WhatsAppButton />
        </NextUIProvider>
      </body>
    </html>
  );
}
