import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle, BarChart3, Car, Check, ChevronRight, CircleDollarSign, Clock3, GraduationCap,
  MapPin, Moon, Navigation, QrCode, Search, ShieldCheck, Star, Sun, Users, WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEY, type UniCaronaState } from "@/lib/unicarona-data";

const glass = "glass-card rounded-3xl";

function useLandingTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const theme = saved ? (JSON.parse(saved) as Partial<UniCaronaState>).theme : undefined;
      const isDark = theme === "dark";
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch {
      // localStorage indisponível: mantém o tema claro padrão.
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const state = saved ? (JSON.parse(saved) as Partial<UniCaronaState>) : {};
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, theme: next ? "dark" : "light" }));
    } catch {
      // localStorage indisponível: preferência não é persistida.
    }
  };

  return { dark, toggle };
}

const passengerSteps = [
  { icon: GraduationCap, title: "Cadastre-se com e-mail acadêmico", text: "Confirmamos seu vínculo com a universidade pelo domínio .edu.br antes de liberar o acesso." },
  { icon: Search, title: "Busque seu trajeto", text: "Informe origem, destino e horário. Sugerimos campi e estações próximas automaticamente." },
  { icon: QrCode, title: "Solicite a vaga e pague pelo Pix", text: "O motorista aprova o pedido e você paga o valor fixo com QR Code na hora." },
  { icon: Navigation, title: "Acompanhe em tempo real", text: "Veja o motorista se aproximando no mapa, com botão de SOS sempre visível." },
];

const driverSteps = [
  { icon: ShieldCheck, title: "Verifique seu e-mail acadêmico", text: "Cadastro único: a mesma conta funciona como motorista e passageira." },
  { icon: WalletCards, title: "Configure sua carteira Pix", text: "Antes de publicar uma carona, você cadastra a chave que vai receber os pagamentos." },
  { icon: Car, title: "Publique sua carona", text: "Defina origem, destino, horário, vagas e dados do veículo. O preço já vem tabelado." },
  { icon: Users, title: "Aprove passageiros e receba", text: "Veja o perfil e a nota de quem solicitou, aprove com um toque e receba pelo Pix." },
];

const features = [
  { icon: GraduationCap, title: "Verificação acadêmica", text: "Só entra quem tem e-mail institucional válido — de PUC Minas, UFMG, CEFET-MG e outras." },
  { icon: CircleDollarSign, title: "Preço fixo e transparente", text: "Tarifa municipal + taxa de conveniência, sempre exibidas antes da confirmação. Sem tarifa dinâmica." },
  { icon: Star, title: "Avaliações em duas vias", text: "Motoristas e passageiras se avaliam após cada corrida, construindo um histórico de confiança." },
  { icon: Navigation, title: "Rastreamento ao vivo", text: "Mapa com o trajeto, posição do carro e status da viagem em tempo real, com botão de SOS." },
  { icon: QrCode, title: "Pagamento pelo Pix", text: "QR Code gerado na aprovação da vaga, sem precisar sair do app ou lidar com dinheiro." },
  { icon: BarChart3, title: "Painel de economia", text: "Dashboards mostram caronas realizadas, nota média e quanto você economizou no mês." },
];

