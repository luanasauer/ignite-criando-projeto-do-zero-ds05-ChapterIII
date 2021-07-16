import Document, { Html, Main, Head, NextScript } from 'next/document';


// import { createResolver } from "next-slicezone/resolver";

// import { apiEndpoint } from "./../prismic-configuration"; // import the endpoint name from where it's defined
// const prismicRepoName = /([a-zA-Z0-9-]+)?(\.cdn)?\.prismic\.io/.exec(apiEndpoint)[1] //Regex to get repo ID


export default class MyDocument extends Document {
  // static async getInitialProps(ctx) {
  //   const initialProps = await Document.getInitialProps(ctx);
  //   await createResolver();
  //   return { ...initialProps };
  // }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

        </Head>

        <body>
          <Main />
          <NextScript />
          <script async defer src="https://static.cdn.prismic.io/prismic.js?new=true&repo=spacetravelingds" />
        </body>
      </Html>
    )
  }
}
