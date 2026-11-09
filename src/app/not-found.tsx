import type { Metadata } from "next";
import { Button, ButtonRow, Container } from "@/components/v2/ui";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="bg-river-950 text-white">
      <Container className="flex min-h-[70svh] flex-col justify-center py-24 md:py-32">
        <p className="text-sm font-semibold text-white/50">Error 404</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight md:text-8xl">
          This page wandered <em className="text-brand-300">off.</em>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">
          The link may be old, or the page may have moved. Here are the places most people are looking for.
        </p>
        <ButtonRow className="mt-10">
          <Button href="/" tone="dark">
            Back to home
          </Button>
          <Button href="/visit/what-to-expect" tone="dark" variant="outline">
            Plan a visit
          </Button>
          <Button href="/watch" tone="dark" variant="outline">
            Watch a message
          </Button>
        </ButtonRow>
      </Container>
    </section>
  );
}
