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

@NgModule({
  declarations: [
    AppComponent,
    StreamerComponent,
    ViewerComponent,
    SizePipe,
    TopNavBarComponent,
    VideoOptionsComponent,
    DeviceSelectorComponent,
    MediaDeviceDescriptionPipe
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