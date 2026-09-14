import "./globals.css";
import Nav from "./components/Nav";
import GearMenu from "./components/GearMenu";

export const metadata = {
  title: "Ranking",
  description: "Rangliste"
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        {children}
        <GearMenu />
      </body>
    </html>
  );
}
