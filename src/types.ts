export type BirthType = 'single' | 'twin' | 'triplet_plus';
export type ApplicationStage = 'before' | 'completed' | 'using';
export type InsuranceType = 'workplace' | 'local' | 'mixed';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  followUpQuestions?: string[];
  step?: number;
  metadata?: {
    incomeBracket?: string;
    birthType?: BirthType;
    eligibility?: string;
  };
}

export interface UserContextData {
  householdSize?: number;
  insuranceType?: InsuranceType;
  monthlyInsuranceFee?: number;
  birthType?: BirthType;
  applicationStage?: ApplicationStage;
  expectedDate?: string;
  confirmedInfo: Record<string, string | number | boolean>;
}

export interface CalculatorResult {
  householdSize: number;
  insuranceType: InsuranceType;
  monthlyFee: number;
  threshold150Fee: number;
  isEligibleStandard: boolean;
  typeCode: string;
  typeName: string;
  description: string;
  copaymentRateEstimate: string;
}

export interface ReferenceDoc {
  id: string;
  title: string;
  section: string;
  content: string;
  year: string;
  sourceTag: string;
}
