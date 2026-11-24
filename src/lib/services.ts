export const SERVICES = [
  { id: "haircut", name: "Haircut", duration: "45 min", price: "€30" },
  { id: "color", name: "Color", duration: "90 min", price: "€65" },
  { id: "beard", name: "Beard trim", duration: "20 min", price: "€15" },
] as const;
export type ServiceId = (typeof SERVICES)[number]["id"];
export const TIMES = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];
export const serviceName = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? id;
