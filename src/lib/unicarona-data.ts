export type View = "inicio" | "buscar" | "publicar" | "solicitacoes" | "corrida" | "carteira" | "painel" | "perfil";
export type RideStatus = "Pendente" | "Aprovada" | "Em andamento" | "Concluída" | "Cancelada";

export type PixKeyType = "CPF" | "E-mail" | "Telefone" | "Aleatória";
export type PixKey = { type: PixKeyType; value: string; bank: string };

export type User = {
  id: string; name: string; email: string; password: string; university: string; phone: string;
  bio: string; course: string; avatar: string; photo?: string; rating: number; completedRides: number;
  type: "motorista" | "passageira"; walletConfigured: boolean; pixKey?: PixKey;
  vehicle?: { model: string; plate: string; color: string };
};

export type Ride = {
  id: string; driverId: string; origin: string; destination: string; date: string; time: string;
  seats: number; status: RideStatus; vehicle: string; plate: string; rating: number;
};

export type RequestStatus = "Pendente" | "Aguardando pagamento" | "Aprovada" | "Recusada" | "Expirada";

export type RideRequest = {
  id: string; rideId: string; passengerId: string; status: RequestStatus; createdAt: string; paymentDeadline?: number;
};

export type Notification = { id: string; userId: string; text: string; read: boolean; time: string };

export type Review = { id: string; rideId: string; authorId: string; targetId: string; rating: number; comment?: string; createdAt: string };

export type UniCaronaState = {
  users: User[]; rides: Ride[]; requests: RideRequest[]; notifications: Notification[]; reviews: Review[];
  currentUserId: string | null; theme: "light" | "dark"; displayMode: "desktop" | "mobile";
};

export const campuses = [
  "PUC Minas - Campus Coração Eucarístico", "PUC Minas - Praça da Liberdade",
  "UFMG - Portaria Antônio Carlos", "CEFET-MG - Campus Nova Suíça",
  "Estação Gameleira", "PUC Minas - Campus Barreiro", "Praça da Liberdade",
  "Centro de Contagem", "Estação Eldorado",
];

export const defaultUsers: User[] = [
  {
    id: "bruno", name: "Bruno Andrade", email: "bruno.andrade@pucminas.br", password: "unicarona123",
    university: "PUC Minas Coração Eucarístico", phone: "(31) 98841-2207", course: "Engenharia de Software",
    bio: "Vou ao campus todos os dias e gosto de tornar o caminho mais leve e sustentável.",
    avatar: "BA", rating: 4.9, completedRides: 87, type: "motorista", walletConfigured: false,
    vehicle: { model: "Chevrolet Onix 2022", plate: "RNU4E19", color: "Branco" },
  },
  {
    id: "camila", name: "Camila Ribeiro", email: "camila.ribeiro@ufmg.br", password: "unicarona123",
    university: "UFMG Pampulha", phone: "(31) 99732-1460", course: "Arquitetura e Urbanismo",
    bio: "Estudante, ciclista de fim de semana e fã de mobilidade compartilhada.",
    avatar: "CR", rating: 4.8, completedRides: 31, type: "passageira", walletConfigured: true,
    pixKey: { type: "E-mail", value: "camila.ribeiro@ufmg.br", bank: "Nubank" },
  },
  {
    id: "lucas", name: "Lucas Fernandes", email: "lucas@cefetmg.br", password: "demo1234",
    university: "CEFET-MG Nova Suíça", phone: "(31) 99220-5813", course: "Engenharia Mecânica",
    bio: "Trajetos tranquilos e pontuais.", avatar: "LF", rating: 4.7, completedRides: 54,
    type: "motorista", walletConfigured: true,
    vehicle: { model: "Honda Fit 2020", plate: "QXZ8B42", color: "Prata" },
    pixKey: { type: "Telefone", value: "(31) 99220-5813", bank: "Banco Inter" },
  },
  {
    id: "marina", name: "Marina Costa", email: "marina@ufmg.br", password: "demo1234",
    university: "UFMG Pampulha", phone: "(31) 99114-7730", course: "Ciências Biológicas",
    bio: "Sempre com música boa e respeito aos horários.", avatar: "MC", rating: 5, completedRides: 112,
    type: "motorista", walletConfigured: true,
    vehicle: { model: "Hyundai HB20 2023", plate: "RTO2A65", color: "Cinza" },
    pixKey: { type: "CPF", value: "123.456.789-00", bank: "Banco do Brasil" },
  },
];

