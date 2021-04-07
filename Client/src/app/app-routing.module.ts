import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserNotSupportedComponent } from './browser-not-supported/browser-not-supported.component';
import { NotSupportedComponent } from './not-supported/not-supported.component';
import { CompatibilityService } from './services/compatibility.service';
import { StreamerCompatibilityService } from './services/streamer-compatibility.service';
import { StreamerComponent } from './streamer/streamer.component';
import { ViewerComponent } from './viewer/viewer.component';

const routes: Routes = [
  { path: '', redirectTo: '/stream', pathMatch: 'full' },
  { path: 'browsernotsupported', component: BrowserNotSupportedComponent },
  { path: 'notsupported', component: NotSupportedComponent },
  { path: 'stream', component: StreamerComponent, canActivate: [StreamerCompatibilityService] },
  { path: 'view', component: ViewerComponent, canActivate: [CompatibilityService] },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
