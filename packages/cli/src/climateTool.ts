import {
  readFileSync,
  existsSync,
  accessSync,
  constants as fsConstants
} from "fs";
import { Chalk } from "chalk";
import { parse } from "csv-parse/sync";

import { monthNames, daysPerMonth, ClimateMonth, TotalsRow } from "./models.js";
import climateTable from "./climateTable.js";

const chalk = new Chalk({ level: 3 });

const error = (err: any) => {
  console.error(chalk.bold("ERR: ") + err);
  process.exit(-1);
};

export const cToF = (celsiusTemp: number): number => {
  return Math.round((9 * celsiusTemp) / 5) + 32;
};

const argv = process.argv.slice(2);

if (argv.length !== 1) {
  error("Usage: npm run climateTool <path to climate .csv data file>");
}

const [filePath] = argv;

if (!existsSync(filePath)) {
  error("File not found or path invalid");
}

try {
  accessSync(filePath, fsConstants.R_OK);
} catch (err) {
  error("Permission denied on reading file");
}

const climateData = readFileSync(filePath, { encoding: "utf8" }).replace(
  /^\uFEFF/,
  ""
);

const NUMBERS_COLUMNS = [
  "Longitude (x)",
  "Latitude (y)",
  "Climate ID",
  "Year",
  "Month",
  "Day",
  "Max Temp (°C)",
  "Min Temp (°C)",
  "Mean Temp (°C)",
  "Heat Deg Days (°C)",
  "Cool Deg Days (°C)",
  "Total Rain (mm)",
  "Total Snow (cm)",
  "Total Precip (mm)",
  "Snow on Grnd (cm)",
  "Dir of Max Gust (10s deg)",
  "Spd of Max Gust (km/h)"
];
const DATE_COLUMNS = ["Date/Time"];

const parseCast = (value: any, context: any) => {
  let castValue = null;
  switch (true) {
    case NUMBERS_COLUMNS.includes(context.column):
      try {
        castValue = Math.round(Number(value) * 100) / 100;
      } catch (e) {
        console.error(e);
        castValue = String(value);
      }
      return castValue;
    case DATE_COLUMNS.includes(context.column):
      try {
        castValue = new Date(value);
      } catch (e) {
        console.error(e);
        castValue = String(value);
      }
      return castValue;
    default:
      return String(value);
  }
};

const records = parse(climateData, {
  columns: true,
  trim: true,
  cast: parseCast
});

let daysSoFar = 0;
let maxTempYear = null;
let minTempYear = null;
let totalTempYear = 0;
let totalPrecipYear = 0;
let totalDaysData = 0;

const months: ClimateMonth[] = [];

for (const monthNumber of Array.from({ length: 12 }, (_, index) => ++index)) {
  const monthName = monthNames[monthNumber - 1];
  const daysInMonth = daysPerMonth[monthNumber - 1];
  const recordsInMonth = records.slice(daysSoFar, daysSoFar + daysInMonth);
  let daysWithData = 0;

  let totalTemperature = 0;
  let highestTemperature = null;
  let lowestTemperature = null;
  let precipitationTotal = 0;

  for (const record of recordsInMonth) {
    if (record["Max Temp Flag"] !== "M") {
      daysWithData++;
      totalDaysData++;
      totalTemperature += record["Mean Temp (°C)"];
      totalTempYear += record["Mean Temp (°C)"];

      if (
        highestTemperature === null ||
        record["Max Temp (°C)"] > highestTemperature
      ) {
        highestTemperature = record["Max Temp (°C)"];
      }

      if (maxTempYear === null || record["Max Temp (°C)"] > maxTempYear) {
        maxTempYear = record["Max Temp (°C)"];
      }
    }
    if (record["Min Temp Flag"] !== "M") {
      if (
        lowestTemperature === null ||
        record["Min Temp (°C)"] < lowestTemperature
      ) {
        lowestTemperature = record["Min Temp (°C)"];
      }

      if (minTempYear === null || record["Min Temp (°C)"] < minTempYear) {
        minTempYear = record["Min Temp (°C)"];
      }
    }
    if (record["Total Precip Flag"] !== "M") {
      precipitationTotal += record["Total Precip (mm)"];
      totalPrecipYear += record["Total Precip (mm)"];
    }
  }

  const thisMonth: ClimateMonth = {
    name: monthName,
    highest: `${highestTemperature.toFixed(1)}ºC/${cToF(highestTemperature)}ºF`,
    lowest: `${lowestTemperature.toFixed(1)}ºC/${cToF(lowestTemperature)}ºF`,
    average: `${(totalTemperature / daysWithData).toFixed(1)}ºC/${cToF(
      totalTemperature / daysWithData
    )}ºF`,
    precipitation: `${(precipitationTotal / 10).toFixed(1)}cm/${(
      precipitationTotal / 25.4
    ).toFixed(1)}in`
  };

  months.push(thisMonth);

  daysSoFar += daysInMonth;
}

const totalsRow: TotalsRow = {
  maxTemp: `${maxTempYear.toFixed(1)}ºC/${cToF(maxTempYear)}ºF`,
  minTemp: `${minTempYear.toFixed(1)}ºC/${cToF(minTempYear)}ºF`,
  avgTemp: `${(totalTempYear / totalDaysData).toFixed(1)}ºC/${cToF(
    totalTempYear / totalDaysData
  )}ºF`,
  totalPrecip: `${Math.round(totalPrecipYear / 10)}cm/${
    Math.round((10 * totalPrecipYear) / (10 * 2.54)) / 10
  }in`
};

climateTable(
  chalk,
  records[0]["Station Name"],
  records[0]["Climate ID"],
  records[0]["Latitude (y)"],
  records[0]["Longitude (x)"],
  months,
  totalsRow
);
