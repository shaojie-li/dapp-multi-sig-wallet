import { PageProps } from ".next/types/app/api/jsonp/route";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react"

export default function App({
  Component,
  pageProps: { session, ...pageProps },
} : { Component: JSX.ElementType; pageProps: PageProps & {session: Session}}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}