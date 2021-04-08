import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as Bowser from 'bowser';
import { BrowserRequirement } from '../models/browser-requirement';
import { DevicePlatform } from '../models/device-platform';
import { OperatingSystem } from '../models/operating-system';
import { RtcService } from './rtc.service';

@Injectable({
  providedIn: 'root'
})
export class CompatibilityService {

  constructor(private router: Router, private rtc: RtcService) {}

  isSupportedBrowser(): boolean {
    const browser = Bowser.getParser(navigator.userAgent);

    const operatingSystem = this.mapOperatingSystem(browser.getOSName(true));
    if (operatingSystem === null) {
      return false;
    }

    const platform = this.mapDevicePlatform(browser.getPlatformType(true));
    if (platform === null) {
      return false;
    }

    const browserName = browser.getBrowserName(true);

    const version = browser.getBrowserVersion();

    if (!this.isPermissionsApiSupportedVersion(browserName, platform, version)) {
      return false;
    }

    const appBrowserRequirementMatches = BrowserRequirement.DEFAULT.filter(br => {
      return br.feature === 'app' 
        && br.names.indexOf(browserName) > -1
        && (br.operatingSystems.indexOf(OperatingSystem.Any) > -1 || br.operatingSystems.indexOf(operatingSystem) > -1)
        && (br.platforms.indexOf(DevicePlatform.Any) > -1 || br.platforms.indexOf(platform) > -1)
        && br.version <= version;
    });

    if (!appBrowserRequirementMatches || appBrowserRequirementMatches.length === 0) {
      return false;
    } 

    return true;
  }

  isWebRTCAvailable(): boolean {
    const isWebRTCAvailable = this.rtc.isWebRTCAvailable();
    if (!isWebRTCAvailable) {
      this.router.navigate(['notsupported']);
    }

    return isWebRTCAvailable;
  }
  
  // https://caniuse.com/?search=Permissions
  private isPermissionsApiSupportedVersion(browserName: string, platform: DevicePlatform, version: string): boolean {
    const browserRequirement = BrowserRequirement.DEFAULT.find(br => {
      return br.feature === 'permissions' 
        && br.names.indexOf(browserName) > -1
        && (br.platforms.indexOf(DevicePlatform.Any) > -1 || br.platforms.indexOf(platform) > -1)
        && br.version <= version;
    });

    if (!browserRequirement) {
      return false;
    }

    return version >= browserRequirement.version;
  }

  private mapDevicePlatform(platform: string): DevicePlatform {
    switch (platform.toLowerCase()) {
      case 'desktop': {
        return DevicePlatform.Desktop;
      }
      case 'mobile': {
        return DevicePlatform.Mobile;
      }
      case 'tablet': {
        return DevicePlatform.Tablet;
      }
      case 'tv': {
        return DevicePlatform.TV;
      }
      default: {
        return null;
      }
    }
  }

  private mapOperatingSystem(operatingSystem: string): OperatingSystem {
    switch (operatingSystem.toLowerCase()) {
      case 'android': {
        return OperatingSystem.Android;
      }
      case 'chromeos':
      case 'chrome os': {
        return OperatingSystem.ChromeOS;
      }
      case 'ios': {
        return OperatingSystem.IOS;
      }
      case 'linux': {
        return OperatingSystem.Linux;
      }
      case 'macos':
      case 'mac os': {
        return OperatingSystem.MacOS;
      }
      case 'windows': {
        return OperatingSystem.Windows;
      }
      default: {
        return null;
      }
    }
  }
}
