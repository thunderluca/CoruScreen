import { Instance } from "simple-peer";

export class Connection {
  public peer: Instance;
  public bitrate: number = 0;
  public bytesSent: number = -1;

  constructor(peer: Instance) {
    this.peer = peer;
  }

  updateBytesSent(newValue: number) {
    if (this.bytesSent === -1) {
      this.bitrate = newValue;
    } else {
      this.bitrate = newValue - this.bytesSent;
    }    
    this.bytesSent = newValue;
  }
}