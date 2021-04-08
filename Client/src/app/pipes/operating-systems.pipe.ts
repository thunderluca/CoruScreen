import { Pipe, PipeTransform } from '@angular/core';
import { OperatingSystem } from '../models/operating-system';

@Pipe({
  name: 'operatingSystems'
})
export class OperatingSystemsPipe implements PipeTransform {

  transform(value: OperatingSystem[]): string {
    if (!value || value.length === 0) {
      return '';
    }

    return value.join(', ');
  }
}
