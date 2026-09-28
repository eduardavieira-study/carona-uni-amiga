import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle, ArrowDownToLine, BarChart3, Bell, CalendarDays, Camera, Car, Check, CheckCheck,
  ChevronRight, CircleDollarSign, CircleHelp, Clock3, Copy, Download, Eye, EyeOff, GraduationCap,
  Home, Hourglass, IdCard, KeyRound, Landmark, LoaderCircle, LogOut, Mail, MapPin, Moon, Navigation, Pencil, Phone, Plus, QrCode,
  ReceiptText, RefreshCw, Search, ShieldAlert, ShieldCheck, Sparkles, Star, Sun, Trash2, Upload, UserRound,
  Users, WalletCards, X,
} from "lucide-react";
import { toast } from "sonner";
import { useUniCarona } from "@/hooks/use-unicarona";
import { useIsDesktop } from "@/hooks/use-desktop";
import { campuses, initialState, type PixKey, type PixKeyType, type Review, type Ride, type RideRequest, type RequestStatus, type RideStatus, type User, type View, type Wallet, type WalletStatus } from "@/lib/unicarona-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const universityOptions = ["PUC Minas Coração Eucarístico", "PUC Minas Praça da Liberdade", "UFMG Pampulha", "CEFET-MG Nova Suíça", "PUC Minas Barreiro"];
const glass = "glass-card rounded-3xl";
const fieldClass = "h-12 rounded-full border-border/70 bg-background/60 px-4 shadow-none";

type ConfirmKind = "logout" | "delete" | "cancel" | "reject" | "cancel-request" | null;
type ModalKind = "driver" | "request" | "receipt" | "edit-profile" | "edit-ride" | "passenger" | "notifications" | "pix" | "rate-person" | "history" | "my-reviews" | "help" | "change-password" | null;
type RatingTarget = { rideId: string; targetId: string; role: "motorista" | "passageira" };