export const defaultRides: Ride[] = [
  { id: "r1", driverId: "bruno", origin: "Estação Gameleira", destination: "PUC Minas - Campus Coração Eucarístico", date: "2026-09-15", time: "07:20", seats: 2, status: "Pendente", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r2", driverId: "lucas", origin: "Praça da Liberdade", destination: "CEFET-MG - Campus Nova Suíça", date: "2026-09-15", time: "08:10", seats: 3, status: "Pendente", vehicle: "Honda Fit 2020 - Prata", plate: "QXZ8B42", rating: 4.7 },
  { id: "r3", driverId: "marina", origin: "Estação Eldorado", destination: "UFMG - Portaria Antônio Carlos", date: "2026-09-15", time: "06:55", seats: 1, status: "Pendente", vehicle: "Hyundai HB20 2023 - Cinza", plate: "RTO2A65", rating: 5 },
  { id: "r4", driverId: "lucas", origin: "Centro de Contagem", destination: "PUC Minas - Campus Coração Eucarístico", date: "2026-09-16", time: "18:10", seats: 2, status: "Pendente", vehicle: "Honda Fit 2020 - Prata", plate: "QXZ8B42", rating: 4.7 },
  { id: "r5", driverId: "bruno", origin: "PUC Minas - Praça da Liberdade", destination: "PUC Minas - Campus Barreiro", date: "2026-09-12", time: "17:40", seats: 0, status: "Concluída", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r6", driverId: "marina", origin: "UFMG - Portaria Antônio Carlos", destination: "Praça da Liberdade", date: "2026-09-14", time: "19:00", seats: 0, status: "Em andamento", vehicle: "Hyundai HB20 2023 - Cinza", plate: "RTO2A65", rating: 5 },
  { id: "r7", driverId: "bruno", origin: "PUC Minas - Campus Coração Eucarístico", destination: "Estação Gameleira", date: "2026-08-25", time: "17:30", seats: 0, status: "Concluída", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r8", driverId: "bruno", origin: "Estação Gameleira", destination: "PUC Minas - Campus Coração Eucarístico", date: "2026-08-04", time: "07:15", seats: 0, status: "Concluída", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r9", driverId: "bruno", origin: "Estação Gameleira", destination: "PUC Minas - Campus Coração Eucarístico", date: "2026-07-14", time: "07:20", seats: 0, status: "Concluída", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r10", driverId: "marina", origin: "UFMG - Portaria Antônio Carlos", destination: "Praça da Liberdade", date: "2026-09-05", time: "19:00", seats: 0, status: "Concluída", vehicle: "Hyundai HB20 2023 - Cinza", plate: "RTO2A65", rating: 5 },
];

export const initialState: UniCaronaState = {
  users: defaultUsers,
  rides: defaultRides,
  requests: [
    { id: "q1", rideId: "r1", passengerId: "camila", status: "Pendente", createdAt: "Hoje, 01:42" },
    { id: "q-active", rideId: "r6", passengerId: "camila", status: "Aprovada", createdAt: "Hoje, 06:40" },
    { id: "qc1", rideId: "r5", passengerId: "camila", status: "Aprovada", createdAt: "12 set" },
    { id: "qc2", rideId: "r7", passengerId: "camila", status: "Aprovada", createdAt: "25 ago" },
    { id: "qc3", rideId: "r10", passengerId: "camila", status: "Aprovada", createdAt: "5 set" },
    { id: "qc4", rideId: "r8", passengerId: "lucas", status: "Aprovada", createdAt: "4 ago" },
  ],
  notifications: [
    { id: "n1", userId: "bruno", text: "Camila solicitou uma vaga na sua carona.", read: false, time: "Há 18 min" },
    { id: "n2", userId: "camila", text: "Sua carona para a UFMG começa em breve.", read: false, time: "Há 32 min" },
  ],
  reviews: [
    { id: "rev1", rideId: "r5", authorId: "camila", targetId: "bruno", rating: 5, comment: "Carona super tranquila, saiu no horário certinho!", createdAt: "12 set" },
    { id: "rev2", rideId: "r7", authorId: "camila", targetId: "bruno", rating: 5, comment: "Sempre pontual e educado, recomendo!", createdAt: "25 ago" },
    { id: "rev3", rideId: "r8", authorId: "lucas", targetId: "bruno", rating: 4, comment: "Boa viagem, só demorou um pouquinho pra sair.", createdAt: "4 ago" },
    { id: "rev4", rideId: "r5", authorId: "bruno", targetId: "camila", rating: 5, comment: "Passageira super educada e no horário.", createdAt: "12 set" },
    { id: "rev5", rideId: "r7", authorId: "bruno", targetId: "camila", rating: 5, comment: "Ótima passageira, super gentil.", createdAt: "25 ago" },
    { id: "rev6", rideId: "r10", authorId: "camila", targetId: "marina", rating: 5, comment: "Carro impecável e motorista super atenciosa.", createdAt: "5 set" },
  ],
  currentUserId: "bruno", theme: "light", displayMode: "mobile",
};

export const STORAGE_KEY = "unicarona-prototype-v1";