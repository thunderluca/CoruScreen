import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private configuration = {};

  constructor() {
    this.configuration = environment;
  }

  exists(key: string): boolean {
    return key in this.configuration;
  }

  get<T>(key: string): T {
    return this.configuration[key];
  }
}
