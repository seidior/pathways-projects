export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export interface ClimateMonth {
  name: string;
  highest: string;
  lowest: string;
  average: string;
  precipitation: string;
}

export interface TotalsRow {
  maxTemp: string;
  minTemp: string;
  avgTemp: string;
  totalPrecip: string;
}
