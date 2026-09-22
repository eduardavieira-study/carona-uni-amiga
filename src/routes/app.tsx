import { createFileRoute } from "@tanstack/react-router";
import { UniCaronaApp } from "@/components/unicarona-app";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "UniCarona — Entrar" },
      { name: "description", content: "Entre ou cadastre-se com seu e-mail acadêmico para buscar e oferecer caronas em Belo Horizonte." },
      { property: "og:title", content: "UniCarona — Entrar" },
      { property: "og:description", content: "Entre ou cadastre-se com seu e-mail acadêmico para buscar e oferecer caronas em Belo Horizonte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UniCaronaApp,
});
