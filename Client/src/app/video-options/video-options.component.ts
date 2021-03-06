import { Component, OnInit, ViewChild } from '@angular/core';
import { from } from 'rxjs';
import { groupBy, mergeMap, reduce, toArray } from 'rxjs/operators';
import { DeviceSelectorComponent } from '../device-selector/device-selector.component';
import { GroupOf } from '../models/group-of';
import { Size } from '../models/size';

@Component({
  selector: 'app-video-options',
  templateUrl: './video-options.component.html',
  styleUrls: ['./video-options.component.css']
})
export class VideoOptionsComponent implements OnInit {
  @ViewChild(DeviceSelectorComponent) deviceSelector: DeviceSelectorComponent;

  availableFrameRates: number[] = this.getCommonFrameRates();
  availableSizes: GroupOf<Size>[] = [];
  selectedFrameRate?: number = 0;
  selectedSize?: Size = null;
  useSecondaryAudioSource: boolean;
  useSourceAudio: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.updateAvailableSizes();
  }

  onSecondaryAudioSourceChanged(): void {
    if (this.useSecondaryAudioSource) {
      this.deviceSelector.loadDeviceList(['audioinput', 'audiooutput']);
    }
  }

  reset(): void {
    this.selectedFrameRate = 0;
    this.selectedSize = null;
    this.useSourceAudio;
    this.useSecondaryAudioSource = false;
    
    if (this.deviceSelector) {
      this.deviceSelector.reset();
    }
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
