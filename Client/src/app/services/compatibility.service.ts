import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RtcService } from './rtc.service';

@Injectable({
  providedIn: 'root'
})
export class CompatibilityService implements CanActivate {

  constructor(private router: Router, private rtc: RtcService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isWebRTCAvailable = this.rtc.isWebRTCAvailable();

    if (!isWebRTCAvailable) {
      this.router.navigate(['notsupported']);
    }

    return isWebRTCAvailable;
  }
}
