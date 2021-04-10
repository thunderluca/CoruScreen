// based on https://github.com/poplark/peerconnection-stats

export class RtcReport extends Map<string, boolean | number | string> {
  public static Parse(statReports: RTCStatsReport): RtcReport[] {
    const rtcReports: RtcReport[] = [];

    statReports.forEach(report => {
      let rtcReport = new RtcReport();
      
      for (const key in report) {
        rtcReport.set(key, report[key]);
      }
      
      rtcReports.push(rtcReport);
    });

    return rtcReports;
  }
}