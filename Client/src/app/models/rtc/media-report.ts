// based on https://github.com/poplark/peerconnection-stats

import { IReport } from "./i-report";
import { RtcReport } from "./rtc-report";

export class MediaReport {
  private reports: RtcReport[];

  constructor(reports: RtcReport[]) {
    this.reports = reports;
  }

  find(key: string, filter?: { [key: string]: boolean | number | string; }): IReport[] {
    const result: IReport[] = [];

    this.reports.forEach(report => {
      let keyValueFound = true;
       
      if (filter) {
        for (const filterKey in filter) {
          if (filter[filterKey] === undefined) {
            keyValueFound = report.has(filterKey);
          } else {
            keyValueFound = filter[filterKey] === report.get(filterKey);
          }
              
          if (!keyValueFound) {
            break;
          }
        }
      }
        
      if (keyValueFound && report.has(key)) {
        result.push({
          key,
          value: report.get(key) as (boolean | number | string),
          ref: report
        });
      }
    });

    return result;
  }

  protected findNumberValue(key: string, condition?: { [key: string]: boolean | number | string; }): number {
    const result = this.find(key, condition);
    if (result && result[0]) {
      return this.parse(result[0].value) as number;
    }

    return -1;
  }

  private parse(content: any): boolean | number | string {
    if (typeof content === 'boolean') {
      return content as boolean;
    }

    if (typeof content === 'number') {
      return content as number;
    }

    return content as string;
  }
}