import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as SimplePeer from 'simple-peer';
import { Instance } from 'simple-peer';
import { SignalingData } from '../models/signaling-data';
import { LogService } from './log.service';
import { SignalingService } from './signaling.service';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  private connection: Instance;
  private connections: Instance[] = [];

  private stream: Subject<SignalingData> = new Subject<SignalingData>();
  public stream$ = this.stream.asObservable();

  constructor(private log: LogService, private signaling: SignalingService) { }

  destroyPeers(): void {
    if (this.connections) {
      this.connections.forEach(peer => peer.destroy());
      this.connections = [];
    }

    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
  }

  getOrCreateSpectatorPeer(clientId: string, stream: MediaStream): Instance {
    const logPrefix = 'RtcService.registerSpectatorPeer - ';

    let peer: Instance = this.connections[clientId];
    if (peer) {
      this.log.debug('Already found an existing connection for id "' + clientId + '"');
      return peer;
    }

    peer = new SimplePeer({ initiator: true, stream: stream });

    peer.on('signal', (data: any) => {
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

    this.connections[clientId] = peer;

    return peer;
  }

  isWebRTCAvailable(): boolean {
    return SimplePeer.WEBRTC_SUPPORT;
  }

  removePeer(clientId: string) {
    if (this.connections && this.connections[clientId]) {
      const peerToDestroy: Instance = this.connections[clientId];
      if (peerToDestroy) {
        peerToDestroy.destroy();

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

  private getOrCreateStreamerPeer(clientId: string): Instance {
    const logPrefix = 'RtcService.registerStreamerPeer - ';

    let peer: Instance = this.connection;
    if (peer) {
      this.log.debug('Already found an existing connection for id "' + clientId + '"');
      return peer;
    }

    peer = new SimplePeer();

    peer.on('signal', (data: any) => {
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

    peer.on('stream', (stream: any) => {
      this.stream.next({ clientId, data: stream });
    });

    this.connection = peer;

    return peer;
  }
}
