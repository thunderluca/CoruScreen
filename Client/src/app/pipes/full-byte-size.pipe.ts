import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullByteSize'
})
export class FullByteSizePipe implements PipeTransform {

  // based on https://stackoverflow.com/a/18650828/2401333
  transform(value: number, ...args: unknown[]): string {
    if (value === 0) {
      return '0 B';
    }

    const decimals = args && args[0] ? args[0] as number : null;

    const k = 1024;
    const dm = !decimals || decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(value) / Math.log(k));

    return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
