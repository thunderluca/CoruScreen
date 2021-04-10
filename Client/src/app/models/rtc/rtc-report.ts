// based on https://github.com/poplark/peerconnection-stats

const REPORT_KEYS_TO_READ: string[] = [
  'bytesSent','mediaType','type'
];

export class RtcReport extends Map<string, boolean | number | string> {
  public static Parse(statReports: RTCStatsReport): RtcReport[] {
    const rtcReports: RtcReport[] = [];

    statReports.forEach(report => {
      let rtcReport = new RtcReport();
      
      for (const key in report) {
        if (REPORT_KEYS_TO_READ.indexOf(key) > -1) {
          rtcReport.set(key, report[key]);
        }
      }
      
      rtcReports.push(rtcReport);
    });

    return rtcReports;
  }
}