import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import IconReadyScript from "@/components/IconReadyScript";
import "./../globals.css";

export const metadata: Metadata = {
  title: "AutoMaint - Car Historial",
  description: "TFG Car Historial Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="icons-loading" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=block"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  document.documentElement.classList.toggle('dark', window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                } catch (e) {
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased select-none">
        <AuthProvider>
          <IconReadyScript />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
