import { premiumCalculator } from "../classes/calc";
import { TRequest, TResponse } from "../interfaces/interfaces";

const request: TRequest = {
  application: {
    version: 1,
    assureds: [
      {
        funeralBenefit: 10000,
        relationshipCategory: "526ae21e-259f-4f33-9d38-2687efa98968",
        assuredIdentifier: null,
        age: 36,
        fullTimeStudent: false,
        accidentalDeathBenefit: 0,
        memorialBenefit: 0,
        healthPlusBenefit: 0,
        onCallPlusBenefit: 0,
      },
      {
        funeralBenefit: 10000,
        relationshipCategory: "526ae21e-259f-4f33-9d38-2687efa98968",
        assuredIdentifier: null,
        age: 26,
        fullTimeStudent: false,
        accidentalDeathBenefit: 0,
        memorialBenefit: 0,
        healthPlusBenefit: 0,
        onCallPlusBenefit: 0,
      },
    ],
    familyIncomeBenefit: 0,
    cashBack: false,
    waiverDeathPlus: false,
    waiverRetrenchment: false,
    paidUp: 0,
    waiverDeath: true,
    commissionPercentagesMaximum: [
      {
        commissionType: "4306215b-39a0-4389-b460-06334084e8d4",
        percentage: 100,
      },
    ],
    role: "32978f1e-c54d-44e9-a82e-1a45ecc40144",
    premiumIncreasePercentage: 4,
  },
};

async function getPremiums(): Promise<TResponse | any> {
  //const calculator = premiumCalculator();
  try {
    const response = await premiumCalculator.calculatePremiums(request);
    console.log("Premium Calculation Response:", response);
    return response;
  } catch (error) {
    console.error("Failed to calculate premiums:", error);
    return null;
  }
}
getPremiums();
