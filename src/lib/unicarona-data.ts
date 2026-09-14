export type View = "inicio" | "buscar" | "publicar" | "solicitacoes" | "corrida" | "carteira" | "painel" | "perfil";
export type RideStatus = "Pendente" | "Aprovada" | "Em andamento" | "Concluída" | "Cancelada";

export type User = {
  id: string; name: string; email: string; password: string; university: string; phone: string;
  bio: string; course: string; avatar: string; rating: number; completedRides: number;
  type: "motorista" | "passageira"; walletConfigured: boolean;
  vehicle?: { model: string; plate: string; color: string };
};

export type Ride = {
  id: string; driverId: string; origin: string; destination: string; date: string; time: string;
  seats: number; status: RideStatus; vehicle: string; plate: string; rating: number;
};

export type RideRequest = {
  id: string; rideId: string; passengerId: string; status: "Pendente" | "Aprovada" | "Recusada"; createdAt: string;
};

export type Notification = { id: string; userId: string; text: string; read: boolean; time: string };

export type UniCaronaState = {
  users: User[]; rides: Ride[]; requests: RideRequest[]; notifications: Notification[];
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
  },
  {
    id: "lucas", name: "Lucas Fernandes", email: "lucas@cefetmg.br", password: "demo1234",
    university: "CEFET-MG Nova Suíça", phone: "(31) 99220-5813", course: "Engenharia Mecânica",
    bio: "Trajetos tranquilos e pontuais.", avatar: "LF", rating: 4.7, completedRides: 54,
    type: "motorista", walletConfigured: true,
    vehicle: { model: "Honda Fit 2020", plate: "QXZ8B42", color: "Prata" },
  },
  {
    id: "marina", name: "Marina Costa", email: "marina@ufmg.br", password: "demo1234",
    university: "UFMG Pampulha", phone: "(31) 99114-7730", course: "Ciências Biológicas",
    bio: "Sempre com música boa e respeito aos horários.", avatar: "MC", rating: 5, completedRides: 112,
    type: "motorista", walletConfigured: true,
    vehicle: { model: "Hyundai HB20 2023", plate: "RTO2A65", color: "Cinza" },
  },
];

export const defaultRides: Ride[] = [
  { id: "r1", driverId: "bruno", origin: "Estação Gameleira", destination: "PUC Minas - Campus Coração Eucarístico", date: "2026-09-15", time: "07:20", seats: 2, status: "Pendente", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r2", driverId: "lucas", origin: "Praça da Liberdade", destination: "CEFET-MG - Campus Nova Suíça", date: "2026-09-15", time: "08:10", seats: 3, status: "Pendente", vehicle: "Honda Fit 2020 - Prata", plate: "QXZ8B42", rating: 4.7 },
  { id: "r3", driverId: "marina", origin: "Estação Eldorado", destination: "UFMG - Portaria Antônio Carlos", date: "2026-09-15", time: "06:55", seats: 1, status: "Pendente", vehicle: "Hyundai HB20 2023 - Cinza", plate: "RTO2A65", rating: 5 },
  { id: "r4", driverId: "lucas", origin: "Centro de Contagem", destination: "PUC Minas - Campus Coração Eucarístico", date: "2026-09-16", time: "18:10", seats: 2, status: "Pendente", vehicle: "Honda Fit 2020 - Prata", plate: "QXZ8B42", rating: 4.7 },
  { id: "r5", driverId: "bruno", origin: "PUC Minas - Praça da Liberdade", destination: "PUC Minas - Campus Barreiro", date: "2026-09-12", time: "17:40", seats: 0, status: "Concluída", vehicle: "Chevrolet Onix 2022 - Branco", plate: "RNU4E19", rating: 4.9 },
  { id: "r6", driverId: "marina", origin: "UFMG - Portaria Antônio Carlos", destination: "Praça da Liberdade", date: "2026-09-14", time: "19:00", seats: 0, status: "Em andamento", vehicle: "Hyundai HB20 2023 - Cinza", plate: "RTO2A65", rating: 5 },
];

export const initialState: UniCaronaState = {
  users: defaultUsers,
  rides: defaultRides,
  requests: [{ id: "q1", rideId: "r1", passengerId: "camila", status: "Pendente", createdAt: "Hoje, 01:42" }],
  notifications: [
    { id: "n1", userId: "bruno", text: "Camila solicitou uma vaga na sua carona.", read: false, time: "Há 18 min" },
    { id: "n2", userId: "camila", text: "Sua carona para a UFMG começa em breve.", read: false, time: "Há 32 min" },
  ],
  currentUserId: "bruno", theme: "light", displayMode: "desktop",
};

export const STORAGE_KEY = "unicarona-prototype-v1";