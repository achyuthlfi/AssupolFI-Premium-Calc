import * as xml2js from "xml2js";
import tariffJsonData from "../data/TarrifResultXML.json";

interface Tariff {
  ID: number;
  fkTariffVersionID: number;
  Properties: string;
}

interface Properties {
  Age?: string;
  FuneralPrincipalFactor?: string;
  FuneralSpouseChildrenFactor?: string;
  FuneralOtherFactor?: string;
  FamilyIncomeFactor?: string;
  FuneralParentFactor?: string;
  CoverAmount?: string;
}

interface PropertiesDiscount {
  CoverAmount?: string;
  PercentagePrincipal?: string;
  PercentageSpouseChildren?: string;
  PercentageOther?: string;
  PercentageParent?: string;
}

const tariffJson: any = tariffJsonData;

const parser = new xml2js.Parser();

async function parseXMLProperties(xmlString: string): Promise<Properties> {
  return new Promise((resolve, reject) => {
    parser.parseString(xmlString, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        const properties: any = {};
        const xmlProps = result.Properties;
        Object.keys(xmlProps).forEach((key) => {
          properties[key as keyof any] = xmlProps[key][0];
        });
        resolve(properties);
      }
    });
  });
}

export async function findTariff(
  fkTariffVersionID: number,
  age: number,
  coverAmount: number
): Promise<Properties | any> {
  /* console.log(
    "Searching for Tariff with:",
    fkTariffVersionID,
    age,
    coverAmount
  ); */
  //console.log("Total Tariffs:", tariffJson.length);

  for (const item of tariffJson) {
    //console.log("Checking item:", item);
    if (item.fkTariffVersionID === fkTariffVersionID) {
      //console.log("Found matching fkTariffVersionID:", item);
      try {
        const properties = await parseXMLProperties(item.Properties);
        //console.log("Parsed Properties:", properties);
        if (
          parseInt(properties.Age || "0", 10) === age &&
          parseFloat(properties.CoverAmount || "0") === coverAmount
        ) {
          return properties;
        }
      } catch (error) {
        console.error("Error parsing XML:", error);
        return null;
      }
    }
  }

  console.log("No matching tariff found.");
  return null; // Return null if no matching record is found
}

export async function getTariffDiscountTariff(
  fkTariffVersionID: number,
  age: number,
  coverAmount: number
): Promise<Properties | any> {
  //console.log("Total Tariffs:", tariffJson.length);
  //console.log("fkTariffVersionID", fkTariffVersionID, age, coverAmount);
  for (const item of tariffJson) {
    //console.log("getTariffDiscountTariff item:", item);
    if (item.fkTariffVersionID === fkTariffVersionID) {
      //console.log("Found matching fkTariffVersionID:", item);
      try {
        const properties = await parseXMLProperties(item.Properties);
        //console.log("Parsed Properties:", properties);
        /* if (
          parseInt(properties.Age || "0", 10) === age &&
          parseFloat(properties.CoverAmount || "0") === coverAmount
        ) { */
        return properties;
        //}
      } catch (error) {
        console.error("Error parsing XML:", error);
        return null;
      }
    }
  }

  console.log("No matching tariff found.");
  return null; // Return null if no matching record is found
}

export async function getWaiverDeathPercentage(
  fkTariffVersionID: number
): Promise<Properties | any> {
  //console.log("Total Tariffs:", tariffJson.length);
  //console.log("fkTariffVersionID", fkTariffVersionID, age, coverAmount);
  for (const item of tariffJson) {
    //console.log("getTariffDiscountTariff item:", item);
    if (item.fkTariffVersionID === fkTariffVersionID) {
      //console.log("Found matching fkTariffVersionID:", item);
      try {
        const properties = await parseXMLProperties(item.Properties);
        //console.log("Parsed Properties:", properties);
        /* if (
          parseInt(properties.Age || "0", 10) === age &&
          parseFloat(properties.CoverAmount || "0") === coverAmount
        ) { */
        return properties;
        //}
      } catch (error) {
        console.error("Error parsing XML:", error);
        return null;
      }
    }
  }

  console.log("No matching tariff found.");
  return null; // Return null if no matching record is found
}

export async function getHealthPercentage(
  fkTariffVersionID: number,
  age: number
): Promise<Properties | any> {
  //console.log("Total Tariffs:", tariffJson.length);
  //console.log("fkTariffVersionID", fkTariffVersionID, age, coverAmount);
  for (const item of tariffJson) {
    //console.log("getTariffDiscountTariff item:", item);
    if (item.fkTariffVersionID === fkTariffVersionID) {
      //console.log("Found matching fkTariffVersionID:", item);
      try {
        const properties = await parseXMLProperties(item.Properties);
        //console.log("Parsed Properties:", properties);
        if (
          parseInt(properties.Age || "0", 10) === age
        ) {
        return properties;
        }
      } catch (error) {
        console.error("Error parsing XML:", error);
        return null;
      }
    }
  }

  console.log("No matching tariff found.");
  return null; // Return null if no matching record is found
}