function initials(name: string) { return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(); }
function maskPhone(value: string) { const digits = value.replace(/\D/g, "").slice(0, 11); return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2"); }
function maskCPF(value: string) { const digits = value.replace(/\D/g, "").slice(0, 11); return digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2"); }
function walletApproved(user: User) { return user.wallet?.status === "verificada"; }
function walletStatusLabel(status?: WalletStatus) { return status === "verificada" ? "Verificada" : status === "em_analise" ? "Em análise" : status === "documentos_pendentes" ? "Documentos pendentes" : status === "rejeitada" ? "Verificação recusada" : "Não criada"; }
function walletStatusTint(status?: WalletStatus) { return status === "verificada" ? "bg-success-soft text-success" : status === "em_analise" ? "bg-live text-live-foreground" : status === "rejeitada" ? "bg-destructive/10 text-destructive" : status === "documentos_pendentes" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"; }
function academicEmail(email: string) { return /^[^\s@]+@(?:[\w-]+\.)*(?:edu\.br|pucminas\.br|ufmg\.br|cefetmg\.br)$/i.test(email); }
const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const shortMonthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function dateParts(date: string) { const parts = date.split("-"); return { year: Number(parts[0]), month: Number(parts[1]), day: Number(parts[2]) }; }
function monthLabel(date: string) { const { year, month } = dateParts(date); const name = monthNames[month - 1] ?? ""; return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`; }
function formatShortDate(date: string) { const { month, day } = dateParts(date); return `${day} ${shortMonthNames[month - 1] ?? ""}`; }
function formatFullDate(date: string) { const { year, month, day } = dateParts(date); return `${day} de ${monthNames[month - 1] ?? ""} de ${year}`; }
function weekday(date: string) { const { year, month, day } = dateParts(date); return new Date(year, month - 1, day).getDay(); }
function formatCountdown(ms: number) { const total = Math.max(0, Math.ceil(ms / 1000)); const minutes = String(Math.floor(total / 60)).padStart(2, "0"); const seconds = String(total % 60).padStart(2, "0"); return `${minutes}:${seconds}`; }
const PAYMENT_WINDOW_MS = 10 * 60 * 1000;
function tripsForUser(user: User, rides: Ride[], requests: RideRequest[], users: User[]) {
  const driver = user.type === "motorista";
  return rides
    .filter((ride) => ride.status === "Concluída" && (driver ? ride.driverId === user.id : requests.some((request) => request.rideId === ride.id && request.passengerId === user.id && request.status === "Aprovada")))
    .map((ride) => ({ ride, companionName: (driver ? users.find((person) => requests.some((request) => request.rideId === ride.id && request.passengerId === person.id && request.status === "Aprovada")) : users.find((person) => person.id === ride.driverId))?.name }))
    .sort((a, b) => (a.ride.date < b.ride.date ? 1 : -1));
}

function UserAvatar({ user, className = "size-11" }: { user: User; className?: string }) {
  return <Avatar className={`${className} ring-2 ring-background`}><AvatarImage src={user.photo} alt={`Foto de ${user.name}`} /><AvatarFallback className="bg-primary/15 font-bold text-primary">{user.avatar || initials(user.name)}</AvatarFallback></Avatar>;
}

function Field({ label, error, valid, action, children }: { label: string; error?: string; valid?: boolean; action?: ReactNode; children: ReactNode }) {
  return <div className="space-y-2"><div className="flex items-center justify-between px-1"><Label className="text-sm font-semibold">{label}</Label>{valid && <span className="animate-in fade-in flex items-center gap-1 text-xs font-bold text-success"><Check className="size-3.5" /> E-mail verificado</span>}{action}</div>{children}{error && <p className="animate-in slide-in-from-top-1 flex items-center gap-1.5 px-2 text-xs font-medium text-destructive"><AlertTriangle className="size-3.5 shrink-0" />{error}</p>}</div>;
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input className={`${fieldClass} pr-12`} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 size-10 rounded-full" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>{visible ? <EyeOff /> : <Eye />}</Button></div>;
}

function Status({ value, label }: { value: RideStatus | RequestStatus | "Confirmada"; label?: string }) {
  const style = value === "Aprovada" || value === "Confirmada" ? "bg-success-soft text-success" : value === "Em andamento" || value === "Aguardando pagamento" ? "bg-live text-live-foreground" : value === "Cancelada" || value === "Recusada" || value === "Expirada" ? "bg-destructive/10 text-destructive" : value === "Concluída" ? "bg-muted text-muted-foreground" : "bg-warning-soft text-warning";
  return <Badge className={`${style} rounded-full border-0 px-3 py-1 text-[11px] shadow-none`}>{label ?? value}</Badge>;
}
function rideStatusLabel(status: RideStatus) { return status === "Pendente" ? "Aguardando início" : status; }
function requestStatusLabel(status: RequestStatus) { return status === "Pendente" ? "Aguardando aprovação" : status; }

const loginHighlights = [
  { icon: ShieldCheck, text: "Estudantes com e-mail acadêmico verificado" },
  { icon: WalletCards, text: "Pagamento simples e rápido via PIX" },
  { icon: Star, text: "Avaliações trocadas após cada viagem" },
];

function Login({ onLogin, onSignup }: { onLogin: (email: string, password: string) => boolean; onSignup: (user: User) => void }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("bruno.andrade@pucminas.br");
  const [password, setPassword] = useState("unicarona123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState(universityOptions[0]);
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const validEmail = academicEmail(email);
  const passwordsMatch = password === confirmPassword;
  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length ? 1 : 0;
  const canSubmit = validEmail && password.length > 0 && (!signup || (name.trim().length > 0 && phone.length >= 15 && password.length >= 8 && passwordsMatch));
  const upload = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : undefined); reader.readAsDataURL(file); };
  const submit = (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (!validEmail) { setError("Use seu e-mail institucional da universidade para continuar."); toast.error("Confira o e-mail acadêmico informado."); return; }
    if (signup && (!name.trim() || phone.length < 15 || password.length < 8)) { setError("Preencha seu nome, telefone completo e uma senha com pelo menos 8 caracteres."); toast.error("Alguns dados obrigatórios precisam de atenção."); return; }
    if (signup && !passwordsMatch) { setError("As senhas informadas não coincidem."); toast.error("Confirme sua senha corretamente."); return; }
    setBusy(true);
    window.setTimeout(() => {
      if (signup) onSignup({ id: `u-${Date.now()}`, name: name.trim(), email, password, university, phone, photo, bio: "Novo membro da comunidade UniCarona.", course: "Estudante", avatar: initials(name), rating: 5, completedRides: 0, type: "passageira" });
      else if (!onLogin(email, password)) { setError("E-mail ou senha não conferem. Tente novamente."); toast.error("Não foi possível entrar com esses dados."); }
      setBusy(false);
    }, 550);
  };
  return <main className="min-h-screen bg-app text-foreground lg:flex">
    <div className="hidden bg-primary-gradient text-primary-foreground lg:flex lg:w-1/2 lg:shrink-0 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <Link to="/" className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white/15"><Car /></span><div><b className="text-xl">UniCarona</b><p className="text-sm text-primary-foreground/70">Mobilidade universitária</p></div></Link>
      <div className="max-w-md">
        <h2 className="text-4xl font-extrabold leading-tight tracking-normal">Caronas seguras entre estudantes de BH.</h2>
        <p className="mt-4 text-primary-foreground/80">Conecte-se com colegas verificados, compartilhe trajetos e economize no seu dia a dia universitário.</p>
        <div className="mt-10 space-y-4">{loginHighlights.map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15"><Icon className="size-4" /></span><span className="text-sm">{text}</span></div>)}</div>
      </div>
      <p className="text-xs text-primary-foreground/60">Feito para a comunidade universitária de Belo Horizonte.</p>
    </div>
    <div className="px-4 py-8 sm:grid sm:place-items-center lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:px-12 lg:py-12">
      <section className={`glass-card mx-auto w-full rounded-[2rem] p-6 shadow-device sm:p-8 lg:max-w-md lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none ${signup ? "max-w-md lg:max-w-lg" : "max-w-md"}`}>
        <div className="mb-8 flex items-center justify-between lg:hidden"><Link to="/" className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-primary"><Car /></span><div><b className="text-xl">UniCarona</b><p className="text-xs text-muted-foreground">Mobilidade universitária</p></div></Link></div>
        <div className="mb-7"><p className="text-sm font-bold text-primary">{signup ? "Sua jornada começa aqui" : "Que bom ter você de volta"}</p><h1 className="mt-2 text-3xl font-extrabold tracking-normal">{signup ? "Crie sua conta" : "Entre na UniCarona"}</h1><p className="mt-2 text-sm text-muted-foreground">Faça parte do UniCarona para encontrar e compartilhar caronas com estudantes em Belo Horizonte.</p></div>
        <form onSubmit={submit} className="space-y-5">
          {signup && <div className="flex justify-center"><label className="group relative cursor-pointer"><Avatar className="size-24 border-4 border-background shadow-lg"><AvatarImage src={photo} alt="Prévia da foto de perfil" /><AvatarFallback className="bg-secondary text-xl font-bold text-primary">{name ? initials(name) : <UserRound />}</AvatarFallback></Avatar><span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md"><Camera className="size-4" /></span><input className="sr-only" type="file" accept="image/*" onChange={upload} /><span className="sr-only">Selecionar foto de perfil</span></label></div>}
          {signup && <div className="grid gap-5 lg:grid-cols-2 lg:gap-x-4"><Field label="Nome completo"><Input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome completo" /></Field><Field label="Telefone"><Input className={fieldClass} value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="(31) 99999-9999" /></Field></div>}
          {signup && <Field label="Universidade"><Select value={university} onValueChange={setUniversity}><SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{universityOptions.map((option) => <SelectItem value={option} key={option}>{option}</SelectItem>)}</SelectContent></Select></Field>}
          <Field label="E-mail acadêmico" valid={signup && validEmail} error={email && !validEmail ? "Informe um e-mail institucional, como nome@ufmg.br." : undefined}><Input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu.nome@universidade.edu.br" /></Field>
          <Field label="Senha" action={!signup && <button type="button" className="text-xs font-bold text-primary hover:underline" onClick={() => setForgotOpen(true)}>Esqueci minha senha</button>}><PasswordInput value={password} onChange={setPassword} placeholder="Mínimo de 8 caracteres" />{signup && <div className="flex items-center gap-2 px-2"><div className="grid flex-1 grid-cols-3 gap-1">{[1, 2, 3].map((step) => <span key={step} className={`h-1.5 rounded-full ${strength >= step ? step === 1 ? "bg-destructive" : step === 2 ? "bg-warning" : "bg-success" : "bg-muted"}`} />)}</div><span className="text-[11px] text-muted-foreground">{strength === 3 ? "Forte" : strength === 2 ? "Boa" : "Fraca"}</span></div>}</Field>
          {signup && <Field label="Confirmar senha" error={confirmPassword && !passwordsMatch ? "As senhas não coincidem." : undefined}><PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repita sua senha" /></Field>}
          {error && <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <Button className="h-12 w-full rounded-full bg-primary-gradient font-bold shadow-primary" disabled={busy || !canSubmit}>{busy ? <LoaderCircle className="animate-spin" /> : signup ? "Criar minha conta" : "Entrar"}</Button>
        </form>
        <Button variant="ghost" className="mt-4 w-full rounded-full text-primary py-2" onClick={() => { setSignup((current) => !current); setError(""); setConfirmPassword(""); }}>{signup ? "Já tenho uma conta" : "Criar uma conta acadêmica"}</Button>
      </section>
    </div>
    <ForgotPasswordDialog open={forgotOpen} initialEmail={email} onClose={() => setForgotOpen(false)} />
  </main>;
}

function ForgotPasswordDialog({ open, initialEmail, onClose }: { open: boolean; initialEmail: string; onClose: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => { if (open) { setEmail(initialEmail); setBusy(false); setSent(false); } }, [open, initialEmail]);
  const validEmail = academicEmail(email);
  const send = () => { if (!validEmail) return; setBusy(true); window.setTimeout(() => { setBusy(false); setSent(true); toast.success("Link de recuperação enviado!"); }, 550); };
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}>
    {sent ? <>
      <DialogHeader><div className="mb-2 grid size-12 place-items-center rounded-2xl bg-success-soft text-success"><Mail /></div><DialogTitle>Verifique seu e-mail</DialogTitle><DialogDescription>Enviamos um link para <b className="text-foreground">{email}</b>. Abra a mensagem e siga as instruções para criar uma nova senha. O link é válido por 30 minutos.</DialogDescription></DialogHeader>
      <p className="rounded-2xl bg-secondary/70 p-3 text-xs text-muted-foreground">Não recebeu? Confira a caixa de spam ou lixo eletrônico do seu e-mail acadêmico.</p>
      <DialogFooter><Button variant="outline" className="rounded-full" onClick={send} disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}Reenviar e-mail</Button><Button className="rounded-full" onClick={onClose}>Voltar ao login</Button></DialogFooter>
    </> : <>
      <DialogHeader><div className="mb-2 grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary"><KeyRound /></div><DialogTitle>Recuperar senha</DialogTitle><DialogDescription>Informe o e-mail acadêmico cadastrado. Enviaremos um link para você criar uma nova senha.</DialogDescription></DialogHeader>
      <Field label="E-mail acadêmico" error={email && !validEmail ? "Informe um e-mail institucional, como nome@ufmg.br." : undefined}><Input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu.nome@universidade.edu.br" /></Field>
      <DialogFooter><Button variant="outline" className="rounded-full" onClick={onClose}>Cancelar</Button><Button className="rounded-full" disabled={busy || !validEmail} onClick={send}>{busy ? <LoaderCircle className="animate-spin" /> : <Mail />}Enviar link de recuperação</Button></DialogFooter>
    </>}
  </DialogContent></Dialog>;
}

const passengerMenu: { id: View; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Início", icon: Home }, { id: "buscar", label: "Buscar", icon: Search }, { id: "corrida", label: "Viagens", icon: Navigation }, { id: "painel", label: "Resumo", icon: BarChart3 }, { id: "perfil", label: "Perfil", icon: UserRound },
];
const driverMenu: { id: View; label: string; icon: typeof Home }[] = [
  { id: "inicio", label: "Início", icon: Home }, { id: "publicar", label: "Oferecer", icon: Plus }, { id: "solicitacoes", label: "Pedidos", icon: Users }, { id: "painel", label: "Resumo", icon: BarChart3 }, { id: "perfil", label: "Perfil", icon: UserRound },
];

const desktopOnlyMobileViews: View[] = ["buscar", "solicitacoes", "corrida"];

export function UniCaronaApp() {
  const { state, update, reset, hydrated } = useUniCarona();
  const isDesktop = useIsDesktop();
  const [view, setView] = useState<View>("inicio");
  const [modal, setModal] = useState<ModalKind>(null);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [selectedRideId, setSelectedRideId] = useState("r3");
  const [selectedRequestId, setSelectedRequestId] = useState("q1");
  const [ratingQueue, setRatingQueue] = useState<RatingTarget[]>([]);
  const [lastFinishedRide, setLastFinishedRide] = useState<{ ride: Ride; driver: User } | null>(null);
  const [justFinishedRideId, setJustFinishedRideId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (view !== "corrida") setLastFinishedRide(null); }, [view]);
  useEffect(() => { if (view !== "publicar") setJustFinishedRideId(null); }, [view]);
  useEffect(() => { if (isDesktop && desktopOnlyMobileViews.includes(view)) setView("inicio"); }, [isDesktop, view]);
  const current = state.users.find((user) => user.id === state.currentUserId) ?? null;
  const selectedRide = state.rides.find((ride) => ride.id === selectedRideId);
  const selectedDriver = state.users.find((user) => user.id === selectedRide?.driverId);
  const selectedRequest = state.requests.find((request) => request.id === selectedRequestId);
  const selectedPassenger = state.users.find((user) => user.id === selectedRequest?.passengerId);
  const selectedRideCompanion = selectedRide && current ? (current.type === "motorista" ? state.users.find((person) => state.requests.some((request) => request.rideId === selectedRide.id && request.passengerId === person.id && request.status === "Aprovada")) : state.users.find((person) => person.id === selectedRide.driverId)) : undefined;
  const eligibleActiveRequests = current ? state.requests.filter((request) => request.passengerId === current.id && request.status === "Aprovada" && state.rides.some((ride) => ride.id === request.rideId && ride.status !== "Concluída" && ride.status !== "Cancelada")) : [];
  const activeRequest = eligibleActiveRequests.find((request) => state.rides.find((ride) => ride.id === request.rideId)?.status === "Em andamento") ?? eligibleActiveRequests[0];
  const activeRide = state.rides.find((ride) => ride.id === activeRequest?.rideId);
  const activeDriver = state.users.find((user) => user.id === activeRide?.driverId);
  const pendingPaymentRequest = current?.type === "passageira" ? state.requests.find((request) => request.passengerId === current.id && request.status === "Aguardando pagamento") : undefined;
  const pendingPaymentRide = state.rides.find((ride) => ride.id === pendingPaymentRequest?.rideId);
  const pendingPaymentDriver = state.users.find((user) => user.id === pendingPaymentRide?.driverId);
  const pendingApprovalRequest = current?.type === "passageira" ? state.requests.find((request) => request.passengerId === current.id && request.status === "Pendente") : undefined;
  const pendingApprovalRide = state.rides.find((ride) => ride.id === pendingApprovalRequest?.rideId);
  const ratingTarget = ratingQueue[0];
  const ratingPerson = state.users.find((user) => user.id === ratingTarget?.targetId);
  const ratingRide = state.rides.find((ride) => ride.id === ratingTarget?.rideId);
  const setState = (patch: Partial<typeof state>) => update((previous) => ({ ...previous, ...patch }));
  const notify = (userId: string, text: string) => update((previous) => ({ ...previous, notifications: [{ id: `n-${Date.now()}`, userId, text, read: false, time: "Agora" }, ...previous.notifications] }));
  const updateWallet = (recipe: (wallet: Wallet | undefined) => Wallet | undefined) => update((previous) => ({ ...previous, users: previous.users.map((user) => user.id === previous.currentUserId ? { ...user, wallet: recipe(user.wallet) } : user) }));
  useEffect(() => {
    const expired = state.requests.filter((request) => request.status === "Aguardando pagamento" && request.paymentDeadline !== undefined && request.paymentDeadline < now);
    if (!expired.length) return;
    update((previous) => ({
      ...previous,
      requests: previous.requests.map((request) => expired.some((item) => item.id === request.id) ? { ...request, status: "Expirada" } : request),
      rides: previous.rides.map((ride) => expired.some((item) => item.rideId === ride.id) ? { ...ride, seats: ride.seats + 1 } : ride),
      notifications: [...expired.map((item) => ({ id: `n-${Date.now()}-${item.id}`, userId: item.passengerId, text: "O tempo para pagamento acabou e sua vaga foi liberada.", read: false, time: "Agora" })), ...previous.notifications],
    }));
  }, [now, state.requests, update]);
  useEffect(() => { if (modal === "pix" && !pendingPaymentRequest) setModal(null); }, [modal, pendingPaymentRequest]);
  const switchPersona = (id: "bruno" | "camila") => { setState({ currentUserId: id }); setView("inicio"); toast.success(`Modo alterado para ${id === "bruno" ? "Bruno, motorista" : "Camila, passageira"}.`); };
  const login = (email: string, password: string) => { const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password); if (!user) return false; setState({ currentUserId: user.id }); toast.success(`Bem-vindo, ${user.name.split(" ")[0]}!`); return true; };
  const signup = (user: User) => { update((previous) => ({ ...previous, users: [...previous.users, user], currentUserId: user.id })); toast.success("Conta criada e e-mail acadêmico verificado!"); };
  if (!hydrated) return <div className="grid min-h-screen place-items-center bg-app"><LoaderCircle className="size-8 animate-spin text-primary" /><span className="sr-only">Carregando UniCarona</span></div>;
  if (!current) return <Login onLogin={login} onSignup={signup} />;

  const isDriver = current.type === "motorista";
  const menu = isDriver ? driverMenu : passengerMenu;
  const desktopMenu = menu.filter((item) => !desktopOnlyMobileViews.includes(item.id));
  const unread = state.notifications.filter((item) => item.userId === current.id && !item.read).length;
  const approve = (id: string) => { const request = state.requests.find((item) => item.id === id); const deadline = Date.now() + PAYMENT_WINDOW_MS; update((previous) => ({ ...previous, requests: previous.requests.map((item) => item.id === id ? { ...item, status: "Aguardando pagamento", paymentDeadline: deadline } : item), rides: previous.rides.map((ride) => ride.id === request?.rideId ? { ...ride, seats: Math.max(0, ride.seats - 1) } : ride) })); if (request) notify(request.passengerId, "Sua vaga foi pré-aprovada! Pague com PIX em até 10 minutos para confirmar."); toast.success("Vaga pré-aprovada. Aguardando pagamento da passageira."); };
  const confirmPayment = (id: string) => { const request = state.requests.find((item) => item.id === id); const ride = state.rides.find((item) => item.id === request?.rideId); update((previous) => ({ ...previous, requests: previous.requests.map((item) => item.id === id ? { ...item, status: "Aprovada" } : item) })); if (ride) notify(ride.driverId, "Pagamento confirmado! A vaga está garantida."); toast.success("Pagamento confirmado. Sua vaga está garantida!"); setModal(null); };
  const requestRide = () => { if (!selectedRide) return; if (state.requests.some((item) => item.rideId === selectedRide.id && item.passengerId === current.id)) { toast.error("Você já solicitou essa carona."); setModal(null); return; } update((previous) => ({ ...previous, requests: [...previous.requests, { id: `q-${Date.now()}`, rideId: selectedRide.id, passengerId: current.id, status: "Pendente", createdAt: "Agora" }] })); notify(selectedRide.driverId, `${current.name} solicitou uma vaga.`); toast.success("Solicitação enviada ao motorista!"); setModal(null); };
  const advanceRatingQueue = () => setRatingQueue((queue) => { const rest = queue.slice(1); if (!rest.length) setModal(null); return rest; });
  const finishRide = () => {
    if (activeRide) update((previous) => ({ ...previous, rides: previous.rides.map((ride) => ride.id === activeRide.id ? { ...ride, status: "Concluída" } : ride), users: previous.users.map((user) => user.id === current.id ? { ...user, completedRides: user.completedRides + 1 } : user) }));
    toast.success("Viagem concluída. Obrigado por compartilhar o caminho!");
    if (activeDriver && activeRide) { setLastFinishedRide({ ride: activeRide, driver: activeDriver }); setRatingQueue([{ rideId: activeRide.id, targetId: activeDriver.id, role: "motorista" }]); setModal("rate-person"); }
  };
  const startDriverRide = (rideId: string) => {
    const approvedPassengerIds = state.requests.filter((request) => request.rideId === rideId && request.status === "Aprovada").map((request) => request.passengerId);
    update((previous) => ({ ...previous, rides: previous.rides.map((ride) => ride.id === rideId ? { ...ride, status: "Em andamento" } : ride), notifications: [...approvedPassengerIds.map((passengerId) => ({ id: `n-${Date.now()}-${passengerId}`, userId: passengerId, text: `${current.name.split(" ")[0]} iniciou a viagem e está a caminho.`, read: false, time: "Agora" })), ...previous.notifications] }));
    toast.success("Viagem iniciada! Conclua ao chegar ao destino.");
  };
  const finishDriverRide = (rideId: string) => {
    const approvedPassengerIds = state.requests.filter((request) => request.rideId === rideId && request.status === "Aprovada").map((request) => request.passengerId);
    update((previous) => ({ ...previous, rides: previous.rides.map((ride) => ride.id === rideId ? { ...ride, status: "Concluída" } : ride), users: previous.users.map((user) => user.id === current.id ? { ...user, completedRides: user.completedRides + 1 } : user) }));
    toast.success("Carona concluída!");
    setJustFinishedRideId(rideId);
    if (approvedPassengerIds.length) { setRatingQueue(approvedPassengerIds.map((passengerId) => ({ rideId, targetId: passengerId, role: "passageira" as const }))); setModal("rate-person"); }
  };
  const skipRating = () => advanceRatingQueue();
  const submitRating = (stars: number, comment: string) => { if (ratingPerson && ratingRide) update((previous) => ({ ...previous, reviews: [...previous.reviews, { id: `rev-${Date.now()}`, rideId: ratingRide.id, authorId: current.id, targetId: ratingPerson.id, rating: stars, comment, createdAt: "Agora" }], users: previous.users.map((user) => user.id === ratingPerson.id ? { ...user, rating: Number(((user.rating * user.completedRides + stars) / (user.completedRides + 1)).toFixed(1)), completedRides: user.completedRides + 1 } : user) })); toast.success("Obrigado pela sua avaliação!"); advanceRatingQueue(); };
  const openNotifications = () => { setModal("notifications"); update((previous) => ({ ...previous, notifications: previous.notifications.map((item) => item.userId === current.id ? { ...item, read: true } : item) })); };

  const content = <>
    {view === "inicio" && (isDesktop ? <DesktopHomeView user={current} isDriver={isDriver} rides={state.rides} onOffer={() => setView("publicar")} onDashboard={() => setView("painel")} onRide={(id) => { setSelectedRideId(id); setModal("driver"); }} /> : <HomeView user={current} rides={state.rides} requests={state.requests} users={state.users} go={setView} onRide={(id) => { setSelectedRideId(id); setModal("driver"); }} pendingPayment={pendingPaymentRequest && pendingPaymentRide ? { request: pendingPaymentRequest, ride: pendingPaymentRide, driver: pendingPaymentDriver } : undefined} activeRide={activeRide} pendingApproval={pendingApprovalRequest && pendingApprovalRide ? { request: pendingApprovalRequest, ride: pendingApprovalRide } : undefined} onCancelRequest={(id) => { setSelectedRequestId(id); setConfirm("cancel-request"); }} now={now} onPay={() => setModal("pix")} />)}
    {!isDesktop && view === "buscar" && <SearchView rides={state.rides.filter((ride) => ride.driverId !== current.id)} users={state.users} onProfile={(id) => { setSelectedRideId(id); setModal("driver"); }} onRequest={(id) => { setSelectedRideId(id); setModal("request"); }} />}
    {view === "publicar" && <PublishView isDesktop={isDesktop} user={current} rides={state.rides} requests={state.requests} onWallet={() => setView("carteira")} onCreate={(ride) => { update((previous) => ({ ...previous, rides: [ride, ...previous.rides] })); toast.success("Carona publicada com sucesso!"); setView("inicio"); }} onEdit={(id) => { setSelectedRideId(id); setModal("edit-ride"); }} onCancel={(id) => { setSelectedRideId(id); setConfirm("cancel"); }} onStart={startDriverRide} onFinish={finishDriverRide} justFinishedRideId={justFinishedRideId} />}
    {!isDesktop && view === "solicitacoes" && <RequestsView requests={state.requests} rides={state.rides} users={state.users} driverId={current.id} onProfile={(id) => { setSelectedRequestId(id); setModal("passenger"); }} onApprove={approve} onReject={(id) => { setSelectedRequestId(id); setConfirm("reject"); }} />}
    {!isDesktop && view === "corrida" && <TrackingView key={activeRide?.id ?? "none"} ride={activeRide} driver={activeDriver} finished={lastFinishedRide} onFinish={finishRide} />}
    {view === "painel" && <DashboardView isDesktop={isDesktop} user={current} rides={state.rides} requests={state.requests} users={state.users} onReceipt={(id) => { setSelectedRideId(id); setModal("receipt"); }} onSeeAll={() => setModal("history")} onReviews={() => setModal("my-reviews")} reviewCount={state.reviews.filter((review) => review.targetId === current.id).length} />}
    {view === "carteira" && <CarteiraView isDesktop={isDesktop} user={current} onCreate={(cpf, birthDate, pixKey) => { updateWallet(() => ({ status: "documentos_pendentes", cpf, birthDate, pixKey, documents: { documento: false, selfie: false } })); toast.success("Carteira criada! Agora envie seus documentos para verificação."); }} onUploadDocument={(type) => updateWallet((wallet) => wallet ? { ...wallet, documents: { ...wallet.documents, [type]: true } } : wallet)} onSubmitReview={() => { updateWallet((wallet) => wallet ? { ...wallet, status: "em_analise", submittedAt: "Agora", asaasAccountId: `asaas_${current.id}${Date.now().toString().slice(-6)}` } : wallet); toast.success("Documentos enviados! Vamos avisar assim que a verificação terminar."); }} onSimulateDecision={(approved) => { updateWallet((wallet) => wallet ? { ...wallet, status: approved ? "verificada" : "rejeitada", rejectionReason: approved ? undefined : "A foto do documento ficou ilegível. Tire uma nova foto com boa iluminação." } : wallet); toast[approved ? "success" : "error"](approved ? "Carteira verificada com sucesso!" : "Verificação recusada. Reenvie seus documentos."); }} onRetry={() => updateWallet((wallet) => wallet ? { ...wallet, status: "documentos_pendentes", documents: { documento: false, selfie: false }, rejectionReason: undefined } : wallet)} onUpdatePixKey={(pixKey) => { updateWallet((wallet) => wallet ? { ...wallet, pixKey } : wallet); toast.success("Chave PIX atualizada com sucesso!"); }} onPublish={isDriver ? () => setView("publicar") : undefined} />}
    {view === "perfil" && <ProfileView isDesktop={isDesktop} user={current} theme={state.theme} onTheme={(dark) => setState({ theme: dark ? "dark" : "light" })} onEdit={() => setModal("edit-profile")} onWallet={() => setView("carteira")} onSwitch={switchPersona} onReset={() => { reset(); toast.success("Dados da demonstração restaurados."); }} onLogout={() => setConfirm("logout")} onDelete={() => setConfirm("delete")} onHelp={() => setModal("help")} onChangePassword={() => setModal("change-password")} />}
  </>;

  return <TooltipProvider>
    {isDesktop ? <div className="flex min-h-screen w-full bg-app text-foreground">
      <DesktopSidebar menu={desktopMenu} view={view} setView={setView} current={current} isDriver={isDriver} onLogout={() => setConfirm("logout")} />
      <div className="flex min-h-screen flex-1 flex-col">
        <DesktopTopbar view={view} unread={unread} theme={state.theme} onTheme={(dark) => setState({ theme: dark ? "dark" : "light" })} onNotifications={openNotifications} />
        <main className="flex-1 overflow-y-auto px-10 py-8"><div className="mx-auto w-full max-w-5xl">{content}</div></main>
      </div>
    </div> : <div className="min-h-screen bg-app px-0 py-0 text-foreground sm:px-5 sm:py-6">
    <div className="phone-shell mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-surface shadow-device sm:min-h-[calc(100dvh-3rem)] sm:rounded-[2.5rem] sm:border sm:border-white/30">
      <header className="glass-header sticky top-0 z-30 flex items-center gap-3 px-5 pb-3 pt-4"><div className="min-w-0 flex-1"><p className="text-xs font-medium text-muted-foreground">Olá, {current.name.split(" ")[0]}!</p><h1 className="truncate text-lg font-extrabold tracking-normal">{isDriver ? "Pronto para dirigir?" : "Para onde vamos hoje?"}</h1></div><Button variant="ghost" size="icon" className="relative rounded-full" onClick={openNotifications} aria-label="Abrir notificações"><Bell />{unread > 0 && <span className="absolute right-1 top-1 size-2.5 rounded-full bg-destructive ring-2 ring-background" />}</Button><button type="button" onClick={() => setView("perfil")} aria-label="Ir para o perfil" className="rounded-full"><UserAvatar user={current} /></button>
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">{content}</main>
      <nav className="glass-dock fixed bottom-4 left-1/2 z-40 grid w-[calc(100%-2rem)] max-w-[25rem] -translate-x-1/2 grid-cols-5 rounded-full p-1.5 shadow-2xl">{menu.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => setView(id)} className={`h-14 min-w-0 flex-col gap-1 rounded-full px-1 text-[10px] ${view === id ? "bg-primary-gradient text-primary-foreground shadow-primary hover:text-primary-foreground" : "text-muted-foreground"}`}><Icon className="size-5" /><span className="truncate">{label}</span></Button>)}</nav>
    </div>
    </div>}
    <ProfileDialog open={modal === "edit-profile"} user={current} onClose={() => setModal(null)} onSave={(values) => { update((previous) => ({ ...previous, users: previous.users.map((user) => user.id === current.id ? { ...user, ...values, avatar: initials(values.name ?? user.name) } : user) })); setModal(null); toast.success("Perfil atualizado com sucesso!"); }} />
    <PersonDialog open={modal === "driver" || modal === "passenger"} person={modal === "driver" ? selectedDriver : selectedPassenger} title={modal === "driver" ? "Perfil do motorista" : "Perfil da passageira"} reviews={state.reviews} users={state.users} onClose={() => setModal(null)} />
    <ReviewsDialog open={modal === "my-reviews"} title="Minhas avaliações" reviews={state.reviews.filter((review) => review.targetId === current.id)} users={state.users} onClose={() => setModal(null)} />
    <RequestDialog open={modal === "request"} ride={selectedRide} driver={selectedDriver} onClose={() => setModal(null)} onConfirm={requestRide} />
    <PixDialog open={modal === "pix"} request={pendingPaymentRequest} ride={pendingPaymentRide} driver={pendingPaymentDriver} now={now} onClose={() => setModal(null)} onConfirm={() => pendingPaymentRequest && confirmPayment(pendingPaymentRequest.id)} />
    <ReceiptDialog open={modal === "receipt"} user={current} ride={selectedRide} companionName={selectedRideCompanion?.name} onClose={() => setModal(null)} />
    <RatePersonDialog open={modal === "rate-person"} person={ratingPerson} role={ratingTarget?.role ?? "motorista"} ride={ratingRide} onClose={skipRating} onSubmit={submitRating} />
    <TripHistoryDialog open={modal === "history"} isDriver={isDriver} trips={tripsForUser(current, state.rides, state.requests, state.users)} onClose={() => setModal(null)} onReceipt={(id) => { setSelectedRideId(id); setModal("receipt"); }} />
    <EditRideDialog open={modal === "edit-ride"} ride={selectedRide} onClose={() => setModal(null)} onSave={(ride) => { update((previous) => ({ ...previous, rides: previous.rides.map((item) => item.id === ride.id ? ride : item) })); setModal(null); toast.success("Carona atualizada. O preço continua fixo em R$ 6,00."); }} />
    <NotificationsDialog open={modal === "notifications"} notifications={state.notifications.filter((item) => item.userId === current.id)} onClose={() => setModal(null)} />
    <HelpDialog open={modal === "help"} onClose={() => setModal(null)} />
    <ChangePasswordDialog open={modal === "change-password"} user={current} onClose={() => setModal(null)} onSave={(password) => { update((previous) => ({ ...previous, users: previous.users.map((user) => user.id === current.id ? { ...user, password } : user) })); setModal(null); toast.success("Senha alterada com sucesso!"); }} />
    <ConfirmationDialog kind={confirm} onClose={() => setConfirm(null)} onConfirm={() => { if (confirm === "logout") setState({ currentUserId: null }); if (confirm === "delete") update((previous) => ({ ...initialState, users: previous.users.filter((user) => user.id !== current.id), currentUserId: null, theme: previous.theme })); if (confirm === "cancel") update((previous) => ({ ...previous, rides: previous.rides.map((ride) => ride.id === selectedRideId ? { ...ride, status: "Cancelada" } : ride) })); if (confirm === "reject") update((previous) => ({ ...previous, requests: previous.requests.map((request) => request.id === selectedRequestId ? { ...request, status: "Recusada" } : request) })); if (confirm === "cancel-request") update((previous) => ({ ...previous, requests: previous.requests.filter((request) => request.id !== selectedRequestId) })); toast.success(confirm === "logout" ? "Sessão encerrada com segurança." : confirm === "delete" ? "Conta excluída." : confirm === "cancel" ? "Carona cancelada e passageiros avisados." : confirm === "reject" ? "Solicitação recusada." : "Solicitação cancelada."); setConfirm(null); }} />
  </TooltipProvider>;
}

function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) { return <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold tracking-normal">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>{action}</div>; }
function Metric({ icon: Icon, value, label, tint = "primary" }: { icon: typeof Car; value: string; label: string; tint?: "primary" | "blue" | "lime" }) { const color = tint === "blue" ? "bg-sky-soft text-sky" : tint === "lime" ? "bg-live text-live-foreground" : "bg-primary/12 text-primary"; return <div className={`${glass} p-4 lg:flex lg:flex-col lg:items-center lg:text-center`}><span className={`grid size-9 place-items-center rounded-2xl ${color}`}><Icon className="size-4" /></span><b className="mt-5 block text-xl">{value}</b><span className="mt-1 block text-xs leading-tight text-muted-foreground">{label}</span></div>; }

const desktopPageInfo: Record<View, { title: string; description: string }> = {
  inicio: { title: "Início", description: "Um resumo rápido da sua conta." },
  buscar: { title: "Buscar", description: "" },
  publicar: { title: "Oferecer carona", description: "Publique, edite ou cancele suas caronas." },
  solicitacoes: { title: "Pedidos", description: "" },
  corrida: { title: "Viagens", description: "" },
  carteira: { title: "Carteira", description: "Crie sua carteira digital e acompanhe a verificação de documentos." },
  painel: { title: "Resumo", description: "Métricas e histórico completo das suas viagens." },
  perfil: { title: "Perfil", description: "Dados da conta, recebimentos PIX e visualização." },
};

function DesktopSidebar({ menu, view, setView, current, isDriver, onLogout }: { menu: { id: View; label: string; icon: typeof Home }[]; view: View; setView: (view: View) => void; current: User; isDriver: boolean; onLogout: () => void }) {
  return <aside className="glass-header sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border/60 px-4 py-6">
    <div className="flex items-center gap-3 border-b border-border/60 px-2 pb-6"><span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-primary"><Car /></span><div><b className="block text-lg leading-tight">UniCarona</b><p className="text-xs text-muted-foreground">Mobilidade universitária</p></div></div>
    <nav className="mt-6 flex-1 space-y-1">{menu.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => setView(id)} className={`h-11 w-full justify-start gap-3 rounded-2xl px-3 text-sm font-semibold ${view === id ? "bg-primary-gradient text-primary-foreground shadow-primary hover:text-primary-foreground" : "text-muted-foreground"}`}><Icon className="size-4" />{label}</Button>)}</nav>
    <div className="border-t border-border/60 pt-4"><div className="flex items-center gap-1 rounded-2xl px-1 py-1 transition hover:bg-muted/70"><button type="button" onClick={() => setView("perfil")} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 text-left"><UserAvatar user={current} className="size-10" /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{current.name}</b><p className="truncate text-xs text-muted-foreground">{isDriver ? "Motorista" : "Passageira"}</p></div></button><Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground" onClick={onLogout} aria-label="Sair da conta"><LogOut className="size-4" /></Button></div></div>
  </aside>;
}

function DesktopTopbar({ view, unread, theme, onTheme, onNotifications }: { view: View; unread: number; theme: "light" | "dark"; onTheme: (dark: boolean) => void; onNotifications: () => void }) {
  const info = desktopPageInfo[view];
  return <header className="glass-header sticky top-0 z-30 flex items-center justify-between gap-4 px-10 py-5"><div><h1 className="text-xl font-extrabold tracking-normal">{info.title}</h1>{info.description && <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>}</div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => onTheme(theme !== "dark")} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>{theme === "dark" ? <Moon /> : <Sun />}</Button><Button variant="ghost" size="icon" className="relative rounded-full" onClick={onNotifications} aria-label="Abrir notificações"><Bell />{unread > 0 && <span className="absolute right-1 top-1 size-2.5 rounded-full bg-destructive ring-2 ring-background" />}</Button></div></header>;
}

function DesktopHomeView({ user, isDriver, rides, onOffer, onDashboard, onRide }: { user: User; isDriver: boolean; rides: Ride[]; onOffer: () => void; onDashboard: () => void; onRide: (id: string) => void }) {
  const own = rides.filter((ride) => ride.driverId === user.id && (ride.status === "Pendente" || ride.status === "Em andamento"));
  return <div className="space-y-6">
    <section className="hero-card relative overflow-hidden rounded-3xl p-8 text-primary-foreground shadow-primary"><div className="relative z-10 max-w-md"><Badge className="rounded-full bg-live text-live-foreground">{isDriver ? "Painel do motorista" : "Painel da passageira"}</Badge><h2 className="mt-6 text-3xl font-extrabold tracking-normal">Olá, {user.name.split(" ")[0]}!</h2><p className="mt-3 text-sm text-primary-foreground/75">{isDriver ? "Gerencie suas caronas publicadas e acompanhe seus ganhos por aqui." : "Acompanhe seu histórico de viagens e mantenha seus dados em dia por aqui."}</p>{isDriver && <Button variant="secondary" className="mt-6 rounded-full" onClick={onOffer}><Plus />Oferecer carona</Button>}</div><Car className="absolute -bottom-8 -right-8 size-48 rotate-[-8deg] text-primary-foreground/10" /></section>
    <div className="grid grid-cols-3 gap-4">
      <Metric icon={Star} value={user.rating.toFixed(1)} label="Avaliação média" tint="lime" />
      <Metric icon={Car} value={String(user.completedRides)} label="Caronas concluídas" />
      {isDriver ? <Metric icon={CircleDollarSign} value="R$ 420,00" label="Arrecadado neste mês" tint="blue" /> : <Metric icon={Sparkles} value="R$ 195,00" label="Economia neste mês" tint="blue" />}
    </div>
    {isDriver ? <section><SectionTitle title="Suas caronas publicadas" description="Gerencie horários, vagas e cancelamentos." action={<Button variant="ghost" className="rounded-full px-3 text-primary" onClick={onOffer}>Gerenciar</Button>} />{own.length ? <div className="grid grid-cols-2 gap-4">{own.map((ride) => <RideCard key={ride.id} ride={ride} onProfile={() => onRide(ride.id)} onAction={onOffer} own />)}</div> : <EmptyState icon={Car} title="Nenhuma carona publicada" text="Publique uma carona para vê-la por aqui." />}</section> : <section className={`${glass} flex items-start gap-4 p-6`}><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><Search className="size-5" /></span><div><b className="block">Busca e acompanhamento ao vivo são exclusivos do app</b><p className="mt-1 text-sm text-muted-foreground">Para buscar caronas, solicitar vagas e acompanhar o motorista no mapa em tempo real, use a UniCarona no seu celular. Por aqui você pode gerenciar seu perfil, sua chave PIX e ver seu resumo de viagens.</p><Button variant="ghost" className="mt-3 rounded-full px-3 text-primary" onClick={onDashboard}>Ver meu resumo<ChevronRight /></Button></div></section>}
  </div>;
}

function HomeView({ user, rides, requests, users, go, onRide, pendingPayment, activeRide, pendingApproval, onCancelRequest, now, onPay }: { user: User; rides: Ride[]; requests: RideRequest[]; users: User[]; go: (view: View) => void; onRide: (id: string) => void; pendingPayment?: { request: RideRequest; ride: Ride; driver?: User }; activeRide?: Ride; pendingApproval?: { request: RideRequest; ride: Ride }; onCancelRequest: (id: string) => void; now: number; onPay: () => void }) {
  const driver = user.type === "motorista";
  const available = rides.filter((ride) => ride.driverId !== user.id && ride.status === "Pendente").slice(0, 2);
  const pending = requests.filter((request) => request.status === "Pendente" && rides.some((ride) => ride.id === request.rideId && ride.driverId === user.id)).length;
  return <div className="space-y-6">
    {pendingPayment ? <section className="hero-card relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-primary"><div className="relative z-10"><Badge className="rounded-full bg-warning-soft text-warning"><Clock3 className="size-3.5" />Aguardando pagamento</Badge><h2 className="mt-7 max-w-[16rem] text-2xl font-extrabold tracking-normal">Pague com PIX para garantir sua vaga</h2><p className="mt-2 max-w-[17rem] break-words text-sm text-primary-foreground/75">{pendingPayment.ride.origin} → {pendingPayment.ride.destination}</p><p className="mt-1 text-sm font-bold text-primary-foreground">{formatCountdown(Math.max(0, (pendingPayment.request.paymentDeadline ?? now) - now))} restantes</p><Button variant="secondary" className="mt-5 rounded-full" onClick={onPay}><QrCode />Pagar agora</Button></div><Car className="absolute -bottom-6 -right-7 size-40 rotate-[-8deg] text-primary-foreground/10" /></section>
    : driver ? <section className="hero-card relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-primary"><div className="relative z-10"><Badge className="rounded-full bg-live text-live-foreground">{`${pending} pedido${pending === 1 ? "" : "s"} aguardando`}</Badge><h2 className="mt-7 max-w-[16rem] text-2xl font-extrabold tracking-normal">Sua próxima saída está quase completa</h2><p className="mt-2 max-w-[17rem] text-sm text-primary-foreground/75">Gameleira → PUC Minas<br />Hoje, 07:20</p><Button variant="secondary" className="mt-5 rounded-full" onClick={() => go("solicitacoes")}>Ver solicitações<ChevronRight /></Button></div><Car className="absolute -bottom-6 -right-7 size-40 rotate-[-8deg] text-primary-foreground/10" /></section>
    : activeRide ? <section className="hero-card relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-primary"><div className="relative z-10"><Badge className="rounded-full bg-live text-live-foreground">{activeRide.status === "Em andamento" ? "Em andamento" : "Carona confirmada"}</Badge><h2 className="mt-7 max-w-[16rem] text-2xl font-extrabold tracking-normal">{activeRide.status === "Em andamento" ? "Seu motorista está a caminho" : "Sua vaga está garantida"}</h2><p className="mt-2 max-w-[17rem] break-words text-sm text-primary-foreground/75">{activeRide.origin} → {activeRide.destination}<br />{formatFullDate(activeRide.date)} · {activeRide.time}</p><Button variant="secondary" className="mt-5 rounded-full" onClick={() => go("corrida")}>Acompanhar ao vivo<ChevronRight /></Button></div><Car className="absolute -bottom-6 -right-7 size-40 rotate-[-8deg] text-primary-foreground/10" /></section>
    : !pendingApproval && <section className={`${glass} flex items-center gap-4 p-6`}><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><Search className="size-5" /></span><div><b className="block">Nenhuma carona confirmada no momento</b><p className="mt-1 text-sm text-muted-foreground">Busque uma carona disponível para começar sua próxima viagem.</p><Button variant="ghost" className="mt-3 rounded-full px-3 text-primary" onClick={() => go("buscar")}>Buscar carona<ChevronRight /></Button></div></section>}
    {pendingApproval && <section className={`${glass} p-5`}><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-warning-soft text-warning"><Clock3 className="size-5" /></span><div className="min-w-0 flex-1"><Badge className="rounded-full bg-warning-soft text-warning">Aguardando resposta do motorista</Badge><h2 className="mt-2 break-words text-base font-extrabold">{pendingApproval.ride.origin} → {pendingApproval.ride.destination}</h2><p className="mt-1 text-xs text-muted-foreground">{formatFullDate(pendingApproval.ride.date)} · {pendingApproval.ride.time}</p></div></div><Button variant="outline" className="mt-4 w-full rounded-full text-destructive hover:text-destructive" onClick={() => onCancelRequest(pendingApproval.request.id)}>Cancelar solicitação</Button></section>}
    {!driver && <section><SectionTitle title="Acesso rápido" /><div className="grid grid-cols-3 gap-3">{[{ icon: Search, label: "Buscar carona", view: "buscar" as View }, { icon: Navigation, label: "Minhas viagens", view: "corrida" as View }, { icon: ReceiptText, label: "Comprovantes", view: "painel" as View }].map(({ icon: Icon, label, view }) => <Button key={label} variant="ghost" className={`${glass} h-28 flex-col gap-3 px-2 text-xs font-bold`} onClick={() => go(view)}><span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary"><Icon /></span>{label}</Button>)}</div></section>}
    {driver && <div className="grid grid-cols-2 gap-3"><Metric icon={CircleDollarSign} value="R$ 420,00" label="Arrecadado neste mês" tint="lime" /><Metric icon={Users} value="78" label="Passageiros transportados" tint="blue" /></div>}
    <section><SectionTitle title={driver ? "Suas caronas" : "Caronas disponíveis"} description={driver ? "Acompanhe as próximas saídas" : "Rotas escolhidas para você"} action={<Button variant="ghost" className="rounded-full px-3 text-primary" onClick={() => go(driver ? "publicar" : "buscar")}>Ver todas</Button>} /><div className="space-y-3">{(driver ? rides.filter((ride) => ride.driverId === user.id && (ride.status === "Pendente" || ride.status === "Em andamento")) : available).map((ride) => { const person = users.find((item) => item.id === ride.driverId); return <RideCard key={ride.id} ride={ride} driver={person} onProfile={() => onRide(ride.id)} onAction={() => go(driver ? "publicar" : "buscar")} own={driver} />; })}</div></section>
  </div>;
}

function PlaceInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [focused, setFocused] = useState(false);
  const suggestions = campuses.filter((campus) => campus !== value && campus.toLowerCase().includes(value.trim().toLowerCase())).slice(0, 5);
  return <div className="relative"><MapPin className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" /><Textarea rows={1} value={value} onChange={(event) => onChange(event.target.value.replace(/\n/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} className="field-sizing-content min-h-12 resize-none rounded-3xl border-border/70 bg-background/60 py-3 pl-10 pr-4 leading-snug shadow-none" />{focused && suggestions.length > 0 && <div className="glass-dialog absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-border/60 p-1 shadow-lg">{suggestions.map((campus) => <button type="button" key={campus} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(campus); setFocused(false); }} className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"><MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />{campus}</button>)}</div>}</div>;
}

function RideCard({ ride, driver, onProfile, onAction, own = false }: { ride: Ride; driver?: User; onProfile: () => void; onAction: () => void; own?: boolean }) {
  return <article className={`${glass} p-4`}><div className="flex items-center gap-3">{driver && <Button variant="ghost" size="icon" className="size-11 rounded-full p-0" onClick={onProfile}><UserAvatar user={driver} /></Button>}<div className="min-w-0 flex-1"><b className="block truncate text-sm">{driver?.name ?? "Sua carona"}</b><p className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3 fill-warning text-warning" /> {ride.rating.toFixed(1)} · {ride.vehicle}</p></div>{own ? <Status value={ride.status} label={rideStatusLabel(ride.status)} /> : <Status value={ride.seats > 0 ? "Aprovada" : "Cancelada"} label={ride.seats > 0 ? "Aceitando pedidos" : "Lotada"} />}</div><div className="route-line my-5 space-y-4 pl-7"><div><span className="text-[11px] text-muted-foreground">Origem</span><p className="text-sm font-semibold">{ride.origin}</p></div><div><span className="text-[11px] text-muted-foreground">Destino</span><p className="text-sm font-semibold">{ride.destination}</p></div></div><div className="flex items-center gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3.5" />{ride.time}</span><span className="flex items-center gap-1"><Users className="size-3.5" />{own ? `${ride.seats} vagas` : `${ride.seats} ${ride.seats === 1 ? "vaga disponível" : "vagas disponíveis"}`}</span><b className="ml-auto text-base text-foreground">R$ 6,00</b><Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={onAction} aria-label={own ? "Gerenciar carona" : "Solicitar vaga"}><ChevronRight /></Button></div></article>;
}

function SearchView({ rides, users, onProfile, onRequest }: { rides: Ride[]; users: User[]; onProfile: (id: string) => void; onRequest: (id: string) => void }) {
  const [origin, setOrigin] = useState("Estação Gameleira"); const [destination, setDestination] = useState("PUC Minas - Campus Coração Eucarístico"); const [date, setDate] = useState("2026-09-16"); const [searching, setSearching] = useState(false); const [searched, setSearched] = useState(false);
  const visible = useMemo(() => rides.filter((ride) => ride.status === "Pendente"), [rides]);
  return <div><SectionTitle title="Buscar carona" description="Encontre horários que combinam com sua rotina." /><section className={`${glass} mb-6 space-y-4 p-4`}><Field label="De onde você sai?"><PlaceInput value={origin} onChange={setOrigin} /></Field><Field label="Para onde você vai?"><PlaceInput value={destination} onChange={setDestination} /></Field><Field label="Quando?"><Input className={fieldClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field><Button className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" onClick={() => { setSearching(true); window.setTimeout(() => { setSearching(false); setSearched(true); toast.success("Encontramos as melhores caronas para você."); }, 550); }}>{searching ? <LoaderCircle className="animate-spin" /> : <Search />}{searching ? "Buscando..." : "Buscar caronas"}</Button></section><SectionTitle title={searched ? `${visible.length} opções encontradas` : "Disponíveis perto de você"} /><div className="space-y-3">{visible.map((ride) => <RideCard key={ride.id} ride={ride} driver={users.find((user) => user.id === ride.driverId)} onProfile={() => onProfile(ride.id)} onAction={() => onRequest(ride.id)} />)}</div></div>;
}

function PublishView({ isDesktop, user, rides, requests, onWallet, onCreate, onEdit, onCancel, onStart, onFinish, justFinishedRideId }: { isDesktop: boolean; user: User; rides: Ride[]; requests: RideRequest[]; onWallet: () => void; onCreate: (ride: Ride) => void; onEdit: (id: string) => void; onCancel: (id: string) => void; onStart: (id: string) => void; onFinish: (id: string) => void; justFinishedRideId?: string | null }) {
  const [origin, setOrigin] = useState("Estação Gameleira"); const [destination, setDestination] = useState("PUC Minas - Campus Coração Eucarístico"); const [date, setDate] = useState("2026-09-17"); const [time, setTime] = useState("07:20"); const [seats, setSeats] = useState("2"); const [plate, setPlate] = useState(user.vehicle?.plate ?? ""); const [vehicle, setVehicle] = useState(user.vehicle?.model ?? "");
  const validPlate = /^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate);
  const canPublish = origin.trim().length > 0 && destination.trim().length > 0 && date.length > 0 && time.length > 0 && vehicle.trim().length > 0 && validPlate;
  const walletReady = walletApproved(user);
  const walletBanner: Record<Exclude<WalletStatus, "verificada">, { icon: typeof WalletCards; title: string; text: string; action: string }> = {
    nao_criada: { icon: WalletCards, title: "Crie sua carteira digital", text: "Você precisa criar sua carteira e ter os documentos verificados antes de publicar caronas.", action: "Criar carteira" },
    documentos_pendentes: { icon: Upload, title: "Finalize o envio dos seus documentos", text: "Faltam documentos para concluir a verificação da sua carteira.", action: "Continuar verificação" },
    em_analise: { icon: Hourglass, title: "Documentos em análise", text: "Assim que a Asaas aprovar seus documentos, você poderá publicar caronas.", action: "Ver andamento" },
    rejeitada: { icon: ShieldAlert, title: "Verificação recusada", text: user.wallet?.rejectionReason ?? "Reenvie seus documentos para tentar novamente.", action: "Reenviar documentos" },
  };
  const banner = !walletReady ? walletBanner[(user.wallet?.status ?? "nao_criada") as Exclude<WalletStatus, "verificada">] : undefined;
  const submit = (event: FormEvent) => { event.preventDefault(); if (!walletReady) { onWallet(); toast.error("Crie e verifique sua carteira antes de publicar caronas."); return; } if (!canPublish) { toast.error("Revise os campos e informe uma placa válida, como ABC1D23."); return; } onCreate({ id: `r-${Date.now()}`, driverId: user.id, origin, destination, date, time, seats: Number(seats), status: "Pendente", vehicle, plate, rating: user.rating }); };
  const own = rides.filter((ride) => ride.driverId === user.id && (ride.status === "Pendente" || ride.status === "Em andamento" || ride.id === justFinishedRideId));
  return <div className="space-y-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0"><div>{!isDesktop && <SectionTitle title="Oferecer carona" description="Compartilhe seu trajeto com estudantes verificados." />}<form onSubmit={submit} className={`${glass} space-y-4 p-4`}>
    {banner && <div className="rounded-2xl bg-warning-soft p-4 text-warning"><div className="flex gap-3"><banner.icon className="shrink-0" /><div><b className="text-sm">{banner.title}</b><p className="mt-1 text-xs">{banner.text}</p></div></div></div>}
    <fieldset disabled={!walletReady} aria-disabled={!walletReady} className={`space-y-4 ${walletReady ? "" : "pointer-events-none select-none opacity-50"}`}>
    <Field label="Origem"><PlaceInput value={origin} onChange={setOrigin} /></Field><Field label="Destino"><PlaceInput value={destination} onChange={setDestination} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Data"><Input className={fieldClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></Field><Field label="Horário"><Input className={fieldClass} type="time" value={time} onChange={(event) => setTime(event.target.value)} /></Field></div><Field label="Vagas"><div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((amount) => <Button type="button" variant={seats === String(amount) ? "default" : "outline"} className="rounded-full" key={amount} onClick={() => setSeats(String(amount))}>{amount}</Button>)}</div></Field><Field label="Modelo do carro"><Input className={fieldClass} value={vehicle} onChange={(event) => setVehicle(event.target.value)} placeholder="Chevrolet Onix 2022" /></Field><Field label="Placa Mercosul"><Input className={fieldClass} value={plate} onChange={(event) => setPlate(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))} placeholder="ABC1D23" /></Field>
    <div className="rounded-2xl bg-secondary/70 p-4 text-sm"><div className="flex justify-between"><span>Tarifa fixa</span><b>R$ 5,25</b></div><div className="mt-2 flex justify-between"><span>Taxa de serviço</span><b>R$ 0,75</b></div><div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3"><span className="font-bold">Total do passageiro</span><span className="flex items-center gap-2"><b className="text-lg text-primary">R$ 6,00</b><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-7 rounded-full"><CircleDollarSign className="size-4" /></Button></TooltipTrigger><TooltipContent>O preço é padronizado e não pode ser alterado.</TooltipContent></Tooltip></span></div></div>
    </fieldset>
    {banner ? <div className="space-y-2"><Button type="button" className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" onClick={onWallet}><banner.icon />{banner.action}</Button><p className="text-center text-xs text-muted-foreground">A publicação de caronas será liberada após a verificação da carteira.</p></div> : <Button className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" disabled={!canPublish}><Plus />Publicar carona</Button>}
  </form></div><section><SectionTitle title="Caronas publicadas" description="Conclua a corrida ao chegar para poder avaliar quem embarcou." /><div className="space-y-3">{own.map((ride) => {
    const finished = ride.status === "Concluída";
    const approvedCount = requests.filter((request) => request.rideId === ride.id && request.status === "Aprovada").length;
    return <article key={ride.id} className={`${glass} p-4`}><div className="flex justify-between"><div><b className="text-sm">{ride.origin}</b><p className="mt-1 text-xs text-muted-foreground">até {ride.destination}</p></div><Status value={ride.status} label={rideStatusLabel(ride.status)} /></div>
      {finished ? <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-success"><Check className="size-4 shrink-0" />Corrida concluída. Obrigado por dirigir!</div> : <>
        {approvedCount > 0 && <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="size-3.5" />{approvedCount} passageira{approvedCount > 1 ? "s" : ""} confirmada{approvedCount > 1 ? "s" : ""} a bordo</p>}
        <div className="mt-4 space-y-3"><p className="text-sm font-bold">{ride.time} · {ride.seats} vagas</p><div className="flex flex-wrap items-center gap-2">{ride.status === "Em andamento" ? <Button className="gap-1.5 rounded-full bg-success px-3 text-white hover:bg-success/90" onClick={() => onFinish(ride.id)}><CheckCheck className="size-4" />Concluir viagem</Button> : <><Button className="gap-1.5 rounded-full bg-primary-gradient px-3 shadow-primary" onClick={() => onStart(ride.id)}><Navigation className="size-4" />Iniciar viagem</Button><Button variant="outline" className="gap-1.5 rounded-full px-3" onClick={() => onEdit(ride.id)}><Pencil className="size-4" />Editar</Button><Button variant="destructive" className="gap-1.5 rounded-full px-3" onClick={() => onCancel(ride.id)}><X className="size-4" />Cancelar</Button></>}</div>{ride.status === "Em andamento" && <p className="text-xs text-muted-foreground">Viagem em andamento. Conclua ao chegar ao destino.</p>}</div>
      </>}
    </article>;
  })}</div></section></div>;
}

function RequestsView({ requests, rides, users, driverId, onProfile, onApprove, onReject }: { requests: RideRequest[]; rides: Ride[]; users: User[]; driverId: string; onProfile: (id: string) => void; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  const relevant = requests.filter((request) => rides.some((ride) => ride.id === request.rideId && ride.driverId === driverId));
  return <div><SectionTitle title="Central de solicitações" description="Conheça cada estudante antes de confirmar a vaga." />{relevant.length ? <div className="space-y-3">{relevant.map((request) => { const passenger = users.find((user) => user.id === request.passengerId); const ride = rides.find((item) => item.id === request.rideId); if (!passenger || !ride) return null; return <article key={request.id} className={`${glass} p-4`}><Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-2xl p-0 text-left" onClick={() => onProfile(request.id)}><UserAvatar user={passenger} className="size-12" /><div className="min-w-0 flex-1"><b className="block truncate">{passenger.name}</b><p className="mt-1 truncate text-xs text-muted-foreground">{passenger.course} · ★ {passenger.rating}</p></div><ChevronRight /></Button><div className="my-4 rounded-2xl bg-muted/70 p-3 text-xs"><b>{ride.time}</b><p className="mt-1 break-words text-muted-foreground">{ride.origin} → {ride.destination}</p></div><div className="flex items-center gap-2"><Status value={request.status} label={requestStatusLabel(request.status)} />{request.status === "Pendente" && <><Button variant="outline" className="ml-auto rounded-full" onClick={() => onReject(request.id)}>Recusar</Button><Button className="rounded-full" onClick={() => onApprove(request.id)}><Check />Aprovar vaga</Button></>}</div></article>; })}</div> : <EmptyState icon={Users} title="Nenhum pedido por enquanto" text="Quando alguém solicitar uma vaga, você verá aqui." />}</div>;
}

function TrackingView({ ride, driver, finished, onFinish }: { ride?: Ride; driver?: User; finished?: { ride: Ride; driver: User } | null; onFinish: () => void }) {
  const [progress, setProgress] = useState(48);
  const [arriving, setArriving] = useState(false);
  if (!ride) {
    if (finished) return <div><SectionTitle title="Acompanhamento ao vivo" description="Sua última viagem." /><section className={`${glass} grid place-items-center gap-3 p-10 text-center`}><span className="grid size-16 place-items-center rounded-3xl bg-success-soft text-success"><Check className="size-7" /></span><div><b className="block text-lg">Viagem concluída!</b><p className="mt-2 max-w-[16rem] text-sm text-muted-foreground">{finished.ride.origin} → {finished.ride.destination}</p><p className="mt-1 text-sm text-muted-foreground">com {finished.driver.name} · R$ 6,00</p></div><Badge className="rounded-full bg-success-soft text-success">Concluída</Badge></section></div>;
    return <div><SectionTitle title="Acompanhamento ao vivo" description="Nenhuma carona em andamento." /><EmptyState icon={Navigation} title="Nada por aqui ainda" text="Quando uma vaga for aprovada e paga, você poderá acompanhar a carona aqui." /></div>;
  }
  return <div><SectionTitle title="Acompanhamento ao vivo" description={`${ride.origin} → ${ride.destination}`} /><section className="relative min-h-[620px] overflow-hidden rounded-3xl bg-map shadow-xl"><svg viewBox="0 0 430 640" className="absolute inset-0 h-full w-full" role="img" aria-label="Mapa ilustrado do trajeto em Belo Horizonte"><path d="M-20 95 C90 40 140 155 240 100 S360 25 470 90 M-10 315 C120 260 195 370 450 250 M40 560 C150 470 255 585 460 470 M70 -30 C115 120 50 265 135 690 M330 -20 C280 160 390 315 310 690" className="stroke-map-road" fill="none" strokeWidth="18" /><path d="M70 530 C140 445 120 350 230 315 S250 180 355 115" className="route-glow stroke-primary" fill="none" strokeLinecap="round" strokeWidth="7" /><circle cx="70" cy="530" r="9" className="fill-success" /><circle cx="355" cy="115" r="9" className="fill-primary" /><g className="car-marker" transform={`translate(${70 + progress * 2.85} ${530 - progress * 4.15})`}><circle r="23" className="fill-primary/20 animate-ping" /><circle r="17" className="fill-primary" /><path d="M-8 3h16l-2-9H-5z" className="fill-primary-foreground" /></g></svg><div className="absolute left-4 right-4 top-4 flex items-center gap-3 rounded-full bg-live px-4 py-3 text-live-foreground shadow-lg"><span className="size-2.5 animate-pulse rounded-full bg-live-foreground" /><b className="text-sm">A 8 min do ponto de embarque</b></div><div className="glass-card absolute inset-x-3 bottom-3 rounded-3xl p-4">{driver && <div className="flex items-center gap-3"><UserAvatar user={driver} className="size-12" /><div className="min-w-0 flex-1"><b className="block truncate">{driver.name}</b><p className="text-xs text-muted-foreground">{driver.vehicle ? `${driver.vehicle.model} · ${driver.vehicle.color}` : ride.vehicle}</p><p className="mt-1 text-xs font-bold">{driver.vehicle?.plate ?? ride.plate} · ★ {driver.rating.toFixed(1)}</p></div><Button variant="destructive" size="icon" className="rounded-full" onClick={() => toast.error("Contato de emergência acionado na simulação.")} aria-label="Acionar emergência"><Phone /></Button></div>}<div className="mt-4"><div className="mb-2 flex justify-between text-xs"><span>Progresso do trajeto</span><b>{progress}%</b></div><Progress value={progress} className="h-2" /></div><Button className="mt-4 h-11 w-full rounded-full" disabled={arriving} onClick={() => { setArriving(true); setProgress(100); window.setTimeout(onFinish, 450); }}>{arriving ? <LoaderCircle className="animate-spin" /> : <Check />}{arriving ? "Chegando..." : "Simular chegada"}</Button></div></section></div>;
}

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function TripRow({ ride, companionName, isDriver, onReceipt }: { ride: Ride; companionName?: string; isDriver: boolean; onReceipt: () => void }) {
  return <button type="button" onClick={onReceipt} className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-success-soft text-success"><Check /></span><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold leading-snug">{ride.origin} → {ride.destination}</p><p className="truncate text-xs text-muted-foreground">{formatShortDate(ride.date)}{companionName ? ` · ${isDriver ? "com" : "por"} ${companionName}` : ""} · R$ 6,00</p></div><span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"><ReceiptText className="size-3.5" />Ver</span></button>;
}

function DashboardView({ isDesktop, user, rides, requests, users, onReceipt, onSeeAll, onReviews, reviewCount }: { isDesktop: boolean; user: User; rides: Ride[]; requests: RideRequest[]; users: User[]; onReceipt: (id: string) => void; onSeeAll: () => void; onReviews: () => void; reviewCount: number }) {
  const driver = user.type === "motorista";
  const trips = useMemo(() => tripsForUser(user, rides, requests, users), [user, rides, requests, users]);
  const recent = trips.slice(0, 3);
  const weekdayCounts = useMemo(() => weekdayLabels.map((_, index) => trips.filter(({ ride }) => weekday(ride.date) === index).length), [trips]);
  const maxCount = Math.max(1, ...weekdayCounts);
  return <div>{!isDesktop && <SectionTitle title={driver ? "Resumo do motorista" : "Resumo da passageira"} description="Seu impacto na mobilidade universitária." />}<div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
    <div><section className={`${glass} mb-4 grid place-items-center p-6 text-center`}><div className="gauge relative grid size-44 place-items-center rounded-full"><div className="grid size-32 place-items-center rounded-full bg-card"><div>{driver ? <Car className="mx-auto mb-2 text-primary" /> : <Sparkles className="mx-auto mb-2 text-primary" />}<b className="block text-2xl">{driver ? "R$ 420,00" : "R$ 195,00"}</b><span className="mx-auto mt-1 block max-w-24 text-xs text-muted-foreground">{driver ? "total arrecadado" : "economia estimada no mês"}</span></div></div></div>{!driver && <Popover><PopoverTrigger asChild><button type="button" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-primary"><CircleHelp className="size-3.5" />Como calculamos isso?</button></PopoverTrigger><PopoverContent className="w-64 rounded-2xl text-sm text-muted-foreground">Estimativa com base na diferença entre o valor médio de uma corrida por aplicativo e a tarifa fixa de R$ 6,00 da UniCarona, considerando suas caronas concluídas no mês.</PopoverContent></Popover>}</section><div className="grid grid-cols-3 gap-2"><Metric icon={Car} value={driver ? "32" : String(user.completedRides)} label={driver ? "Caronas oferecidas" : "Caronas concluídas"} /><Metric icon={driver ? Users : CircleDollarSign} value={driver ? "78" : "R$ 96"} label={driver ? "Passageiros" : "Total investido"} tint="blue" /><Metric icon={Star} value={driver ? "4,9" : "5,0"} label="Nota média" tint="lime" /></div><button type="button" onClick={onReviews} className={`${glass} mt-3 flex w-full items-center gap-3 p-4 text-left transition hover:shadow-lg`}><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-300/20 text-lime-400"><Star className="size-5 fill-lime-400" /></span><div className="min-w-0 flex-1"><b className="block text-sm">Ver avaliações recebidas</b><p className="truncate text-xs text-muted-foreground">{reviewCount > 0 ? `${reviewCount} avaliaç${reviewCount > 1 ? "ões" : "ão"} de outros estudantes` : "Ainda sem avaliações"}</p></div><ChevronRight className="shrink-0 text-muted-foreground" /></button></div>
    <div><section className={`${glass} mt-4 p-4 lg:mt-0`}><div className="flex items-center justify-between"><b>Viagens concluídas por dia da semana</b><Badge variant="secondary" className="rounded-full text-center py-1">Histórico completo</Badge></div>{trips.length ? <div className="mt-6 flex h-36 items-end gap-2">{weekdayCounts.map((count, index) => <div key={weekdayLabels[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"><span className="text-[11px] font-bold text-foreground">{count}</span><div className="bar-fill w-full rounded-full" style={{ height: `${Math.max(6, (count / maxCount) * 100)}%` }} /><span className="text-center text-[10px] text-muted-foreground">{weekdayLabels[index]}</span></div>)}</div> : <p className="mt-6 text-center text-sm text-muted-foreground">Conclua viagens para ver em quais dias você mais roda.</p>}</section><section className={`${glass} mt-4 p-4`}><div className="flex items-center justify-between"><b>Viagens recentes</b>{trips.length > 3 && <Button variant="ghost" className="rounded-full px-3 text-primary" onClick={onSeeAll}>Ver mais</Button>}</div>{recent.length ? <div className="mt-3 space-y-2">{recent.map(({ ride, companionName }) => <TripRow key={ride.id} ride={ride} companionName={companionName} isDriver={driver} onReceipt={() => onReceipt(ride.id)} />)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">Suas viagens concluídas vão aparecer aqui.</p>}</section></div>
  </div></div>;
}

function ProfileView({ isDesktop, user, theme, onTheme, onEdit, onWallet, onSwitch, onReset, onLogout, onDelete, onHelp, onChangePassword }: { isDesktop: boolean; user: User; theme: "light" | "dark"; onTheme: (dark: boolean) => void; onEdit: () => void; onWallet: () => void; onSwitch: (id: "bruno" | "camila") => void; onReset: () => void; onLogout: () => void; onDelete: () => void; onHelp: () => void; onChangePassword: () => void }) {
  const isDriver = user.type === "motorista";
  return <div>{!isDesktop && <SectionTitle title="Meu perfil" description="Sua identidade na comunidade UniCarona." />}<div className="lg:grid lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-6">
    <section className={`${glass} p-5 text-center`}><UserAvatar user={user} className="mx-auto size-24" /><h2 className="mt-4 text-xl font-extrabold">{user.name}</h2><p className="mt-1 text-sm text-muted-foreground">{user.course} · {user.university}</p><p className="mt-1 text-sm text-muted-foreground">{user.phone}</p><Badge className="mt-3 rounded-full bg-success-soft text-success"><ShieldCheck />Estudante verificado</Badge><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/70 p-3"><b>{user.rating} ★</b><p className="text-xs text-muted-foreground">Avaliação</p></div><div className="rounded-2xl bg-muted/70 p-3"><b>{user.completedRides}</b><p className="text-xs text-muted-foreground">Caronas concluídas</p></div></div><Button variant="outline" className="mt-4 w-full rounded-full" onClick={onEdit}><Pencil />Editar perfil</Button></section>
    <div className="mt-4 space-y-4 lg:mt-0">
    <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 space-y-4">
    <section className={`${glass} p-4`}><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary"><Mail /></span><div className="min-w-0 flex-1"><b className="text-sm">E-mail acadêmico</b><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div></section>
    <section className={`${glass} p-4`}><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">{theme === "dark" ? <Moon /> : <Sun />}</span><div className="flex-1"><b className="text-sm">Aparência</b><p className="text-xs text-muted-foreground">{theme === "dark" ? "Tema escuro" : "Tema claro"}</p></div><Switch checked={theme === "dark"} onCheckedChange={onTheme} aria-label="Alternar tema escuro" /></div></section>
    </div>
    {isDriver && <button type="button" onClick={onWallet} className={`${glass} block w-full p-4 text-left transition hover:shadow-lg`}><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky"><WalletCards /></span><div className="min-w-0 flex-1"><b className="text-sm">Carteira digital</b><p className="truncate text-xs text-muted-foreground">{user.wallet?.status === "verificada" && user.wallet.pixKey ? `${user.wallet.pixKey.type} · ${user.wallet.pixKey.value}` : "Recebimentos via Asaas"}</p></div><Badge className={`shrink-0 rounded-full border-0 px-3 py-1 text-[11px] shadow-none ${walletStatusTint(user.wallet?.status)}`}>{walletStatusLabel(user.wallet?.status)}</Badge><ChevronRight className="shrink-0 text-muted-foreground" /></div></button>}
    <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 space-y-4">
    <section className={`${glass} p-4`}><div className="mb-4"><p className="text-xs font-bold uppercase text-primary">Visualização</p><h3 className="mt-1 font-bold">Escolha uma perspectiva</h3><p className="mt-1 text-xs text-muted-foreground">Alterne sua visão entre motorista e passageiro quando quiser.</p></div><div className="rounded-full bg-muted p-1"><div className="grid grid-cols-2 gap-1"><Button variant="ghost" className={`h-14 rounded-full text-xs ${user.id === "bruno" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`} onClick={() => onSwitch("bruno")}><Car />Motorista</Button><Button variant="ghost" className={`h-14 rounded-full text-xs ${user.id === "camila" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`} onClick={() => onSwitch("camila")}><UserRound />Passageiro</Button></div></div><Button variant="ghost" className="mt-3 w-full rounded-full text-xs text-muted-foreground" onClick={onReset}><RefreshCw />Restaurar dados da demonstração</Button></section>
    <section className={`${glass} space-y-2 p-3`}><Button variant="ghost" className="w-full justify-start rounded-2xl" onClick={onHelp}><CircleHelp />Central de ajuda</Button><Button variant="ghost" className="w-full justify-start rounded-2xl" onClick={onChangePassword}><KeyRound />Alterar senha</Button><Button variant="ghost" className="w-full justify-start rounded-2xl" onClick={onLogout}><LogOut />Sair da conta</Button><Button variant="ghost" className="w-full justify-start rounded-2xl text-destructive hover:text-destructive" onClick={onDelete}><Trash2 />Excluir conta</Button></section>
    </div>
    </div>
  </div></div>;
}

const walletSteps: { key: WalletStatus; label: string }[] = [
  { key: "nao_criada", label: "Criar carteira" },
  { key: "documentos_pendentes", label: "Enviar documentos" },
  { key: "em_analise", label: "Em análise" },
  { key: "verificada", label: "Verificada" },
];

function WalletStepper({ status }: { status: WalletStatus }) {
  const stepIndex = status === "rejeitada" ? 1 : walletSteps.findIndex((step) => step.key === status);
  return <div className="mb-6 flex items-center">{walletSteps.map((step, index) => <div key={step.key} className="flex flex-1 items-center gap-2 last:flex-none">
    <div className="flex flex-col items-center gap-1.5">
      <div className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index < stepIndex ? "bg-success text-white" : index === stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index < stepIndex ? <Check className="size-4" /> : index + 1}</div>
      <span className="hidden text-center text-[10px] font-medium text-muted-foreground sm:block">{step.label}</span>
    </div>
    {index < walletSteps.length - 1 && <div className={`h-1 flex-1 rounded-full ${index < stepIndex ? "bg-success" : "bg-muted"}`} />}
  </div>)}</div>;
}

function DocumentUpload({ icon: Icon, title, hint, done, busy, onUpload }: { icon: typeof IdCard; title: string; hint: string; done: boolean; busy: boolean; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <label className={`${glass} flex cursor-pointer items-center gap-3 p-4 transition ${done ? "" : "hover:shadow-lg"}`}>
    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${done ? "bg-success-soft text-success" : "bg-secondary text-primary"}`}>{busy ? <LoaderCircle className="size-5 animate-spin" /> : done ? <Check className="size-5" /> : <Icon className="size-5" />}</span>
    <div className="min-w-0 flex-1"><b className="block text-sm">{title}</b><p className="truncate text-xs text-muted-foreground">{done ? "Enviado" : hint}</p></div>
    {!done && <Upload className="size-4 shrink-0 text-muted-foreground" />}
    <input className="sr-only" type="file" accept="image/*" onChange={onUpload} disabled={done || busy} />
  </label>;
}

function CarteiraView({ isDesktop, user, onCreate, onUploadDocument, onSubmitReview, onSimulateDecision, onRetry, onUpdatePixKey, onPublish }: {
  isDesktop: boolean; user: User; onCreate: (cpf: string, birthDate: string, pixKey: PixKey) => void; onUploadDocument: (type: "documento" | "selfie") => void;
  onSubmitReview: () => void; onSimulateDecision: (approved: boolean) => void; onRetry: () => void; onUpdatePixKey: (pixKey: PixKey) => void; onPublish?: () => void;
}) {
  const wallet = user.wallet;
  const status: WalletStatus = wallet?.status ?? "nao_criada";
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pixType, setPixType] = useState<PixKeyType>("E-mail");
  const [pixValue, setPixValue] = useState(user.email);
  const [pixBank, setPixBank] = useState("");
  const [creating, setCreating] = useState(false);
  const canCreate = cpf.replace(/\D/g, "").length === 11 && birthDate.length > 0 && pixValue.trim().length > 0 && pixBank.trim().length > 0;
  const createWallet = (event: FormEvent) => {
    event.preventDefault();
    if (!canCreate) { toast.error("Preencha o CPF, a data de nascimento e a chave PIX para continuar."); return; }
    setCreating(true);
    window.setTimeout(() => { setCreating(false); onCreate(cpf, birthDate, { type: pixType, value: pixValue.trim(), bank: pixBank.trim() }); }, 700);
  };

  const [uploading, setUploading] = useState<"documento" | "selfie" | null>(null);
  const upload = (type: "documento" | "selfie") => (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploading(type);
    window.setTimeout(() => { setUploading(null); onUploadDocument(type); toast.success(type === "documento" ? "Documento enviado." : "Selfie enviada."); }, 600);
  };
  const bothDocumentsSent = Boolean(wallet?.documents.documento && wallet?.documents.selfie);

  const [editingPix, setEditingPix] = useState(false);
  const [editType, setEditType] = useState<PixKeyType>(wallet?.pixKey?.type ?? "E-mail");
  const [editValue, setEditValue] = useState(wallet?.pixKey?.value ?? "");
  const [editBank, setEditBank] = useState(wallet?.pixKey?.bank ?? "");
  const openEditPix = () => { setEditType(wallet?.pixKey?.type ?? "E-mail"); setEditValue(wallet?.pixKey?.value ?? ""); setEditBank(wallet?.pixKey?.bank ?? ""); setEditingPix(true); };
  const savePix = () => { if (!editValue.trim() || !editBank.trim()) { toast.error("Informe a chave PIX e o banco."); return; } onUpdatePixKey({ type: editType, value: editValue.trim(), bank: editBank.trim() }); setEditingPix(false); };

  return <div className="lg:mx-auto lg:max-w-2xl">
    {!isDesktop && <SectionTitle title="Carteira digital" description="Crie sua carteira Asaas para receber os pagamentos das suas caronas via PIX." />}
    <WalletStepper status={status} />

    {status === "nao_criada" && <form onSubmit={createWallet} className={`${glass} space-y-4 p-5`}>
      <div className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4"><IdCard className="mt-0.5 shrink-0 text-primary" /><div><b className="text-sm">Antes de tudo, crie sua carteira</b><p className="mt-1 text-xs text-muted-foreground">Ela é obrigatória para publicar caronas. Depois de criada, você envia seus documentos para verificação.</p></div></div>
      <Field label="CPF"><Input className={fieldClass} value={cpf} onChange={(event) => setCpf(maskCPF(event.target.value))} placeholder="000.000.000-00" /></Field>
      <Field label="Data de nascimento"><Input className={fieldClass} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></Field>
      <PixKeyFields type={pixType} value={pixValue} bank={pixBank} onType={setPixType} onValue={setPixValue} onBank={setPixBank} />
      <p className="flex items-center gap-2 rounded-2xl bg-muted/70 p-3 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-success" />Nenhum dado bancário real será usado nesta simulação.</p>
      <Button className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" disabled={creating}>{creating ? <LoaderCircle className="animate-spin" /> : <WalletCards />}{creating ? "Criando carteira..." : "Criar carteira"}</Button>
    </form>}

    {status === "documentos_pendentes" && <div className="space-y-4">
      <div className={`${glass} flex items-start gap-3 p-4`}><Upload className="mt-0.5 shrink-0 text-primary" /><div><b className="text-sm">Envie seus documentos</b><p className="mt-1 text-xs text-muted-foreground">Precisamos verificar sua identidade antes de liberar o recebimento de pagamentos.</p></div></div>
      <DocumentUpload icon={IdCard} title="Documento com foto" hint="RG ou CNH" done={Boolean(wallet?.documents.documento)} busy={uploading === "documento"} onUpload={upload("documento")} />
      <DocumentUpload icon={Camera} title="Selfie com o documento" hint="Segure o documento próximo ao rosto" done={Boolean(wallet?.documents.selfie)} busy={uploading === "selfie"} onUpload={upload("selfie")} />
      <Button className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" disabled={!bothDocumentsSent} onClick={onSubmitReview}><ShieldCheck />Enviar para verificação</Button>
    </div>}

    {status === "em_analise" && <div className={`${glass} grid place-items-center gap-3 p-10 text-center`}>
      <span className="grid size-16 place-items-center rounded-3xl bg-live text-live-foreground"><Hourglass className="size-7" /></span>
      <div><b className="block text-lg">Documentos em análise</b><p className="mt-2 max-w-xs text-sm text-muted-foreground">A Asaas está verificando seus documentos. Isso costuma levar até 1 dia útil.</p></div>
      <Badge className="rounded-full bg-live text-live-foreground">Enviado {wallet?.submittedAt}</Badge>
      <div className="mt-4 flex w-full flex-col gap-2 border-t border-border/60 pt-4">
        <p className="text-xs text-muted-foreground">Ambiente de demonstração: simule o resultado da verificação.</p>
        <Button className="h-11 w-full rounded-full bg-success text-white hover:bg-success/90" onClick={() => onSimulateDecision(true)}><Check />Simular aprovação</Button>
        <Button variant="outline" className="h-11 w-full rounded-full text-destructive hover:text-destructive" onClick={() => onSimulateDecision(false)}><X />Simular recusa</Button>
      </div>
    </div>}

    {status === "rejeitada" && <div className={`${glass} space-y-4 p-5`}>
      <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 text-destructive"><ShieldAlert className="mt-0.5 shrink-0" /><div><b className="text-sm">Verificação recusada</b><p className="mt-1 text-xs">{wallet?.rejectionReason}</p></div></div>
      <Button className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" onClick={onRetry}><Upload />Reenviar documentos</Button>
    </div>}

    {status === "verificada" && wallet && <div className="space-y-4">
      <div className={`${glass} p-5 text-center`}>
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-success-soft text-success"><ShieldCheck className="size-7" /></span>
        <b className="mt-4 block text-lg">Carteira verificada</b>
        <p className="mt-1 text-sm text-muted-foreground">Você já pode receber pagamentos e publicar caronas.</p>
        <p className="mt-3 text-xs text-muted-foreground">Conta Asaas: {wallet.asaasAccountId}</p>
        {onPublish && <Button className="mt-5 h-11 w-full rounded-full bg-primary-gradient shadow-primary" onClick={onPublish}><Plus />Publicar carona</Button>}
      </div>
      <section className={`${glass} p-4`}>
        <div className="flex items-center justify-between"><b className="text-sm">Chave PIX de recebimento</b>{!editingPix && <Button variant="ghost" size="sm" className="rounded-full text-primary" onClick={openEditPix}><Pencil />Editar</Button>}</div>
        {editingPix ? <div className="mt-4 space-y-4">
          <PixKeyFields type={editType} value={editValue} bank={editBank} onType={setEditType} onValue={setEditValue} onBank={setEditBank} />
          <div className="flex gap-2"><Button variant="outline" className="flex-1 rounded-full" onClick={() => setEditingPix(false)}>Cancelar</Button><Button className="flex-1 rounded-full" onClick={savePix}>Salvar</Button></div>
        </div> : <div className="mt-3 flex items-center gap-3 rounded-2xl bg-muted/70 p-3"><Landmark className="size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="text-sm font-semibold">{wallet.pixKey?.type} · {wallet.pixKey?.value}</p><p className="text-xs text-muted-foreground">{wallet.pixKey?.bank}</p></div></div>}
      </section>
    </div>}
  </div>;
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) { return <div className={`${glass} grid place-items-center px-6 py-12 text-center`}><span className="grid size-14 place-items-center rounded-3xl bg-muted text-muted-foreground"><Icon /></span><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>; }
function dialogClass() { return "glass-dialog max-w-[calc(100%-2rem)] rounded-3xl border-white/30 sm:max-w-md"; }

function ReviewsList({ reviews, authors }: { reviews: Review[]; authors: User[] }) {
  if (!reviews.length) return <p className="rounded-2xl bg-muted/70 p-4 text-center text-sm text-muted-foreground">Ainda sem avaliações por aqui.</p>;
  return <div className="space-y-2">{reviews.slice().reverse().map((review) => { const author = authors.find((person) => person.id === review.authorId); return <div key={review.id} className="rounded-2xl bg-muted/70 p-3"><div className="flex items-center justify-between gap-2"><b className="truncate text-sm">{author?.name ?? "Estudante da UniCarona"}</b><span className="flex shrink-0 items-center gap-1 text-xs font-bold text-warning"><Star className="size-3.5 fill-warning" />{review.rating.toFixed(1)}</span></div>{review.comment && <p className="mt-1 text-sm text-muted-foreground">“{review.comment}”</p>}</div>; })}</div>;
}

function PersonDialog({ open, person, title, reviews, users, onClose }: { open: boolean; person?: User; title: string; reviews: Review[]; users: User[]; onClose: () => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={`${dialogClass()} max-h-[85vh] overflow-y-auto`}>{person && <><DialogHeader><div className="flex items-center gap-4"><UserAvatar user={person} className="size-16" /><div><DialogTitle>{person.name}</DialogTitle><DialogDescription>{person.course} · {person.university}</DialogDescription></div></div></DialogHeader><Badge className="w-fit rounded-full bg-success-soft text-success"><ShieldCheck />Perfil acadêmico verificado</Badge><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/70 p-3 text-center"><b>{person.rating} ★</b><p className="text-xs text-muted-foreground">Avaliação</p></div><div className="rounded-2xl bg-muted/70 p-3 text-center"><b>{person.completedRides}</b><p className="text-xs text-muted-foreground">Caronas</p></div></div>{person.vehicle && <div className="rounded-2xl border border-border/70 p-4"><b className="text-sm">Veículo</b><p className="mt-1 text-sm text-muted-foreground">{person.vehicle.model} · {person.vehicle.color} · {person.vehicle.plate}</p></div>}<div><b className="text-sm">Avaliações recebidas</b><div className="mt-2"><ReviewsList reviews={reviews.filter((review) => review.targetId === person.id)} authors={users} /></div></div></>}</DialogContent></Dialog>; }

function ReviewsDialog({ open, title, reviews, users, onClose }: { open: boolean; title: string; reviews: Review[]; users: User[]; onClose: () => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={`${dialogClass()} max-h-[80vh] overflow-y-auto`}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>O que outros estudantes disseram sobre as viagens.</DialogDescription></DialogHeader><ReviewsList reviews={reviews} authors={users} /></DialogContent></Dialog>; }

function RequestDialog({ open, ride, driver, onClose, onConfirm }: { open: boolean; ride?: Ride; driver?: User; onClose: () => void; onConfirm: () => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Solicitar esta vaga?</DialogTitle><DialogDescription>Confira os detalhes antes de enviar seu pedido.</DialogDescription></DialogHeader>{ride && <div className="space-y-3 rounded-2xl bg-muted/70 p-4 text-sm"><p><b>Motorista:</b> {driver?.name}</p><p><b>Saída:</b> {ride.origin}</p><p><b>Destino:</b> {ride.destination}</p><p><b>Embarque:</b> {ride.date.split("-").reverse().join("/")} às {ride.time}</p><div className="flex justify-between border-t border-border/60 pt-3 text-base"><b>Total</b><b className="text-primary">R$ 6,00</b></div></div>}<DialogFooter><Button variant="outline" className="rounded-full" onClick={onClose}>Agora não</Button><Button className="rounded-full" onClick={onConfirm}>Confirmar pedido</Button></DialogFooter></DialogContent></Dialog>; }

function PixDialog({ open, request, ride, driver, now, onClose, onConfirm }: { open: boolean; request?: RideRequest; ride?: Ride; driver?: User; now: number; onClose: () => void; onConfirm: () => void }) {
  const remainingMs = request?.paymentDeadline ? request.paymentDeadline - now : 0;
  const expired = !request || remainingMs <= 0;
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Pagar com PIX</DialogTitle><DialogDescription>{driver ? `Confirme o pagamento para garantir sua vaga com ${driver.name}.` : "Confirme o pagamento para garantir sua vaga."}</DialogDescription></DialogHeader><div className="text-center"><Badge className={`rounded-full ${expired ? "bg-destructive/10 text-destructive" : "bg-live text-live-foreground"}`}><Clock3 />{expired ? "Tempo esgotado" : formatCountdown(remainingMs)}</Badge><div className="qr-mock mx-auto my-5 grid size-44 place-items-center rounded-3xl bg-foreground p-3 text-background"><QrCode className="size-36" /></div><b className="text-2xl">R$ 6,00</b>{driver?.wallet?.pixKey ? <p className="mt-1 truncate text-xs text-muted-foreground">Chave de {driver.name.split(" ")[0]}: {driver.wallet.pixKey.value} · {driver.wallet.pixKey.bank}</p> : <p className="mt-1 text-sm text-muted-foreground">Pague no app do seu banco em até 10 minutos.</p>}</div><Button className="h-12 w-full rounded-full" disabled={expired} onClick={() => toast.success("Código PIX copiado! Cole no app do seu banco para pagar.")}><Copy />Copiar código PIX</Button><Button className="h-12 w-full rounded-full bg-primary-gradient shadow-primary" disabled={expired} onClick={onConfirm}><Check />Já paguei, confirmar</Button>{expired && <p className="text-center text-xs text-destructive">Sua vaga foi liberada. Envie uma nova solicitação para tentar de novo.</p>}</DialogContent></Dialog>;
}

function PixKeyFields({ type, value, bank, onType, onValue, onBank }: { type: PixKeyType; value: string; bank: string; onType: (type: PixKeyType) => void; onValue: (value: string) => void; onBank: (bank: string) => void }) {
  const placeholder = type === "CPF" ? "000.000.000-00" : type === "Telefone" ? "(31) 99999-9999" : type === "Aleatória" ? "Chave aleatória gerada pelo banco" : "seu.email@banco.com";
  const keyTypes: PixKeyType[] = ["CPF", "E-mail", "Telefone", "Aleatória"];
  return <><Field label="Tipo de chave PIX"><Select value={type} onValueChange={(next) => onType(next as PixKeyType)}><SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{keyTypes.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></Field><Field label="Chave PIX"><Input className={fieldClass} value={value} onChange={(event) => onValue(type === "Telefone" ? maskPhone(event.target.value) : event.target.value)} placeholder={placeholder} /></Field><Field label="Banco"><Input className={fieldClass} value={bank} onChange={(event) => onBank(event.target.value)} placeholder="Nome do banco" /></Field></>;
}

function ProfileDialog({ open, user, onClose, onSave }: { open: boolean; user: User; onClose: () => void; onSave: (values: Partial<User>) => void }) { const [name, setName] = useState(user.name); const [phone, setPhone] = useState(user.phone); const [bio, setBio] = useState(user.bio); const [photo, setPhoto] = useState(user.photo); useEffect(() => { if (open) { setName(user.name); setPhone(user.phone); setBio(user.bio); setPhoto(user.photo); } }, [open, user]); const upload = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : undefined); reader.readAsDataURL(file); }; return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Editar perfil</DialogTitle><DialogDescription>Atualize os dados visíveis para outros estudantes.</DialogDescription></DialogHeader><label className="mx-auto cursor-pointer text-center"><Avatar className="mx-auto size-20"><AvatarImage src={photo} /><AvatarFallback>{initials(name)}</AvatarFallback></Avatar><span className="mt-2 flex items-center gap-1 text-xs font-bold text-primary"><Camera className="size-3" />Alterar foto</span><input type="file" accept="image/*" className="sr-only" onChange={upload} /></label><Field label="Nome completo"><Input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label="Telefone"><Input className={fieldClass} value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} /></Field><Field label="Sobre você"><Textarea className="min-h-24 rounded-3xl bg-background/60" value={bio} onChange={(event) => setBio(event.target.value)} /></Field><DialogFooter><Button variant="outline" className="rounded-full" onClick={onClose}>Cancelar</Button><Button className="rounded-full" disabled={!name.trim() || phone.length < 15} onClick={() => { if (!name.trim() || phone.length < 15) { toast.error("Informe nome e telefone completos."); return; } onSave({ name: name.trim(), phone, bio, photo }); }}>Salvar alterações</Button></DialogFooter></DialogContent></Dialog>; }

function EditRideDialog({ open, ride, onClose, onSave }: { open: boolean; ride?: Ride; onClose: () => void; onSave: (ride: Ride) => void }) { const [time, setTime] = useState(ride?.time ?? "07:20"); const [seats, setSeats] = useState(String(ride?.seats ?? 2)); useEffect(() => { if (open && ride) { setTime(ride.time); setSeats(String(ride.seats)); } }, [open, ride]); return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Editar carona</DialogTitle><DialogDescription>Altere horário e vagas. O valor permanece fixo.</DialogDescription></DialogHeader><Field label="Horário"><Input className={fieldClass} type="time" value={time} onChange={(event) => setTime(event.target.value)} /></Field><Field label="Vagas"><Select value={seats} onValueChange={setSeats}><SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4].map((amount) => <SelectItem key={amount} value={String(amount)}>{amount} {amount === 1 ? "vaga" : "vagas"}</SelectItem>)}</SelectContent></Select></Field><div className="rounded-2xl bg-muted p-3 text-sm"><span>Total por passageiro</span><b className="float-right text-primary">R$ 6,00</b></div><DialogFooter><Button variant="outline" className="rounded-full" onClick={onClose}>Cancelar</Button><Button className="rounded-full" onClick={() => ride && onSave({ ...ride, time, seats: Number(seats) })}>Salvar carona</Button></DialogFooter></DialogContent></Dialog>; }

function ReceiptDialog({ open, user, ride, companionName, onClose }: { open: boolean; user: User; ride?: Ride; companionName?: string; onClose: () => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Comprovante da carona</DialogTitle><DialogDescription>{ride ? `Viagem em ${formatFullDate(ride.date)}.` : "Detalhes da viagem."}</DialogDescription></DialogHeader><div className="space-y-3 rounded-2xl border border-border/70 p-4 text-sm"><div className="flex justify-between"><span>Estudante</span><b>{user.name}</b></div>{companionName && <div className="flex justify-between"><span>{user.type === "motorista" ? "Passageira" : "Motorista"}</span><b>{companionName}</b></div>}<div className="flex justify-between gap-3"><span className="shrink-0">Trajeto</span><b className="text-right">{ride ? `${ride.origin} → ${ride.destination}` : "—"}</b></div><div className="flex justify-between"><span>Tarifa fixa</span><b>R$ 5,25</b></div><div className="flex justify-between"><span>Taxa de serviço</span><b>R$ 0,75</b></div><div className="flex justify-between border-t border-border/60 pt-3 text-base"><b>Total pago</b><b className="text-primary">R$ 6,00</b></div></div><Button className="w-full rounded-full" onClick={() => toast.success("Comprovante salvo na simulação.")}><Download />Baixar comprovante</Button></DialogContent></Dialog>; }

function RatePersonDialog({ open, person, role, ride, onClose, onSubmit }: { open: boolean; person?: User; role: "motorista" | "passageira"; ride?: Ride; onClose: () => void; onSubmit: (stars: number, comment: string) => void }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  useEffect(() => { if (open) { setStars(5); setComment(""); } }, [open]);
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Como foi sua viagem?</DialogTitle><DialogDescription className="truncate">Avalie {person?.name ?? `sua ${role}`} para ajudar a comunidade.</DialogDescription></DialogHeader>{person && <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-muted/70 p-3"><UserAvatar user={person} /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{person.name}</b><p className="truncate text-xs text-muted-foreground">{ride ? `${ride.origin} → ${ride.destination}` : person.vehicle?.model}</p></div></div>}<div className="flex justify-center gap-1 py-2 sm:gap-2">{[1, 2, 3, 4, 5].map((amount) => <button key={amount} type="button" onClick={() => setStars(amount)} aria-label={`${amount} estrela${amount > 1 ? "s" : ""}`}><Star className={`size-8 transition-colors sm:size-9 ${amount <= stars ? "fill-warning text-warning" : "text-muted-foreground"}`} /></button>)}</div><Textarea className="min-h-20 w-full rounded-3xl bg-background/60" placeholder="Conte como foi o trajeto (opcional)" value={comment} onChange={(event) => setComment(event.target.value)} /><DialogFooter><Button variant="ghost" className="rounded-full" onClick={onClose}>Avaliar depois</Button><Button className="rounded-full" onClick={() => onSubmit(stars, comment)}><Star />Enviar avaliação</Button></DialogFooter></DialogContent></Dialog>;
}

function TripHistoryDialog({ open, isDriver, trips, onClose, onReceipt }: { open: boolean; isDriver: boolean; trips: { ride: Ride; companionName?: string }[]; onClose: () => void; onReceipt: (id: string) => void }) {
  const groups = useMemo(() => { const map = new Map<string, { ride: Ride; companionName?: string }[]>(); trips.forEach((trip) => { const key = monthLabel(trip.ride.date); if (!map.has(key)) map.set(key, []); map.get(key)!.push(trip); }); return Array.from(map.entries()); }, [trips]);
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={`${dialogClass()} min-w-0 max-h-[80vh] overflow-y-auto`}><DialogHeader><DialogTitle>Todas as viagens</DialogTitle><DialogDescription>Seu histórico completo, agrupado por mês.</DialogDescription></DialogHeader>{groups.length ? groups.map(([month, items]) => <div key={month} className="min-w-0"><p className="mb-2 mt-3 text-xs font-bold uppercase tracking-wide text-primary first:mt-0">{month}</p><div className="min-w-0 space-y-2">{items.map(({ ride, companionName }) => <TripRow key={ride.id} ride={ride} companionName={companionName} isDriver={isDriver} onReceipt={() => onReceipt(ride.id)} />)}</div></div>) : <EmptyState icon={Navigation} title="Nenhuma viagem concluída" text="Suas viagens finalizadas vão aparecer aqui." />}</DialogContent></Dialog>;
}

function NotificationsDialog({ open, notifications, onClose }: { open: boolean; notifications: { id: string; text: string; time: string }[]; onClose: () => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Notificações</DialogTitle><DialogDescription>Atualizações sobre suas caronas.</DialogDescription></DialogHeader><div className="space-y-2">{notifications.length ? notifications.map((item) => <div key={item.id} className="flex gap-3 rounded-2xl bg-muted/70 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Bell className="size-4" /></span><div><p className="text-sm font-medium">{item.text}</p><p className="mt-1 text-xs text-muted-foreground">{item.time}</p></div></div>) : <p className="py-8 text-center text-sm text-muted-foreground">Você está em dia por aqui.</p>}</div></DialogContent></Dialog>; }

const faqItems = [
  { q: "Como funciona o pagamento por PIX?", a: "Depois que o motorista aprova sua vaga, você tem 10 minutos para pagar. Toque em \"Pagar agora\" na tela inicial para ver o QR Code ou copiar o código PIX. Se o tempo esgotar, a vaga é liberada automaticamente." },
  { q: "Como funcionam as avaliações?", a: "Ao final de cada corrida, motorista e passageira podem avaliar um ao outro com estrelas e um comentário opcional. Também é possível avaliar depois, se preferir. As avaliações recebidas ficam disponíveis no Resumo, em \"Ver avaliações recebidas\"." },
  { q: "Posso cancelar uma solicitação ou carona?", a: "Sim. Como passageira, você pode cancelar uma solicitação ainda não aprovada direto na tela inicial. Como motorista, você pode cancelar uma carona publicada na aba Oferecer." },
  { q: "Como configuro meus recebimentos?", a: "Vá em Perfil > Carteira digital para criar sua carteira Asaas, enviar seus documentos e cadastrar a chave PIX que vai receber os pagamentos. A verificação dos documentos é obrigatória antes de publicar caronas como motorista." },
  { q: "O preço da carona pode mudar?", a: "Não. O valor é fixo em R$ 6,00 por vaga, para manter a simplicidade e a confiança entre os estudantes." },
];

function ChangePasswordDialog({ open, user, onClose, onSave }: { open: boolean; user: User; onClose: () => void; onSave: (password: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setCurrent(""); setNext(""); setConfirm(""); setError(""); } }, [open]);
  const submit = () => {
    if (current !== user.password) { setError("A senha atual informada está incorreta."); return; }
    if (next.length < 8) { setError("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (next !== confirm) { setError("As senhas informadas não coincidem."); return; }
    onSave(next);
  };
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={dialogClass()}><DialogHeader><DialogTitle>Alterar senha</DialogTitle><DialogDescription>Defina uma nova senha para acessar sua conta.</DialogDescription></DialogHeader>
    <Field label="Senha atual"><PasswordInput value={current} onChange={setCurrent} placeholder="Digite sua senha atual" /></Field>
    <Field label="Nova senha"><PasswordInput value={next} onChange={setNext} placeholder="Mínimo de 8 caracteres" /></Field>
    <Field label="Confirmar nova senha"><PasswordInput value={confirm} onChange={setConfirm} placeholder="Repita a nova senha" /></Field>
    {error && <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <DialogFooter><Button variant="outline" className="rounded-full" onClick={onClose}>Cancelar</Button><Button className="rounded-full" disabled={!current || !next || !confirm} onClick={submit}><KeyRound />Salvar nova senha</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className={`${dialogClass()} max-h-[80vh] overflow-y-auto`}><DialogHeader><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary"><CircleHelp /></span><div><DialogTitle>Central de ajuda</DialogTitle><DialogDescription>Dúvidas comuns sobre a UniCarona.</DialogDescription></div></div></DialogHeader><Accordion type="single" collapsible className="w-full">{faqItems.map((item, index) => <AccordionItem key={item.q} value={`item-${index}`}><AccordionTrigger>{item.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{item.a}</AccordionContent></AccordionItem>)}</Accordion></DialogContent></Dialog>; }

function ConfirmationDialog({ kind, onClose, onConfirm }: { kind: ConfirmKind; onClose: () => void; onConfirm: () => void }) { const content = kind === "delete" ? ["Excluir conta definitivamente?", "Esta ação é irreversível e apagará seu perfil e histórico neste navegador.", "Excluir minha conta"] : kind === "cancel" ? ["Cancelar esta carona?", "Os passageiros confirmados serão avisados e receberão o reembolso automaticamente.", "Cancelar carona"] : kind === "reject" ? ["Recusar esta solicitação?", "A passageira será avisada e poderá procurar outra opção de trajeto.", "Recusar solicitação"] : kind === "cancel-request" ? ["Cancelar esta solicitação?", "O motorista será avisado e você perderá o lugar na fila dessa carona.", "Cancelar solicitação"] : ["Deseja sair da sua conta?", "Seus dados continuarão salvos com segurança neste navegador.", "Sair da conta"]; return <AlertDialog open={kind !== null} onOpenChange={(value) => !value && onClose()}><AlertDialogContent className={dialogClass()}><AlertDialogHeader><div className={`mb-2 grid size-12 place-items-center rounded-2xl ${kind === "logout" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{kind === "logout" ? <LogOut /> : <AlertTriangle />}</div><AlertDialogTitle>{content[0]}</AlertDialogTitle><AlertDialogDescription>{content[1]}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-full">Voltar</AlertDialogCancel><AlertDialogAction className={`rounded-full ${kind === "logout" ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`} onClick={onConfirm}>{content[2]}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>; }
