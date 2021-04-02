import { Pipe, PipeTransform } from '@angular/core';
import { Size } from '../models/size';

@Pipe({
  name: 'size'
})
export class SizePipe implements PipeTransform {
  transform(value: Size): string {
    return value.width + 'x' + value.height + ' (' + value.standardName + ')';
  }
}
