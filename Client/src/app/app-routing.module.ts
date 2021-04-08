import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReverseCompatibilityActivator } from './activators/reverse-compatibility.activator';
import { StreamerCompatibilityActivator } from './activators/streamer-compatibility.activator';
import { WebRTCCompatibilityActivator } from './activators/webrtc-compatibility.activator';
import { BrowserNotSupportedComponent } from './browser-not-supported/browser-not-supported.component';
import { NotSupportedComponent } from './not-supported/not-supported.component';
import { StreamerComponent } from './streamer/streamer.component';
import { ViewerComponent } from './viewer/viewer.component';

const routes: Routes = [
  { path: '', redirectTo: '/stream', pathMatch: 'full' },
  { path: 'browsernotsupported', component: BrowserNotSupportedComponent, canActivate: [ReverseCompatibilityActivator] },
  { path: 'notsupported', component: NotSupportedComponent, canActivate: [ReverseCompatibilityActivator] },
  { path: 'stream', component: StreamerComponent, canActivate: [WebRTCCompatibilityActivator, StreamerCompatibilityActivator] },
  { path: 'view', component: ViewerComponent, canActivate: [WebRTCCompatibilityActivator] },
  { path: '**', redirectTo: '/stream' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