function Step({ icon: Icon, title, text, index }: { icon: typeof Car; title: string; text: string; index: number }) {
  return (
    <div className={`${glass} relative p-5`}>
      <span className="absolute -top-3 -left-3 grid size-8 place-items-center rounded-full bg-primary-gradient text-xs font-extrabold text-primary-foreground shadow-primary">
        {index}
      </span>
      <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

export function LandingPage() {
  const { dark, toggle } = useLandingTheme();
  const [audience, setAudience] = useState<"passageira" | "motorista">("passageira");
  const steps = audience === "passageira" ? passengerSteps : driverSteps;

  return (
    <div className="bg-app min-h-screen text-foreground">
      <header className="glass-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <a href="#topo" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-primary">
              <Car className="size-4.5" />
            </span>
            UniCarona
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#como-funciona" className="transition-colors hover:text-foreground">Como funciona</a>
            <a href="#recursos" className="transition-colors hover:text-foreground">Recursos</a>
            <a href="#preco" className="transition-colors hover:text-foreground">Preço</a>
            <a href="#seguranca" className="transition-colors hover:text-foreground">Segurança</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggle} aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}>
              {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link to="/app">Entrar</Link>
            </Button>
            <Button asChild className="rounded-full bg-primary-gradient shadow-primary">
              <Link to="/app">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="topo">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10 lg:pt-24">
          <div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight lg:text-5xl">
              Caronas entre estudantes, com preço justo e trajeto seguro.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              O UniCarona conecta quem estuda nos campi de Belo Horizonte para dividir o trajeto de casa até a
              faculdade. Tarifa fixa e tabelada, e-mail institucional verificado e rastreamento em tempo real,
              sem surpresas no preço nem no caminho.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-primary-gradient px-6 shadow-primary">
                <Link to="/app">
                  Criar conta grátis <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6">
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>Já disponível para</span>
              {["PUC Minas", "UFMG", "CEFET-MG"].map((uni) => (
                <span key={uni} className="rounded-full border border-border/70 bg-background/60 px-3 py-1">{uni}</span>
              ))}
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0">
            <div className={`${glass} mx-auto max-w-sm p-4`}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-primary/15 font-bold text-primary">BA</span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-sm">Bruno Andrade</b>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3 fill-warning text-warning" /> 4.9 · Chevrolet Onix branco
                  </p>
                </div>
                <Badge className="rounded-full border-0 bg-success-soft px-3 py-1 text-[11px] text-success shadow-none">Aprovada</Badge>
              </div>
              <div className="route-line my-5 space-y-4 pl-7">
                <div>
                  <span className="text-[11px] text-muted-foreground">Origem</span>
                  <p className="text-sm font-semibold">Estação Gameleira</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Destino</span>
                  <p className="text-sm font-semibold">PUC Minas · Coração Eucarístico</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock3 className="size-3.5" /> 07:20</span>
                <span className="flex items-center gap-1"><Users className="size-3.5" /> 2 vagas</span>
                <b className="ml-auto text-base text-foreground">R$ 6,00</b>
              </div>
            </div>
            <div className={`${glass} absolute -bottom-6 -left-4 hidden items-center gap-2 px-4 py-3 sm:flex`}>
              <ShieldCheck className="size-4 text-success" />
              <span className="text-xs font-semibold">E-mail acadêmico verificado</span>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">Como funciona</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Uma única conta serve para os dois papéis. Escolha um dos lados para ver o passo a passo.
              </p>
            </div>
            <div className="glass-card flex gap-1 rounded-full p-1">
              <Button
                variant={audience === "passageira" ? "default" : "ghost"}
                className={`rounded-full px-4 ${audience === "passageira" ? "bg-primary-gradient text-primary-foreground shadow-primary" : ""}`}
                onClick={() => setAudience("passageira")}
              >
                Sou passageira
              </Button>
              <Button
                variant={audience === "motorista" ? "default" : "ghost"}
                className={`rounded-full px-4 ${audience === "motorista" ? "bg-primary-gradient text-primary-foreground shadow-primary" : ""}`}
                onClick={() => setAudience("motorista")}
              >
                Sou motorista
              </Button>
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Step key={step.title} {...step} index={index + 1} />
            ))}
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 lg:px-10">
          <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">Tudo o que uma carona universitária precisa</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Recursos pensados para dar confiança a quem oferece e a quem pega carona todo dia.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className={`${glass} p-5`}>
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preço */}
        <section id="preco" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 lg:px-10">
          <div className="hero-card overflow-hidden rounded-3xl px-6 py-10 text-white shadow-primary lg:px-14 lg:py-14">
            <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
              <div>
                <Badge className="rounded-full border-0 bg-white/15 px-3 py-1 text-white">Tarifa municipal tabelada</Badge>
                <h2 className="mt-5 text-2xl font-extrabold leading-tight lg:text-3xl">Preço fixo, sem surpresa e sem tarifa dinâmica.</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
                  O valor da carona segue a tarifa de transporte vigente no município. O motorista não escolhe o
                  preço, ele já vem definido e trava no anúncio, para todos os passageiros.
                </p>
              </div>
              <div className="mt-8 rounded-3xl bg-white/10 p-6 backdrop-blur lg:mt-0">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Preço fixo da carona</span>
                  <span>R$ 5,25</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-white/80">
                  <span>Taxa de conveniência</span>
                  <span>R$ 0,75</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4 text-base font-extrabold">
                  <span>Total pago pela passageira</span>
                  <span>R$ 6,00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Segurança */}
        <section id="seguranca" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 lg:px-10">
          <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">Segurança em cada etapa da viagem</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Da verificação de quem entra até o acompanhamento em tempo real, o UniCarona foi construído para
                reduzir incerteza — tanto de quem dirige quanto de quem pega a carona.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: GraduationCap, text: "Acesso restrito a quem tem e-mail institucional .edu.br verificado." },
                  { icon: Star, text: "Nota e histórico de avaliações visíveis antes de aprovar ou solicitar uma vaga." },
                  { icon: Navigation, text: "Mapa em tempo real com o trajeto e a posição do veículo durante a corrida." },
                  { icon: AlertTriangle, text: "Botão de SOS sempre acessível durante o acompanhamento da viagem." },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                      <item.icon className="size-4" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/90">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${glass} mt-10 p-6 lg:mt-0`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4 text-primary" /> Acompanhamento ao vivo
              </div>
              <div className="bg-map mt-4 h-40 rounded-2xl" />
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-background/60 px-4 py-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Motorista a caminho</span>
                <span className="text-muted-foreground">Faltam 8 min</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-10">
          <div className="hero-card flex flex-col items-center gap-5 rounded-3xl px-6 py-14 text-center text-white shadow-primary">
            <h2 className="max-w-lg text-2xl font-extrabold leading-tight lg:text-3xl">Pronto para dividir sua próxima carona?</h2>
            <p className="max-w-md text-sm text-white/80">
              Cadastre-se com seu e-mail acadêmico e comece a buscar ou oferecer caronas em poucos minutos.
            </p>
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-7 text-primary shadow-none hover:bg-white/90">
              <Link to="/app">
                Criar conta grátis <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-5 pt-14 pb-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <a href="#topo" className="flex items-center gap-2 font-extrabold tracking-tight">
                <span className="grid size-9 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-primary">
                  <Car className="size-4.5" />
                </span>
                UniCarona
              </a>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Caronas entre estudantes de Belo Horizonte, com preço tabelado e e-mail acadêmico verificado.
                Feito para a comunidade universitária.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Navegação</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#como-funciona" className="text-foreground/80 transition-colors hover:text-primary">Como funciona</a></li>
                <li><a href="#recursos" className="text-foreground/80 transition-colors hover:text-primary">Recursos</a></li>
                <li><a href="#preco" className="text-foreground/80 transition-colors hover:text-primary">Preço</a></li>
                <li><a href="#seguranca" className="text-foreground/80 transition-colors hover:text-primary">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Confiança</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
                <li className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-primary" /> E-mail acadêmico verificado</li>
                <li className="flex items-center gap-2"><Star className="size-3.5 text-primary" /> Avaliações após cada corrida</li>
                <li className="flex items-center gap-2"><Navigation className="size-3.5 text-primary" /> Rastreamento em tempo real</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <span>© 2026 UniCarona · Protótipo acadêmico de mobilidade universitária.</span>
            <span>Belo Horizonte, MG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
