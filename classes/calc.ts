import {
  RelationshipCategory,
  maxAgeChildAsDependentFullTimeStudent,
  premiumDividend,
  premiumPercentage,
} from "../constants/constants";
import {
  TRequest,
  TResponse,
  ReqAssured,
  ResAssured,
  AssuredFromRes,
  PremiumCalculationsResponse,
} from "../interfaces/interfaces";
import tariffJson from "../data/TarrifResultXML.json";
import { findTariff, getTariffDiscountTariff } from "../tarrifCalc/getTarrif";

class premiumCalculations {
  // Replace with your actual class name
  private request: TRequest | any;
  private response: PremiumCalculationsResponse | any;

  constructor() {
    // Initialize the response object and its assureds array
    this.response = {
      assureds: [],
    };
  }

  private initializeResponse() {
    this.response = {
      cashBackPremium: 0,
      familyIncomePremium: 0,
      paidUpPremium: 0,
      waiverDeathPremium: 0,
      waiverDeathPlusPremium: 0,
      waiverRetrenchmentPremium: 0,
      benefitIncreasePercentage: 4,
      accidentalDeathPremiumTotal: 0,
      funeralPremiumTotal: 0,
      healthPlusPremiumTotal: 0,
      memorialPremiumTotal: 0,
      onCallPlusPremiumTotal: 0,
      premiumTotal: 0,
      assupolOnCallPremium: 0,
      assureds: [],
      commissionAmounts: [],
    };

    return this.response;
  }

  public async calculatePremiums(request: TRequest): Promise<TResponse> {
    if (!request) {
      throw new Error("request cannot be null");
    }
    this.request = request;
    this.response = this.initializeResponse(); // Ensure response is initialized

    for (const assured of request.application.assureds) {
      // Funeral
      this.response.assureds?.push(await this.aggregateFuneralPremium(assured));

      // Accidental Death
      this.aggregateAccidentalDeathPremium(assured);

      // Memorial
      this.aggregateMemorialPremium(assured);

      // Health Plus Benefit
      this.aggregateHealthPlusPremium(assured);

      // On Call Plus
      this.aggregateOnCallPlusPremium(assured);
    }

    this.aggregateBenefitIncrease();

    this.aggregateFamilyIncomePremium();

    console.log("this.response.assureds", this.response.assureds);
    // Aggregate assured totals
    this.response.funeralPremiumTotal = this.response.assureds?.reduce(
      (acc: any, o: any) => acc + this.applyRounding(o.FuneralPrincipalFactor),
      0
    );
    /* this.response.accidentalDeathPremiumTotal = this.response.assureds?.reduce(
      (acc, o) => acc + o.accidentalDeathPremium,
      0
    ); */
    /*  this.response.memorialPremiumTotal = this.response.assureds?.reduce(
      (acc, o) => acc + o.memorialPremium,
      0
    ); */
    /*  this.response.healthPlusPremiumTotal = this.response.assureds?.reduce(
      (acc, o) => acc + o.healthPlusPremium,
      0
    ); */
    /* this.response.onCallPlusPremiumTotal = this.response.assureds?.reduce(
      (acc, o) => acc + o.onCallPlusPremium,
      0
    ); */
    /* this.response.premiumTotal =
      this.response.funeralPremiumTotal +
      this.response.accidentalDeathPremiumTotal +
      this.response.familyIncomePremium +
      this.response.memorialPremiumTotal +
      this.response.healthPlusPremiumTotal +
      this.response.onCallPlusPremiumTotal; */

    this.response.premiumTotal = this.response.funeralPremiumTotal;

    // Waiver Death
    this.aggregateWaiverDeathPremium();

    // Waiver Death Plus
    this.aggregateWaiverDeathPlusPremium();

    // Waiver Retrenchment
    this.aggregateWaiverRetrenchmentPremium();

    // Cash-back
    this.aggregateCashBackPremium();
    /* this.response.premiumTotal +=
      this.response.waiverDeathPremium +
      this.response.waiverDeathPlusPremium +
      this.response.waiverRetrenchmentPremium +
      this.response.cashBackPremium; */

    // Paid-up Level
    this.aggregatePaidUpLevelPremium();
    //this.response.premiumTotal += this.response.paidUpPremium;

    // Commission
    this.aggregateRecurringCommission();
    this.aggregateCommissionService();

    // Insurance Classification
    for (const assured of this.request.application.assureds) {
      this.aggregateFuneralClassification(assured);
    }

    // Apply rounding at the end so that ExcludeWaiverPremium() can accurately reverse the amount for calculations
    /* this.response.assureds.forEach(
      (o) => (o.funeralPremium = this.applyRounding(o.funeralPremium))
    ); */

    return this.response;
  }

  // Example method implementations
  //private aggregateFuneralPremium(assured: ReqAssured) {
  /* Implementation here */
  //}

