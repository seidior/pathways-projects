import type { ChalkInstance } from "chalk";

import { ClimateMonth, TotalsRow } from "./models.js";

const climateTable = (
  chalk: ChalkInstance,
  stationName: string,
  stationId: number,
  latitude: number,
  longitude: number,
  monthData: ClimateMonth[],
  totalsRow: TotalsRow
) => {
  // Station Name & ID
  process.stdout.write(` ${chalk.bold("Station:")}`);
  process.stdout.write("\t");
  process.stdout.write(stationName);
  process.stdout.write(` (${stationId})`);
  process.stdout.write("\n");

  // Station Lat/Long
  process.stdout.write(` ${chalk.bold("Location:")}`);
  process.stdout.write("\t");
  process.stdout.write(Math.abs(latitude).toFixed(2));

  if (latitude < 0) {
    process.stdout.write("ºS");
  } else {
    process.stdout.write("ºN");
  }

  process.stdout.write("\t");
  process.stdout.write(Math.abs(longitude).toFixed(2));

  if (longitude < 0) {
    process.stdout.write("ºW");
  } else {
    process.stdout.write("ºE");
  }

  process.stdout.write("\n\n");

  // Table Headers
  process.stdout.write(
    `┌${"".padEnd(12, "─")}┬${"".padEnd(15, "─")}┬${"".padEnd(
      15,
      "─"
    )}┬${"".padEnd(15, "─")}┬${"".padEnd(15, "─")}┐\n`
  );
  process.stdout.write(
    `│ ${[
      chalk.bold("month".padStart(10, " ")),
      chalk.bold("max temp".padStart(13, " ")),
      chalk.bold("min temp".padStart(13, " ")),
      chalk.bold("avg temp".padStart(13, " ")),
      chalk.bold("total precip".padStart(13, " ")),
      "\n"
    ].join(" │ ")}`
  );
  process.stdout.write(
    `├${"".padEnd(12, "─")}┼${"".padEnd(15, "─")}┼${"".padEnd(
      15,
      "─"
    )}┼${"".padEnd(15, "─")}┼${"".padEnd(15, "─")}┤\n`
  );

  // Data Output

  for (const thisMonth of monthData) {
    const leftPadMonthName = `│ ${thisMonth.name.padStart(10, " ")}`;

    process.stdout.write(
      [
        leftPadMonthName,
        thisMonth.highest.padStart(13, " "),
        thisMonth.lowest.padStart(13, " "),
        thisMonth.average.padStart(13, " "),
        thisMonth.precipitation.padStart(13, " "),
        "\n"
      ].join(" │ ")
    );
  }

  // Totals
  process.stdout.write(
    `├${"".padEnd(12, "─")}┼${"".padEnd(15, "─")}┼${"".padEnd(
      15,
      "─"
    )}┼${"".padEnd(15, "─")}┼${"".padEnd(15, "─")}┤\n`
  );
  process.stdout.write(
    `│ ${[
      "totals".padStart(10, " "),
      totalsRow.maxTemp.padStart(13, " "),
      totalsRow.minTemp.padStart(13, " "),
      totalsRow.avgTemp.padStart(13, " "),
      totalsRow.totalPrecip.padStart(13, " "),
      "\n"
    ].join(" │ ")}`
  );
  process.stdout.write(
    `└${"".padEnd(12, "─")}┴${"".padEnd(15, "─")}┴${"".padEnd(
      15,
      "─"
    )}┴${"".padEnd(15, "─")}┴${"".padEnd(15, "─")}┘\n\n`
  );
};

export default climateTable;
