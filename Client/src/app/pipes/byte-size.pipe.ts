import { Pipe, PipeTransform } from '@angular/core';
import { ByteHelper } from '../helpers/byte-helper';

@Pipe({
  name: 'byteSize'
})
export class ByteSizePipe implements PipeTransform {
  transform(value: number): string {
    return ByteHelper.formatBytes(value);
  }
}
