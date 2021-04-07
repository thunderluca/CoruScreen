import { Injectable } from '@angular/core';
import { Size } from '../models/size';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(private log: LogService) {}

  async getAvailableInputDevicesAsync(kinds: MediaDeviceKind[]): Promise<MediaDeviceInfo[]> {
    const logPrefix = 'MediaService.getAvailableInputDevices - ';

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      this.log.error(logPrefix + 'navigator.mediaDevices.enumerateDevices() is not supported.');
      return [];
    }

    let devices = await navigator.mediaDevices.enumerateDevices();

    devices = devices.filter(device => device.label != '' && kinds.indexOf(device.kind) > -1);

    return devices;
  }

  disposeStream(stream: MediaStream, removeTracks: boolean) {
    if (!stream) {
      return;
    }

    stream.getTracks()
      .forEach(track => {
        track.stop();
        if (removeTracks) {
          stream.removeTrack(track);
        }
      });
  }

  getDisplay(
    audioEnabled: boolean,
    frameRate?: number,
    idealSize?: Size): Promise<MediaStream> {
    //https://github.com/microsoft/TypeScript/issues/33232
    const mediaDevices = navigator.mediaDevices as any;

    const constraints = this.buildVideoConstraints(audioEnabled, null, frameRate, idealSize);

    return mediaDevices.getDisplayMedia(constraints);
  }

  getAudioDevice(deviceId: string) {
    const constraints: MediaStreamConstraints = {
      video: false,
      audio: {
        deviceId: deviceId
      }
    };

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  getVideoDevice(
    deviceId: string,
    audioEnabled: boolean,
    frameRate?: number,
    idealSize?: Size): Promise<MediaStream> {
    const constraints = this.buildVideoConstraints(audioEnabled, deviceId, frameRate, idealSize);

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  async tryGetMicrophonePermission(): Promise<boolean> {
    try {
      const devices = await this.getAvailableInputDevicesAsync(['videoinput']);
      if (devices && devices.length > 0) {
        return true;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.disposeStream(stream, true);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  async tryGetWebcamPermission(): Promise<boolean> {
    try {
      const devices = await this.getAvailableInputDevicesAsync(['audioinput', 'audiooutput']);
      if (devices && devices.length > 0) {
        return true;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      this.disposeStream(stream, true);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  private buildVideoConstraints(
    audioEnabled: boolean,
    deviceId?: string,
    frameRate?: number,
    idealSize?: Size): MediaStreamConstraints {
    const constraints: MediaStreamConstraints = {
      video: true,
      audio: audioEnabled
    };

    if (deviceId || (frameRate && frameRate > 0) || idealSize) {
      const videoOptions: MediaTrackConstraints = {};

      if (deviceId) {
        videoOptions.deviceId = deviceId;
      }

      if (frameRate) {
        videoOptions.frameRate = frameRate;
      }

      if (idealSize) {
        videoOptions.height = {
          ideal: idealSize.height
        };
        videoOptions.width = {
          ideal: idealSize.width
        };
      }

      constraints.video = videoOptions;
    }

    this.log.debug('Requested video source with constraints: ' + JSON.stringify(constraints));

    return constraints;
  }
}
