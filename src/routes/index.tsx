import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniCarona — Caronas universitárias em BH" },
      { name: "description", content: "Compartilhe trajetos seguros entre sua casa e universidades de Belo Horizonte, com preço fixo tabelado e e-mail acadêmico verificado." },
      { property: "og:title", content: "UniCarona — Caronas universitárias em BH" },
      { property: "og:description", content: "Encontre e ofereça caronas seguras para os campi de Belo Horizonte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
