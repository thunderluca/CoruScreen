import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { groupBy, mergeMap, reduce, toArray } from 'rxjs/operators';
import { GroupOf } from '../models/group-of';
import { Size } from '../models/size';

@Component({
  selector: 'app-video-options',
  templateUrl: './video-options.component.html',
  styleUrls: ['./video-options.component.css']
})
export class VideoOptionsComponent implements OnInit {

  availableFrameRates: number[] = this.getCommonFrameRates();
  availableSizes: GroupOf<Size>[] = [];
  selectedFrameRate?: number = 0;
  selectedSize?: Size = null;
  useSourceAudio: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.updateAvailableSizes();
  }

  private getCommonFrameRates(): number[] {
    return [
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120
    ];
  }

  private updateAvailableSizes(aspectRatioToFilter?: string): void {
    from(Size.getCommonDisplaySizes(aspectRatioToFilter))
      .pipe(
        groupBy(size => size.aspectRatio),
        mergeMap(group => group.pipe(
          reduce((g, item) => {
            g.items.push(item);
            return g;
          }, new GroupOf<Size>(group.key, []))
        )),
        toArray()
      )
      .subscribe(result => {
        this.availableSizes = result;
      });
  }
}
