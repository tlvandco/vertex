export type UnitSystem = 'IMPERIAL' | 'METRIC';

export type DesignCode = 'IBC_2024_AISC' | 'ACI_318_ASCE7' | 'EUROCODE_EN1992' | 'CALIFORNIA_TITLE24';

export interface EngineeringConfig {
  unitSystem: UnitSystem;
  designCode: DesignCode;
  safetyFactor: number; // e.g. 1.67 or 1.5
  cadSnapGridInches: number; // e.g. 0.5, 1, 3, 6, 12
  seismicCategory: 'A' | 'B' | 'C' | 'D' | 'E';
  basicWindSpeedMph: number; // e.g. 115
  groundSnowLoadPsf: number; // e.g. 30
  allowableSoilBearingPsf: number; // e.g. 3000
  title24LpdTarget: number; // Watts / sq ft e.g. 0.65
  reverberationTargetSec: number; // e.g. 0.55
}

export const DEFAULT_ENGINEERING_CONFIG: EngineeringConfig = {
  unitSystem: 'IMPERIAL',
  designCode: 'IBC_2024_AISC',
  safetyFactor: 1.67,
  cadSnapGridInches: 3,
  seismicCategory: 'D',
  basicWindSpeedMph: 115,
  groundSnowLoadPsf: 25,
  allowableSoilBearingPsf: 3000,
  title24LpdTarget: 0.65,
  reverberationTargetSec: 0.52
};

export interface FFEItem {
  id: string;
  itemCode: string;
  room: string;
  category: 'SEATING' | 'CASEGOOD' | 'LIGHTING' | 'RUG_TEXTILE' | 'PLUMBING_FIXTURE';
  description: string;
  vendor: string;
  dimensions: string;
  finishFabricGrade: string;
  quantity: number;
  unitCost: number;
  leadTimeWeeks: number;
  status: 'SPECIFIED' | 'APPROVED' | 'PO_ISSUED' | 'IN_TRANSIT' | 'INSTALLED';
}

export interface StructuralBeamResult {
  factoredLoadPlf: number;
  maxMomentKipFt: number;
  maxShearKips: number;
  momentCapacityKipFt: number;
  shearCapacityKips: number;
  deflectionInches: number;
  allowableDeflectionInches: number;
  utilizationRatio: number;
  isSafe: boolean;
  governingCheck: string;
}

export interface FoundationResult {
  totalServiceLoadKips: number;
  requiredAreaSqFt: number;
  providedAreaSqFt: number;
  bearingPressurePsf: number;
  concreteVolumeCubicYds: number;
  concreteVolumeCubicMeters: number;
  rebarWeightLbs: number;
  isBearingSafe: boolean;
}

export interface DrainageResult {
  weightedRunoffC: number;
  peakDischargeCfs: number;
  peakDischargeLps: number;
  detentionVolumeCuFt: number;
  detentionVolumeGallons: number;
  pipeDiameterInches: number;
}
