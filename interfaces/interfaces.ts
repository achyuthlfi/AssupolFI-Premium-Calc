export interface TRequest {
  application: Application;
}

export interface Application {
  version: number;
  assureds: ReqAssured[];
  familyIncomeBenefit: number;
  cashBack: boolean;
  waiverDeathPlus: boolean;
  waiverRetrenchment: boolean;
  paidUp: number;
  waiverDeath: boolean;
  commissionPercentagesMaximum: ReqCommissionPercentage[];
  role: string;
  premiumIncreasePercentage: number;
}

export interface ReqAssured {
  funeralBenefit: number;
  relationshipCategory: string;
  assuredIdentifier: string | null;
  age: number;
  fullTimeStudent: boolean;
  accidentalDeathBenefit: number;
  memorialBenefit: number;
  healthPlusBenefit: number;
  onCallPlusBenefit: number;
}

export interface ReqCommissionPercentage {
  commissionType: string;
  percentage: number;
}

export interface TResponse {
  assuredResponse?: AssuredFromRes;
  cashBackPremium?: number;
  familyIncomePremium?: number;
  paidUpPremium?: number;
  waiverDeathPremium?: number;
  waiverDeathPlusPremium?: number;
  waiverRetrenchmentPremium?: number;
  benefitIncreasePercentage?: number;
  accidentalDeathPremiumTotal?: number;
  funeralPremiumTotal?: number;
  healthPlusPremiumTotal?: number;
  memorialPremiumTotal?: number;
  onCallPlusPremiumTotal?: number;
  premiumTotal?: number;
  assupolOnCallPremium?: number;
  assureds?: ResAssured[];
  commissionAmounts?: ResCommissionAmount[];
}

export interface ResAssured {
  funeralPremium?: number;
  accidentalDeathPremium?: number;
  memorialPremium?: number;
  healthPlusPremium?: number;
  onCallPlusPremium?: number;
  categoryB1A?: boolean;
  categoryA?: boolean;
  amountAboveLimit?: number;
  age?: number;
  relationshipCategory?: string;
  assuredIdentifier?: string;
  fullTimeStudent?: boolean;
}

export interface ResCommissionAmount {
  commissionType?: string;
  amount?: number;
  amountYearTwo?: number;
}

export interface AssuredFromRes {
  assuredIdentifier: string;
  age: number;
  relationshipCategory: string;
  fullTimeStudent: boolean;
  funeralPremium: number;
}
