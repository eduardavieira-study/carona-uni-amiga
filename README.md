# UniCarona: Seu Caminho Conectado

Create a modern, complete, and fully functional university carpooling prototype called "UniCarona" in Portuguese (pt-BR). This is a front-end interactive prototype for university students to share daily rides between their homes and campuses. 

All UI text, labels, alerts, toasts, placeholders, and mock data must be written in fluent Brazilian Portuguese (pt-BR).

DO NOT implement a real backend or external database. Use browser `localStorage` to handle state persistence (authenticated user, rides catalog, ride requests, wallet status, notifications, and profile edits) initialized with realistic default mock data from universities in Belo Horizonte, Brazil (e.g., PUC Minas, UFMG, CEFET-MG).

---

### 1. DESIGN SYSTEM & VISUAL IDENTITY
- **Brand Palette:** Deep and vibrant Purple / Violet as the primary color (`#7C3AED` / `#6D28D9` / Tailwind `violet-600` and `purple-700`), accompanied by clean neutrals, soft lilac accents, success emerald greens, and warning/destructive rose reds.
- **Theme Support:** Fully responsive Dark Mode and Light Mode with a high-contrast toggle switch in the navbar/top bar.
- **Typography:** Modern, legible sans-serif font (Inter font family), clear visual hierarchy, well-proportioned headings, badges, and status pills.
- **Device Viewport Switcher:** Include a floating or sticky top toolbar allowing the evaluator to toggle between:
  1. "Visão Web Desktop" (Full width responsive dashboard layout).
  2. "Simulador Mobile" (Rendered inside a realistic smartphone mockup frame with iOS/Android top status bar and bottom navigation bar, perfect for presenting mobile-only requirements).
  3. "Alternar Usuário de Teste" (Quick toggle between "Bruno Andrade - Motorista" and "Camila Ribeiro - Passageira" to easily test both perspectives).

---

### 2. HEURISTIC USABILITY & FEEDBACK (NIELSEN'S HEURISTICS)
- **Visibility of System Status:** Animated loading indicators when searching or saving, status badges for rides ("Pendente", "Aprovada", "Em Andamento", "Concluída", "Cancelada"), real-time counter for seats available, and toast notifications (using Sonner or Radix Toast) for every user action.
- **Error Prevention & Feedback:**
  - Real-time inline field validation: Academic email field MUST validate the `.edu.br` institutional domain (e.g., `aluno@pucminas.br` or `usuario@ufmg.br`), showing a clear red warning if not matching, and an active green badge when valid.
  - Input masks: Brazilian phone `(XX) XXXXX-XXXX` and vehicle license plate `ABC1D23` (Mercosul format).
  - Destructive actions (Delete Account, Cancel Ride, Reject Passenger) MUST require a confirmation Modal/Dialog with an explicit explanation of consequences.
- **Clear Information Architecture:** Breadcrumbs, friendly empty states with vector illustrations or Lucide icons ("Nenhuma carona disponível no momento", "Nenhuma solicitação pendente").

---

### 3. SCOPE & SCREENS TO BUILD

#### A. Authentication Flow (Web & Mobile - Large and Small screen views)
- **RF001 / RF003 - Sign Up (Cadastro):**
  - Fields: Nome Completo, Foto de Perfil (with interactive preview/upload mock), E-mail Acadêmico (strict `.edu.br` validation check), Universidade (select dropdown: PUC Minas Coração Eucarístico, PUC Praça da Liberdade, UFMG Pampulha, etc.), Senha com medidor de força, e Telefone celular.
  - Notice explaining that a single account acts as both Passenger and Driver.
  - Successful signup saves to `localStorage` and triggers a success toast before redirecting.
- **RF002 - Login:**
  - E-mail acadêmico and password login with validation, error states on incorrect credentials, and immediate session startup.

#### B. User Profile & Account Management (Web & Mobile)
- **RF004 - Logout:** Accessible from user dropdown/menu with a confirmation dialog: "Deseja realmente sair da sua conta?".
- **RF005 - Exclusão de Conta:** Danger zone button in settings triggering a red alert modal: "Esta ação é irreversível. Todos os seus dados serão removidos da plataforma."
- **RF006 - Edição de Perfil:** Edit name, university, phone, bio, and profile picture with immediate feedback and persistence in `localStorage`.

