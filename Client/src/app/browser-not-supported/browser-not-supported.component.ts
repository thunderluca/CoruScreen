import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Bowser from 'bowser';
import { BrowserRequirement } from '../models/browser-requirement';

@Component({
  selector: 'app-browser-not-supported',
  templateUrl: './browser-not-supported.component.html',
  styleUrls: ['./browser-not-supported.component.css']
})
export class BrowserNotSupportedComponent {
  browserRequirements: BrowserRequirement[] = BrowserRequirement.DEFAULT
    .filter(br => br.feature === 'app');
  
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  platform: string;
  userAgent: string;

  constructor(activatedRoute: ActivatedRoute) {
    if (activatedRoute.snapshot.queryParams.dbg === '1') {
      this.userAgent = navigator.userAgent;   
      const browser = Bowser.getParser(navigator.userAgent);
      this.browserName = browser.getBrowserName();
      this.browserVersion = browser.getBrowserVersion();
      this.operatingSystem = browser.getOSName();
      this.platform = browser.getPlatformType();
    }
  }
}
