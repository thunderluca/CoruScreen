import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import * as Bowser from 'bowser';
import { RtcService } from './rtc.service';

@Injectable({
  providedIn: 'root'
})
export class CompatibilityService implements CanActivate {

  constructor(private router: Router, private rtc: RtcService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const supportedBrowser = this.isSupportedBrowser();
    if (!supportedBrowser) {
      // Breaking change on navigator.mediaDevices.enumerateDevices(),
      // cannot load anymore the entire list even without asking permissions.
      // See https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/69
      this.router.navigate(['notsupported']);
      return false;
    }

    const isWebRTCAvailable = this.rtc.isWebRTCAvailable();
    if (!isWebRTCAvailable) {
      this.router.navigate(['notsupported']);
    }

    return isWebRTCAvailable;
  }

  private isSupportedBrowser(): boolean {
    const browser = Bowser.getParser(navigator.userAgent);

    const unsupportedFirefoxEdition = browser.getBrowserName().toLowerCase() === 'firefox' && browser.getBrowserVersion() >= '69';
    if (unsupportedFirefoxEdition) {
      // Breaking change on navigator.mediaDevices.enumerateDevices(),
      // cannot load anymore the entire list even without asking permissions.
      // See https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/69
      return false;
    }

    return true;
  }
}
