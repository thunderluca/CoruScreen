// based on https://github.com/poplark/peerconnection-stats

import { RtcReport } from "./rtc-report";

export interface IReport {
    key: string;
    value: boolean | number | string;
    ref: RtcReport;
}