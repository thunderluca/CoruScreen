import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as SimplePeer from 'simple-peer';
import { Instance } from 'simple-peer';
import { Connection } from '../models/connection';
import { AudioReport } from '../models/rtc/audio-report';
import { RtcReport } from '../models/rtc/rtc-report';
import { VideoReport } from '../models/rtc/video-report';
import { SignalingData } from '../models/signaling-data';
import { LogService } from './log.service';
import { SignalingService } from './signaling.service';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private connection: Connection;
  private connections: Connection[] = [];

  private stream: Subject<SignalingData> = new Subject<SignalingData>();
  public stream$ = this.stream.asObservable();

  constructor(private log: LogService, private signaling: SignalingService) { }

  destroyPeers(clientIds: string[]): void {
    if (this.connections && clientIds) {
      clientIds.forEach(clientId => {
        const connection: Connection = this.connections[clientId];
        if (connection) {
          connection.peer.destroy();
        }
      })

      this.connections = [];
    }

    if (this.connection) {
      this.connection.peer.destroy();
      this.connection = null;
    }
  }

  getConnection(clientId: string): Connection {
    if (!this.connections) {
      return null;
    }
    
    return this.connections[clientId];
  }

  getOrCreateSpectatorPeer(clientId: string, stream: MediaStream): Instance {
    const logPrefix = 'RtcService.registerSpectatorPeer - ';

    const connection: Connection = this.connections[clientId];
    if (connection) {
      this.log.debug('Already found an existing connection for id "' + clientId + '"');
      return connection.peer;
    }

    const peer = new SimplePeer({ initiator: true, stream: stream });

    peer.on('signal', (data: SimplePeer.SignalData) => {
      this.signaling.sendDataAsync(clientId, data)
        .then(result => {
          if (result) {
            this.log.debug(logPrefix + 'RTC connection created');
          } else {
            this.log.error(logPrefix + 'RTC connection creation failed');
          }
        })
        .catch((error: any) => {
          this.log.error(logPrefix + error);
        });
    });

    peer.on('connect', () => {
      this.log.debug('Connected to peer with signaling id ' + clientId);
    });

    peer.on('close', () => {
      this.log.debug('Disconnected from peer with signaling id ' + clientId);
    });

    peer.on('error', (error: any) => {
      this.log.error('An error occured with peer that has signaling id ' + clientId + ': ' + JSON.stringify(error));
    });

    this.connections[clientId] = new Connection(clientId, peer);

    return peer;
  }

  getTotalBitrate(clientIds: string[]): number {
    if (!this.connections) {
      return 0;
    }

    let bitrate = 0;

    clientIds.forEach(clientId => {
      const connection: Connection = this.connections[clientId];
      if (connection) {
        bitrate += connection.totalBitrate;
      }
    })

    return bitrate;
  }

  isWebRTCAvailable(): boolean {
    return SimplePeer.WEBRTC_SUPPORT;
  }

  removePeer(clientId: string) {
    if (this.connections && this.connections[clientId]) {
      const connectionToDestroy: Connection = this.connections[clientId];
      if (connectionToDestroy) {
        connectionToDestroy.peer.destroy();

        delete this.connections[clientId];
      }
    }
  }

  signalPeer(initiator: boolean, clientId: string, signal: string, stream?: MediaStream): void {
    const data = JSON.parse(signal);

    let peer: Instance;

    if (initiator) {
      peer = this.getOrCreateSpectatorPeer(clientId, stream);
    } else {
      peer = this.getOrCreateStreamerPeer(clientId);
    }

    peer.signal(data);
  }

  async updateConnectionBitrate(clientId: string): Promise<void> {
    const logPrefix = 'RtcService.getPeerBytesSentAsync - ';

    if (!this.connections || !this.connections[clientId]) {
      return null;
    }

    const connection: Connection = this.connections[clientId];
    if ('_pc' in connection.peer) {
      const nativeClient = connection.peer['_pc'] as RTCPeerConnection;

      try {
        const statReports = await nativeClient.getStats();

        const reports = RtcReport.Parse(statReports);
  
        const audioReports = new AudioReport(reports);
        const videoReports = new VideoReport(reports);
  
        if (audioReports) {
          connection.updateAudioBytesSent(audioReports.bytesSent);
        }
  
        if (videoReports) {
          connection.updateVideoBytesSent(videoReports.bytesSent);
        }
      } catch (error: any) {
        this.log.error(logPrefix + error);
      }     
    }
  }

  private getOrCreateStreamerPeer(clientId: string): Instance {
    const logPrefix = 'RtcService.registerStreamerPeer - ';

    const connection: Connection = this.connection;
    if (connection) {
      this.log.debug('Already found an existing connection for id "' + clientId + '"');
      return connection.peer;
    }

    const peer = new SimplePeer();

    peer.on('signal', (data: SimplePeer.SignalData) => {
      this.signaling.sendDataAsync(clientId, data)
        .then(result => {
          if (result) {
            this.log.debug(logPrefix + 'RTC connection created');
          } else {
            this.log.error(logPrefix + 'RTC connection creation failed');
          }
        })
        .catch((error: any) => {
          this.log.error(logPrefix + error);
        });
    });

    peer.on('connect', () => {
      this.log.debug('Connected to peer with signaling id ' + clientId);
    });

    peer.on('close', () => {
      this.log.debug('Disconnected from peer with signaling id ' + clientId);
    });

    peer.on('error', (error: any) => {
      this.log.error('An error occured with peer that has signaling id ' + clientId + ': ' + JSON.stringify(error));
    });

    peer.on('stream', (stream: MediaStream) => {
      this.stream.next({ clientId, data: stream });
    });

    this.connection = new Connection(clientId, peer);

    return peer;
  }
}
