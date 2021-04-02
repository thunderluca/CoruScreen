import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StreamerComponent } from './streamer/streamer.component';
import { ViewerComponent } from './viewer/viewer.component';

const routes: Routes = [
  { path: '', redirectTo: '/stream', pathMatch: 'full' },
  { path: 'stream', component: StreamerComponent },
  { path: 'view', component: ViewerComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
