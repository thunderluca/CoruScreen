import { Instance } from "simple-peer";

export class Connection {
  public audioBitrate: number = 0;
  public audioBytesSent: number = 0;
  public id: string;
  public peer: Instance;
  public videoBitrate: number = 0;
  public videoBytesSent: number = 0;

  public get totalBitrate(): number {
    return this.audioBitrate + this.videoBitrate;
  }

  public get totalBytesSent(): number {
    return this.audioBytesSent + this.videoBytesSent;
  }

  constructor(id: string, peer: Instance) {
    this.id = id;
    this.peer = peer;
  }

  updateAudioBytesSent(newValue: number): void {
    if (this.audioBytesSent === 0) {
      this.audioBitrate = newValue;
    } else {
      this.audioBitrate = newValue - this.audioBytesSent;
    }    
    this.audioBytesSent = newValue;
  }

  updateVideoBytesSent(newValue: number): void {
    if (this.videoBytesSent === 0) {
      this.videoBitrate = newValue;
    } else {
      this.videoBitrate = newValue - this.videoBytesSent;
    }    
    this.videoBytesSent = newValue;
  }
}