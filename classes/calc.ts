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
import { findTariff, getHealthPercentage, getTariffDiscountTariff, getWaiverDeathPercentage } from "../tarrifCalc/getTarrif";

class premiumCalculations {
  // Replace with your actual class name
  private request: TRequest | any;
  private response: PremiumCalculationsResponse | any;
  private waiverData: any;

  constructor() {
    // Initialize the response object and its assureds array
    this.response = {
      assureds: [],
    };
    this.waiverData = {};
  }

  private initializeResponse() {
    this.response = {
      cashBackPremium: 0,
      familyIncomePremium: 0,
      paidUpPremium: 0,
      waiverDeathPremium: 0,
      waiverDeathPlusPremium: 0,
      waiverRetrenchmentPremium: 0,
      benefitIncreasePercentage: 0,
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

    this.waiverData = await getWaiverDeathPercentage(9);

    for (const assured of request.application.assureds) {
      // Funeral
      this.response.assureds?.push(await this.aggregateFuneralPremium(assured));

      // Accidental Death
      this.response.assureds.accidentalDeathPremium = await this.aggregateAccidentalDeathPremium(assured);

      // Memorial
      this.response.assureds.memorialPremium = await this.aggregateMemorialPremium(assured);

      // Health Plus Benefit
      this.response.assureds.healthPlusPremium = await this.aggregateHealthPlusPremium(assured);

      // On Call Plus
      this.response.assureds.onCallPlusPremium = this.aggregateOnCallPlusPremium(assured);
    }

    //this.aggregateBenefitIncrease(); //TBD
    this.response.benefitIncreasePercentage = this.request.premiumIncreasePercentage;

    this.aggregateFamilyIncomePremium();

    //console.log("this.response.assureds", this.response.assureds);
    // Aggregate assured totals
    this.response.funeralPremiumTotal = this.response.assureds?.reduce(
      (acc: any, o: any) => acc + this.applyRounding(o.FuneralPrincipalFactor),
      0
    );
    this.response.accidentalDeathPremiumTotal = this.response.assureds?.reduce(
      (acc: any, o: any) => acc + o.accidentalDeathPremium,
      0
    );
    this.response.memorialPremiumTotal = this.response.assureds?.reduce(
      (acc: any, o: any) => acc + o.memorialPremium,
      0
    );
    this.response.healthPlusPremiumTotal = this.response.assureds?.reduce(
      (acc: any, o: any) => acc + o.healthPlusPremium,
      0
    );
    this.response.onCallPlusPremiumTotal = this.response.assureds?.reduce(
      (acc: any, o: any) => acc + o.onCallPlusPremium,
      0
    );



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
    let funeralPremiumTotal = 0
    this.response.assureds.map((o: any) => {
      funeralPremiumTotal += this.applyRounding(o.funeralPremium);
    });
    this.response.funeralPremiumTotal = funeralPremiumTotal;

    //Total premium
    this.response.premiumTotal =
      parseInt(this.response.funeralPremiumTotal) +
      parseInt(this.response.accidentalDeathPremiumTotal) +
      parseInt(this.response.familyIncomePremium) +
      parseInt(this.response.memorialPremiumTotal) +
      parseInt(this.response.healthPlusPremiumTotal) +
      parseInt(this.response.onCallPlusPremiumTotal);

    //Return response
    return this.response;
  }

  // Example method implementations
  //private aggregateFuneralPremium(assured: ReqAssured) {
  /* Implementation here */
  //}

  private async aggregateFuneralPremium(assured: ReqAssured): Promise<any> {
    //console.log("assured", assured);
    const assuredResponse = this.responseAssuredFromRequest(assured);
    //console.log("assuredResponse", assuredResponse);
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

    //const waiverDeath = await getWaiverDeathPercentage(9);

    //console.log("tariff response", tariff);
    //console.log("tariffDiscount response", tariffDiscount);
    //console.log("waiverDeath", waiverDeath)
    //console.log("waiverDeath", 1 + parseFloat(waiverDeath.WaiverDeathPercentage));
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
        assuredResponse.funeralPremium /= 1 + parseFloat(this.waiverData.WaiverDeathPercentage) / premiumPercentage;
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
        assuredResponse.funeralPremium /= 1 + parseFloat(this.waiverData.WaiverDeathPercentage) / premiumPercentage;
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
        assuredResponse.funeralPremium /= 1 + parseFloat(this.waiverData.WaiverDeathPercentage) / premiumPercentage;
        break;
    }

    return assuredResponse;
  }

