import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SignalingConfiguration } from '../models/signaling-configuration';
import { ConfigurationService } from './configuration.service';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private connection: HubConnection;
  
  private viewers: BehaviorSubject<Array<string>>;
  public viewers$: Observable<Array<string>>;

  private streamStopped: Subject<boolean> = new Subject<boolean>();
  public streamStopped$ = this.streamStopped.asObservable();

  constructor(
    configuration: ConfigurationService,
    private log: LogService
  ) {
    this.viewers = new BehaviorSubject([]);
    this.viewers$ = this.viewers.asObservable();

    if (!configuration.exists('signaling')) {
      throw new Error('Signaling configuration not found!');
    }

    const signaling = configuration.get<SignalingConfiguration>('signaling');

    let connectionBuilder = new HubConnectionBuilder()
      .withUrl(signaling.url);

      if (signaling.logLevel) {
        connectionBuilder = connectionBuilder.configureLogging(signaling.logLevel);
      }

    this.connection = connectionBuilder.build();
  }

  async createAsync(id: string): Promise<boolean> {
    const logPrefix = 'SignalingService.createAsync - ';

    this.connection.on('userJoined', (guestId: string) => this.onUserJoined(guestId));

    this.connection.on('userLeaved', (guestId: string) => this.onUserLeaved(guestId));

    try {
      await this.connection.invoke('create', id);

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  async endStreamAsync(id: string): Promise<boolean> {
    const logPrefix = 'SignalingService.endStreamAsync - ';

    try {
      await this.connection.invoke('endStream', id);

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  async joinAsync(id: string): Promise<boolean> {
    const logPrefix = 'SignalingService.joinAsync - ';

    this.connection.on('streamEnded', () => this.streamStopped.next(true));

    try {
      await this.connection.invoke('join', id);

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  async leaveAsync(id: string): Promise<boolean> {
    const logPrefix = 'SignalingService.leaveAsync - ';

    try {
      await this.connection.invoke('leave', id);

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  registerCallback(methodName: string, callback: (args: any[]) => void): void {
    this.connection.on(methodName, (...args: any[]) => {
      const flatArgs = args.reduce((a, val) => a.concat(val), []);
      callback(flatArgs);
    });
  }

  async sendDataAsync(clientId: string, data: any): Promise<boolean> {
    const logPrefix = 'SignalingService.sendDataAsync - ';

    try {
      await this.connection.invoke('sendSignal', clientId, JSON.stringify(data));

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  async startAsync(): Promise<boolean> {
    const logPrefix = 'SignalingService.startAsync - ';

    try {
      await this.connection.start();

      this.log.debug(logPrefix + 'Signal connection started');

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  async stopAsync(): Promise<boolean> {
    const logPrefix = 'SignalingService.stopAsync - ';

    try {
      await this.connection.stop();

      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);

      return false;
    }
  }

  private onUserJoined(id: string): void {
    const logPrefix = 'SignalingService.onUserJoined - ';

    if (this.viewers.getValue().indexOf(id) > -1) {
      this.log.warn(logPrefix + 'User with id "' + id + '" is already registered, skipping it');
    } else {
      this.viewers.next([...this.viewers.getValue(), id]);
    }
  }

  private onUserLeaved(id: string): void {
    const logPrefix = 'SignalingService.onUserLeaved - ';

    if (this.viewers.getValue().indexOf(id) === -1) {
      this.log.warn(logPrefix + 'User with id "' + id + '" is already removed, skipping it');
    } else {
      this.viewers.next(this.viewers.getValue().filter(vid => vid !== id));
    }
  }
}
