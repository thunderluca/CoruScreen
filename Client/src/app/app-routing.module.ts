import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotSupportedComponent } from './not-supported/not-supported.component';
import { CompatibilityService } from './services/compatibility.service';
import { StreamerComponent } from './streamer/streamer.component';
import { ViewerComponent } from './viewer/viewer.component';

const routes: Routes = [
  { path: '', redirectTo: '/stream', pathMatch: 'full' },
  { path: 'notsupported', component: NotSupportedComponent },
  { path: 'stream', component: StreamerComponent, canActivate: [CompatibilityService] },
  { path: 'view', component: ViewerComponent, canActivate: [CompatibilityService] },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
