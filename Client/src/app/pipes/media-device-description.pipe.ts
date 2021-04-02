import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mediaDeviceDescription'
})
export class MediaDeviceDescriptionPipe implements PipeTransform {
  transform(value: MediaDeviceInfo): string {
    return value.label + ' (id: ' + value.deviceId + ')';
  }
}
