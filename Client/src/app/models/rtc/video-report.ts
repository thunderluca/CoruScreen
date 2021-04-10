import { IMediaReport } from "./i-media-report";
import { MediaReport } from "./media-report";

export class VideoReport extends MediaReport implements IMediaReport {
    get bytesSent(): number {
        return this.findNumberValue('bytesSent', { mediaType: 'video', type: 'outbound-rtp' });
    }
}