import { Component, OnInit } from '@angular/core';
import { LogService } from '../services/log.service';
import { MediaService } from '../services/media.service';

@Component({
  selector: 'app-device-selector',
  templateUrl: './device-selector.component.html',
  styleUrls: ['./device-selector.component.css']
})
export class DeviceSelectorComponent implements OnInit {
  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId?: string = null;
  validDeviceId: boolean = true;

  constructor(private log: LogService, private media: MediaService) { }

  ngOnInit(): void {
  }

  loadDeviceList(kinds: MediaDeviceKind[]): void {
    const logPrefix = 'DeviceSelectorComponent.loadDeviceList - ';

    this.media.getAvailableInputDevicesAsync(kinds)
      .then(devices => {
        if (!devices || !devices.length || devices.length === 0) {
          this.log.debug(logPrefix + 'Devices not found');
          this.availableDevices = [];
        }
      
        this.availableDevices = devices;
      });
  }

  reset(): void {
    this.selectedDeviceId = null;
    this.validDeviceId = true;
  }

  validate(): boolean {
    this.validDeviceId = this.selectedDeviceId !== undefined && this.selectedDeviceId !== null && this.selectedDeviceId.trim() !== '';

    return this.validDeviceId;
  }
}
