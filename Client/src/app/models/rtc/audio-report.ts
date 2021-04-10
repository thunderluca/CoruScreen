// based on https://github.com/poplark/peerconnection-stats

import { IMediaReport } from "./i-media-report";
import { MediaReport } from "./media-report";

export class AudioReport extends MediaReport implements IMediaReport {
    get bytesSent(): number {
        return this.findNumberValue('bytesSent', { mediaType: 'audio', type: 'outbound-rtp' });
    }
}