  private async aggregateAccidentalDeathPremium(assured: ReqAssured): Promise<any> {
    var funeralPremium = this.assuredRelationship(assured.relationshipCategory) == RelationshipCategory.MainLife
      ? (assured.funeralBenefit)
      : this.aggregateFuneralPremiumExcludingWaiver(assured.funeralBenefit);
    let result = funeralPremium * parseFloat(this.waiverData.AccidentalDeathPercentage) / 100;
    //result = assuredResponse.AccidentalDeathPremium;
    return result;
  }

  private async aggregateMemorialPremium(assured: ReqAssured): Promise<any> {
    if (assured.memorialBenefit <= 0) return;

    var assuredResponse = this.responseAssuredFromRequest(assured);
    const tariffMemorial = await getTariffDiscountTariff(
      11,
      assuredResponse.age,
      assuredResponse.funeralPremium
    );


    let memorialPremium = 0;
    switch (this.assuredRelationship(assured.relationshipCategory)) {
      case RelationshipCategory.MainLife:
        memorialPremium = this.applyRounding(tariffMemorial.PremiumSelf);
        break;

      case RelationshipCategory.Spouse:
      case RelationshipCategory.Children:
        memorialPremium = this.applyRounding(tariffMemorial.PremiumSpouseChildren);
        break;

      case RelationshipCategory.Parents:
        memorialPremium = this.applyRounding(tariffMemorial.PremiumParents);
        break;
    }

    return memorialPremium;
  }

  private async aggregateHealthPlusPremium(assured: ReqAssured): Promise<any> {
    if (assured.healthPlusBenefit == 0 || assured.age == 0) return;

    //var assuredResponse = awaitResponseAssuredFromRequest(assuredRequest);

    var tariffHealthPlus = await getHealthPercentage(11, assured.age);
    let healthPlusPremium = 0;
    switch (this.assuredRelationship(assured.relationshipCategory)) {
      case RelationshipCategory.MainLife:
      case RelationshipCategory.Spouse:
        healthPlusPremium = tariffHealthPlus.PremiumSelfSpouse;
        break;

      case RelationshipCategory.Children:
        /* if (IsDependentChild(assuredRequest))
            assuredResponse.HealthPlusPremium = tariffHealthPlus.PremiumChildren; */
        healthPlusPremium = 0; //TBD
        break;
    }
    return healthPlusPremium;
  }


  private aggregateOnCallPlusPremium(assured: ReqAssured) {
    if (assured.funeralBenefit <= 0 || assured.onCallPlusBenefit == 0) return;

    /* var assuredResponse = ResponseAssuredFromRequest(assuredRequest);
    assuredResponse.OnCallPlusPremium = OnCallPlusPremium; */
    return assured.onCallPlusBenefit = 0;
  }


  private aggregateFamilyIncomePremium() { }
  private aggregateWaiverDeathPremium() { }
  private aggregateWaiverDeathPlusPremium() { }
  private aggregateWaiverRetrenchmentPremium() { }
  private aggregateCashBackPremium() { }
  private aggregatePaidUpLevelPremium() { }
  private aggregateRecurringCommission() { }
  private aggregateCommissionService() { }
  private aggregateFuneralClassification(assured: ReqAssured) { }

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
      categoryB1A: false,
      categoryA: true,
      accidentalDeathPremium: 0,
      memorialPremium: 0,
      healthPlusPremium: 0,
      onCallPlusPremium: 0,
      amountAboveLimit: 0
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

  private aggregateFuneralPremiumExcludingWaiver(funeralPremium: number) {
    // this method is to calculate the reverse of:
    // result = result / (1 + (TariffGeneral.WaiverDeathPercentage / 100));
    return funeralPremium * (1 + (this.waiverData.WaiverDeathPercentage / 100));
  }
}

// Instantiate the class
export const premiumCalculator = new premiumCalculations();