#### C. Driver Wallet & Ride Publishing (Web & Mobile)
- **RF010 / RF011 - Publicar Anúncio de Carona:**
  - **Wallet Pre-requisite Check:** Drivers MUST have a payout wallet configured (Asaas subaccount simulation). If the driver has not configured it yet, show a modal/warning preventing ride creation: "Configure sua carteira de recebimento antes de criar uma carona", with a simulated button to configure PIX key in 1 click.
  - **Ride Creation Form:**
    - Origem and Destino with address autocomplete suggestions for university campuses and subway stations (e.g., "PUC Minas - Campus Coração Eucarístico", "Estação Gameleira", "Praça da Liberdade", "UFMG - Portaria Antônio Carlos").
    - Data e Horário de partida.
    - Vagas disponíveis (selector from 1 to 4).
    - Placa do carro e Modelo do veículo (e.g., "Chevrolet Onix 2022 - Branco").
    - **Transparent Fixed Pricing Display:** Explain that ride fares are fixed based on the municipal transit tariff: "Preço Fixo da Carona: R$ 5,25" + "Taxa de Conveniência: R$ 0,75" = **"Total a Pagar pelo Passageiro: R$ 6,00"**. Clarify that the driver cannot alter the base price.
- **RF012 - Editar Anúncio de Carona:**
  - Update route origin/destination, time, seats, and car details. The price field must remain locked and disabled with a tooltip: "O preço é tabelado e fixo conforme a tarifa municipal vigente".
- **RF013 - Cancelar Anúncio de Carona:**
  - Cancel button opening a dialog warning: "Ao cancelar, os passageiros confirmados serão notificados e estornados automaticamente." Updates ride status in `localStorage`.

#### D. Ride Search & Booking (Mobile-first View)
- **RF014 - Pesquisar Caronas:**
  - Search bar with Date, Origin, and Destination with autocomplete suggestions.
  - Interactive search results filterable by departure time, available seats, and driver rating.
- **RF015 - Perfil Público do Motorista:**
  - In search results, clicking the driver's card opens a profile sheet/modal displaying: photo, full name, university badge (.edu.br verificado), star rating (e.g., 4.9 ★), total rides offered, vehicle details (model, color, plate), and verified passenger reviews.
- **RF016 - Solicitar Carona:**
  - "Solicitar Vaga" button. Opens ride confirmation summary (origin, destination, pickup time, total price R$ 6,00). Upon confirmation, state transitions to "Aguardando aprovação do motorista" and notifies the user with a toast.

#### E. Driver Approval & Passenger Profile (Web & Mobile)
- **RF017 - Perfil do Passageiro na Solicitação:**
  - Driver can view incoming ride requests. Clicking the requester displays their profile: photo, university, course, student verification badge, rating, and total completed rides.
- **RF018 / RF019 - Aprovar ou Rejeitar Carona:**
  - Driver buttons: "Aprovar Vaga" or "Recusar".
  - If approved, decreases available seats and triggers PIX payment QR Code generation.

#### F. Live Ride Tracking & Ride Detail (Mobile Screen View)
- **RF032 - Acompanhamento de Trajeto em Tempo Real:**
  - A mobile ride tracking view simulated with an interactive map (using Leaflet / OpenStreetMap or a highly detailed stylized SVG transit map of Belo Horizonte).
  - Displays:
    - Route polyline connecting Origin and Destination.
    - Moving driver vehicle icon with animated pulsing indicator along the route.
    - Dynamic status banner: "Faltam 8 minutos para o embarque", "Motorista a caminho", or "Em viagem".
    - Bottom sheet drawer with Driver details, car model & plate, SOS/Emergency contact button, and "Simular Chegada / Finalizar Corrida" interactive test control.

#### G. Dashboards & Analytics (Web & Mobile - Large and Small screen views)
- **RF037 - Dashboard do Motorista:**
  - Metric cards:
    - Total de Caronas Oferecidas (trajetos realizados).
    - Passageiros Transportados.
    - Nota Média de Avaliação (with star icons).
    - Valor Total Arrecadado (R$).
  - Simple chart/progress breakdown showing rides by day of the week and a list of completed rides.
- **RF038 - Dashboard do Passageiro:**
  - Metric cards:
    - Total de Caronas Realizadas.
    - Nota Média como Passageiro.
    - Total Investido/Gasto em Caronas (R$).
    - Economia Estimada (comparing carpool cost vs traditional ride-hailing apps, e.g., "Economia estimada de ~R$ 180,00 este mês").
  - Recent ride receipts history with download/view receipt modal.

---

### 4. TECHNICAL & UI DETAILS
- Built with React, Tailwind CSS, Lucide-react icons, and shadcn/ui components (Dialogs, Tabs, Toasts, Avatars, Cards, Badges, Tooltips, Accordions).
- Responsive: Works seamlessly as a full desktop web portal, while also supporting an integrated phone mockup view so examiners can assess the exact mobile platform requirements.
- Pre-populate `localStorage` with 4-6 realistic rides between campuses (Coração Eucarístico, Praça da Liberdade, Pampulha, Barreiro, Contagem) so the prototype is ready for immediate live exploration upon opening.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://carona-uni-amiga.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/86cbdb21-73a3-4668-84cd-9beae9977263).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