  private async aggregateFuneralPremium(assured: ReqAssured): Promise<any> {
    console.log("assured", assured);
    const assuredResponse = this.responseAssuredFromRequest(assured);
    console.log("assuredResponse", assuredResponse);
    if (assured.funeralBenefit === 0) return;
    const tariff = await findTariff(
      7,
      assuredResponse.age,
      assuredResponse.funeralPremium
    );
    const tariffDiscount = await getTariffDiscountTariff(
      8,
      assuredResponse.age,
      assuredResponse.funeralPremium
    );

    console.log("tariff response", tariff);
    console.log("tariffDiscount response", tariffDiscount);
    const funeralPrincipalFactor = parseInt(tariff.FuneralPrincipalFactor) ?? 0;

    /* const tariff = TariffService.getTariff(
      this.request.version,
      (x: any) =>
        x.age <= assured.age &&
        (x.coverAmount === Decimal.ZERO ||
          x.coverAmount === assured.funeralBenefitEffective),
      new TariffErrorHandling(),
      new OrderByExpression<TariffItemExcellenceFamilyFuneralPlan, Decimal>(
        (x: any) => x.coverAmount
      ),
      new OrderByExpression<TariffItemExcellenceFamilyFuneralPlan, number>(
        (x: any) => x.age
      )
    ); */

    /* const tariffDiscount = TariffService.getTariff<
      TariffItemExcellenceFamilyFuneralPlanDiscount,
      Decimal
    >(
      this.request.version,
      (x) => assured.funeralBenefit >= x.coverAmount,
      (y) => y.coverAmount
    ); */

    switch (this.assuredRelationship(assured.relationshipCategory)) {
      case RelationshipCategory.MainLife:
        assuredResponse.funeralPremium =
          (assured.funeralBenefit * funeralPrincipalFactor) / premiumDividend;
        /* assuredResponse.funeralPremium *=
          1 - tariffDiscount.percentagePrincipal / premiumPercentage; */
        assuredResponse.funeralPremium *=
          1 - tariffDiscount.PercentagePrincipal / premiumPercentage;
        break;

      case RelationshipCategory.Spouse:
      case RelationshipCategory.Children:
        assuredResponse.funeralPremium =
          assured.funeralBenefit *
          (tariff.funeralSpouseChildrenFactor / premiumDividend);
        /* assuredResponse.funeralPremium *=
          1 - tariffDiscount.percentageSpouseChildren / premiumPercentage;
        assuredResponse.funeralPremium /=
          1 + TariffGeneral.waiverDeathPercentage / premiumPercentage; */
        assuredResponse.funeralPremium *=
          1 - tariffDiscount.PercentageSpouseChildren / premiumPercentage;
        assuredResponse.funeralPremium /= 1 + 0 / premiumPercentage;
        break;

      case RelationshipCategory.Other:
        assuredResponse.funeralPremium =
          (assured.funeralBenefit * tariff.funeralOtherFactor) /
          premiumDividend;
        /* assuredResponse.funeralPremium *=
          1 - tariffDiscount.percentageOther / premiumPercentage;
        assuredResponse.funeralPremium /=
                1 + TariffGeneral.waiverDeathPercentage / premiumPercentage; */

        assuredResponse.funeralPremium *=
          1 - tariffDiscount.PercentageOther / premiumPercentage;
        assuredResponse.funeralPremium /= 1 + 0 / premiumPercentage;
        break;

      case RelationshipCategory.Parents:
        assuredResponse.funeralPremium =
          (assured.funeralBenefit * tariff.funeralParentFactor) /
          premiumDividend;
        /* assuredResponse.funeralPremium *=
          1 - tariffDiscount.percentageOther / premiumPercentage;
        assuredResponse.funeralPremium /=
                1 + TariffGeneral.waiverDeathPercentage / premiumPercentage; */

        assuredResponse.funeralPremium *=
          1 - tariffDiscount.PercentageOther / premiumPercentage;
        assuredResponse.funeralPremium /= 1 + 0 / premiumPercentage;
        break;
    }

    return assuredResponse;
  }

  private aggregateMemorialPremium(assured: ReqAssured) {}
  private aggregateAccidentalDeathPremium(assured: ReqAssured) {}
  private aggregateHealthPlusPremium(assured: ReqAssured) {}
  private aggregateOnCallPlusPremium(assured: ReqAssured) {}
  private aggregateBenefitIncrease() {}
  private aggregateFamilyIncomePremium() {}
  private aggregateWaiverDeathPremium() {}
  private aggregateWaiverDeathPlusPremium() {}
  private aggregateWaiverRetrenchmentPremium() {}
  private aggregateCashBackPremium() {}
  private aggregatePaidUpLevelPremium() {}
  private aggregateRecurringCommission() {}
  private aggregateCommissionService() {}
  private aggregateFuneralClassification(assured: ReqAssured) {}

  private applyRounding(amount: number): number {
    /* Implementation here */
    return amount;
  }

  private responseAssuredFromRequest(assured: ReqAssured): AssuredFromRes {
    const fullTimeStudent =
      assured.age > maxAgeChildAsDependentFullTimeStudent ? true : false; //TBD
    return {
      assuredIdentifier: "20fc3881-0300-418a-96ce-0b55dc07d0d0",
      age: assured.age,
      relationshipCategory: assured.relationshipCategory,
      fullTimeStudent: false, // fullTimeStudent,
      funeralPremium: 0,
    };
  }

  private assuredRelationship(uuid: string) {
    switch (uuid) {
      case RelationshipCategory.NotSpecified.uuid:
        return RelationshipCategory.NotSpecified;
      case RelationshipCategory.MainLife.uuid:
        return RelationshipCategory.MainLife;
      case RelationshipCategory.Spouse.uuid:
        return RelationshipCategory.Spouse;
      case RelationshipCategory.Children.uuid:
        return RelationshipCategory.Children;
      case RelationshipCategory.Parents.uuid:
        return RelationshipCategory.Parents;
      case RelationshipCategory.Other.uuid:
        return RelationshipCategory.Other;
      default:
        return RelationshipCategory.Other;
    }
  }
}

// Instantiate the class
export const premiumCalculator = new premiumCalculations();
// Call the method
/* premiumCalculator
  .calculatePremiums({
    application: {
      version: 1,
      assureds: [
        {
          funeralBenefit: 10000,
          relationshipCategory: "526ae21e-259f-4f33-9d38-2687efa98968",
          assuredIdentifier: null,
          age: 24,
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
  })
  .then((response) => {
    console.log("Calculated premiums:", response);
  })
  .catch((error) => {
    console.error("Error calculating premiums:", error);
  }); */
