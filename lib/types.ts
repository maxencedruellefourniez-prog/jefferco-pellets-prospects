export type SignalType =
  | "bciat"
  | "bcib"
  | "reseau_chaleur_biomasse"
  | "icpe_combustion_biomasse"
  | "irep_biomasse"
  | "cee_biomasse"
  | "presse_conversion"
  | "secteur_energivore";

export const SIGNAL_LABELS: Record<SignalType, string> = {
  bciat: "Lauréat BCIAT (chaudière biomasse ADEME)",
  bcib: "Lauréat BCIB (séchage biomasse industrie du bois)",
  reseau_chaleur_biomasse: "Réseau de chaleur avec mix biomasse",
  icpe_combustion_biomasse: "ICPE — combustion biomasse déclarée",
  irep_biomasse: "IREP — combustible biomasse déclaré",
  cee_biomasse: "Opération CEE chaudière biomasse",
  presse_conversion: "Conversion signalée dans la presse professionnelle",
  secteur_energivore: "Secteur à fort besoin de chaleur process",
};

export const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  bciat: 50,
  bcib: 40,
  reseau_chaleur_biomasse: 45,
  icpe_combustion_biomasse: 25,
  irep_biomasse: 30,
  cee_biomasse: 30,
  presse_conversion: 20,
  secteur_energivore: 10,
};

export type Signal = {
  type: SignalType;
  year?: number;
  source: string;
  note?: string;
};

export type ProspectType = "industriel" | "collectivite";

export type ProspectStatus =
  | "a_qualifier"
  | "a_contacter"
  | "contacte"
  | "rdv"
  | "client"
  | "perdu";

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  a_qualifier: "À qualifier",
  a_contacter: "À contacter",
  contacte: "Contacté",
  rdv: "RDV obtenu",
  client: "Client",
  perdu: "Perdu / non pertinent",
};

export type EntryPoint = {
  role: string;
  name?: string;
  org?: string;
  searchUrl?: string;
  note?: string;
};

export type Prospect = {
  id: string;
  name: string;
  type: ProspectType;
  sector: string;
  city: string;
  postalCode?: string;
  department: string;
  lat: number;
  lon: number;
  currentFuel?: string;
  signals: Signal[];
  entryPoints: EntryPoint[];
  status: ProspectStatus;
  notes?: string;
  sourceSummary?: string;
};

export type ProspectsData = {
  weights: Record<SignalType, number>;
  prospects: Prospect[];
};
