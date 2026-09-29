export type Equipment = 'Dry Van' | 'Reefer' | 'Flatbed';

export interface Place {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

/** Hours-of-service clocks as the ELD reports them, in minutes. */
export interface HosClocks {
  driveLeftMin: number; // 11-hour driving limit remaining
  windowLeftMin: number; // 14-hour on-duty window remaining
}

/** A truck as Class8 sees it through the OEM-embedded ELD. */
export interface Truck {
  id: string;
  unit: string;
  driver: string;
  location: Place;
  equipment: Equipment;
  mpg: number;
  hos: HosClocks | null; // null when the ELD hasn't reported recently
}

export interface Broker {
  name: string;
  phone: string;
  email: string;
}

/** A load as parsed off a load board row. */
export interface Load {
  id: string;
  origin: Place;
  destination: Place;
  pickupStart: Date;
  pickupEnd: Date;
  equipment: Equipment;
  tripMiles: number;
  rate: number | null; // null = "Call for rate"
  lengthFt: number | null;
  weightLbs: number | null;
  broker: Broker;
}

export interface CostSettings {
  fuelPrice: number; // $/gal diesel
  driverPayPerMile: number;
  fixedCostPerMile: number;
  avgMph: number;
}

export type HosStatus = 'ok' | 'tight' | 'reset' | 'missed' | 'unknown';

export interface HosResult {
  status: HosStatus;
  driveToPickupMin: number;
  arriveAt: Date;
  /** Driving minutes left after reaching pickup (ok / tight only). */
  spareMin: number | null;
}

export type Verdict = 'great' | 'good' | 'fair' | 'tight' | 'low-pay' | 'skip';
export type Tone = 'good' | 'neutral' | 'warn' | 'bad';

export interface Fit {
  loadId: string;
  score: number; // 0–100
  verdict: Verdict;
  tone: Tone;
  label: string; // chip text, e.g. "Great load"
  reason: string; // one plain-language sentence
  hos: HosResult;
  deadheadMiles: number;
  totalMiles: number;
  revenue: number;
  rateSource: 'posted' | 'market';
  fuelCost: number;
  driverPay: number;
  fixedCost: number;
  netProfit: number;
  postedRpm: number | null;
  marketRpm: number;
  marketDeltaPct: number | null;
}
