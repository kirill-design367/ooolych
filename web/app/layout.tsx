import type { Metadata } from "next";
import { SupplyRoot } from "../components/Supply";
import "./style.css";
export const metadata: Metadata = {
  title: { default: "Луч — стройматериалы на объект", template: "%s · Луч" },
  description:
    "Комплектация объектов в Москве и области. Листовые материалы, изоляция, кабель и электромонтаж.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href={new URL(
            "../type/onest-cyrillic.woff2",
            import.meta.url,
          ).toString()}
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href={new URL(
            "../type/unbounded-cyrillic.woff2",
            import.meta.url,
          ).toString()}
        />
      </head>
      <body>
        <SupplyRoot>{children}</SupplyRoot>
      </body>
    </html>
  );
}
