import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <>
      <Head>
      <title>Columbia Community Connection</title>
      <link rel="icon" href="/favicon.png" />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>

      <main>{children}</main>
    </>
  )
}
