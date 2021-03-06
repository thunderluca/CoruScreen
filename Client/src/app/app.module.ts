import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StreamerComponent } from './streamer/streamer.component';
import { ViewerComponent } from './viewer/viewer.component';
import { SizePipe } from './pipes/size.pipe';
import { TopNavBarComponent } from './top-nav-bar/top-nav-bar.component';
import { VideoOptionsComponent } from './video-options/video-options.component';
import { DeviceSelectorComponent } from './device-selector/device-selector.component';
import { MediaDeviceDescriptionPipe } from './pipes/media-device-description.pipe';
import { NotSupportedComponent } from './not-supported/not-supported.component';
import { ShareStreamComponent } from './share-stream/share-stream.component';
import { BrowserNotSupportedComponent } from './browser-not-supported/browser-not-supported.component';
import { OperatingSystemsPipe } from './pipes/operating-systems.pipe';
import { ByteSizePipe } from './pipes/byte-size.pipe';
import { StreamStatsComponent } from './stream-stats/stream-stats.component';
import { FullByteSizePipe } from './pipes/full-byte-size.pipe';

@NgModule({
  declarations: [
    AppComponent,
    StreamerComponent,
    ViewerComponent,
    SizePipe,
    TopNavBarComponent,
    VideoOptionsComponent,
    DeviceSelectorComponent,
    MediaDeviceDescriptionPipe,
    NotSupportedComponent,
    ShareStreamComponent,
    BrowserNotSupportedComponent,
    OperatingSystemsPipe,
    ByteSizePipe,
    StreamStatsComponent,
    FullByteSizePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
