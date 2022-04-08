import { Injectable } from '@angular/core';
import { Size } from '../models/size';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private navigatorPermissions = navigator.permissions as any;

  constructor(private log: LogService) {}

  async getAvailableInputDevicesAsync(kinds: MediaDeviceKind[]): Promise<MediaDeviceInfo[]> {
    const logPrefix = 'MediaService.getAvailableInputDevices - ';

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      this.log.error(logPrefix + 'navigator.mediaDevices.enumerateDevices() is not supported.');
      return [];
    }

    let devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter(device => device.label != '' && kinds.indexOf(device.kind) > -1);
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

  async queryMicrophonePermissionAsync(): Promise<PermissionState> {
    const logPrefix = 'MediaService.queryMicrophonePermissionAsync - ';
    
    try {
      if (!navigator.permissions || !navigator.permissions.query) {
        return null;
      }

      const permissionStatus = await this.navigatorPermissions.query({ name:'microphone' });
      return permissionStatus.state;
    } catch (error: any) {
      this.log.error(logPrefix + error);
      return null;
    }
  }

  async queryWebcamPermissionAsync(): Promise<PermissionState> {
    const logPrefix = 'MediaService.queryWebcamPermissionAsync - ';

    try {
      if (!navigator.permissions || !navigator.permissions.query) {
        return null;
      }

      const permissionStatus = await this.navigatorPermissions.query({ name:'camera' });
      return permissionStatus.state;
    } catch (error: any) {
      this.log.error(logPrefix + error);
      return null;
    }
  }

  async requestMicrophonePermissionAsync(): Promise<boolean> {
    const logPrefix = 'MediaService.requestMicrophonePermissionAsync - ';

    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.disposeStream(tempStream, true);
      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);
      return false;
    }
  }

  async requestWebcamPermissionAsync(): Promise<boolean> {
    const logPrefix = 'MediaService.requestWebcamPermissionAsync - ';

    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      this.disposeStream(tempStream, true);
      return true;
    } catch (error: any) {
      this.log.error(logPrefix + error);
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
