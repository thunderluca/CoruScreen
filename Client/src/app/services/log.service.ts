import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private isDebugMode: boolean;

  constructor(configuration: ConfigurationService) {
    this.isDebugMode = configuration.get('debug') as boolean;
  }

  debug(message: string | any) {
    this.write(message, '[DEBUG]');
  }

  error(message: string | any) {
    this.write(message, '[ERROR]');
  }

  info(message: string | any) {
    this.write(message, '[INFO]');
  }

  warn(message: string | any) {
    this.write(message, '[WARNING]');
  }

  private write(message: string, prefix: string) {
    if (this.isDebugMode) {
      console.log(prefix + ' ' + message);
    }
  }
}
