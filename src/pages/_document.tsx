import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>XOver</title>

        {/* Open Graph Meta Tags */}
        <meta
          property="og:title"
          content="XOver - The Ultimate Tic-Tac-Toe Game"
        />
        <meta
          property="og:description"
          content="Experience the ultimate Tic-Tac-Toe game with multiplayer support and stunning visuals."
        />
        <meta
          property="og:image"
          content="https://xover-game.vercel.app/og-image.png"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xover-game.vercel.app/" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="XOver - The Ultimate Tic-Tac-Toe Game"
        />
        <meta
          name="twitter:description"
          content="Experience the ultimate Tic-Tac-Toe game with multiplayer support and stunning visuals."
        />
        <meta
          name="twitter:image"
          content="https://xover-game.vercel.app/og-image.png"
        />

        {/* General Meta Tags */}
        <meta
          name="description"
          content="Experience the ultimate Tic-Tac-Toe game with multiplayer support and stunning visuals."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
