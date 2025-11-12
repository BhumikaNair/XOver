import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>XOver</title>

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="XOver" />
        <meta
          property="og:description"
          content="The Ultimate Tic-Tac-Toe Game"
        />
        <meta
          property="og:image"
          content="https://xover-game.vercel.app/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xover-game.vercel.app/" />
        <meta property="og:site_name" content="XOver" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="XOver" />
        <meta
          name="twitter:description"
          content="The Ultimate Tic-Tac-Toe Game"
        />
        <meta
          name="twitter:image"
          content="https://xover-game.vercel.app/og-image.png"
        />
        <meta name="twitter:image:alt" content="XOver" />

        {/* General Meta Tags */}
        <meta name="description" content="The Ultimate Tic-Tac-Toe Game" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
