import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import * as Bowser from 'bowser';
import { RtcService } from './rtc.service';

@Injectable({
  providedIn: 'root'
})
export class StreamerCompatibilityService implements CanActivate {

  constructor(private router: Router, private rtc: RtcService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const skipBrowserCheck = route.queryParams.sbc === '1';
    if (!skipBrowserCheck) {
      const supportedBrowser = this.isSupportedBrowser();
      if (!supportedBrowser) {
        // Breaking change on navigator.mediaDevices.enumerateDevices(),
        // cannot load anymore the entire list even without asking permissions.
        // See https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/69
        this.router.navigate(['notsupported']);
        return false;
      }
    }

    const isWebRTCAvailable = this.rtc.isWebRTCAvailable();
    if (!isWebRTCAvailable) {
      this.router.navigate(['notsupported']);
    }

    return isWebRTCAvailable;
  }

  private isSupportedBrowser(): boolean {
    const browser = Bowser.getParser(navigator.userAgent);

    const browserName = browser.getBrowserName(true);

    const operatingSystem = browser.getOSName(true);

    const platform = browser.getPlatformType(true);

    const unsupportedSafariEdition = browserName === 'safari' && operatingSystem === 'ios' && (platform === 'mobile' || platform === 'tablet');
    if (unsupportedSafariEdition) {
      // iOS/iPad Safari-based browsers cannot retrieve any device
      return false;
    }

    const unsupportedFirefoxEdition = browserName === 'firefox' && platform === 'desktop' && browser.getBrowserVersion() >= '69';
    if (unsupportedFirefoxEdition) {
      // Breaking change on navigator.mediaDevices.enumerateDevices(),
      // cannot load anymore the entire list even without asking permissions.
      // See https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/69
      return false;
    }

    return true;
  }
}
