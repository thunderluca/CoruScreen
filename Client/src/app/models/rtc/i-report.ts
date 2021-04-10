import { RtcReport } from "./rtc-report";

export interface IReport {
    key: string;
    value: boolean | number | string;
    ref: RtcReport;
}