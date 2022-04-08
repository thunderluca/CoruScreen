import { Component } from '@angular/core';
import { StringHelper } from '../helpers/string-helper';
import { LogService } from '../services/log.service';
import { MediaService } from '../services/media.service';

@Component({
  selector: 'app-device-selector',
  templateUrl: './device-selector.component.html',
  styleUrls: ['./device-selector.component.css']
})
export class DeviceSelectorComponent {
  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId?: string = null;
  validDeviceId: boolean = true;

  private selectedDeviceKinds: MediaDeviceKind[] = [];

  constructor(private log: LogService, private media: MediaService) { }

  loadDeviceList(kinds: MediaDeviceKind[]): void {
    const logPrefix = 'DeviceSelectorComponent.loadDeviceList - ';

    if (!this.selectedDeviceKinds || this.selectedDeviceKinds.length === 0) {
      this.selectedDeviceKinds = kinds;
    }

    this.media.getAvailableInputDevicesAsync(kinds)
      .then(devices => {
        if (!devices || !devices.length || devices.length === 0) {
          this.log.debug(logPrefix + 'Devices not found');
          this.availableDevices = [];
        }
      
        this.availableDevices = devices;
      });
  }

  refreshList(): void {
    this.loadDeviceList(this.selectedDeviceKinds);
  }

  reset(): void {
    this.selectedDeviceId = null;
    this.validDeviceId = true;
  }

  validate(): boolean {
    return !StringHelper.nullOrWhiteSpace(this.selectedDeviceId);
  }
}
