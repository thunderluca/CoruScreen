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
  public browserName: string;
  public browserRequirements: BrowserRequirement[]; 
  public browserVersion: string;
  public operatingSystem: string;
  public platform: string;
  public userAgent: string;

  constructor(activatedRoute: ActivatedRoute) {
    this.browserRequirements = BrowserRequirement.DEFAULT.filter(br => br.feature === 'app');
    if (activatedRoute.snapshot.queryParams.dbg !== '1') {
      return;
    }

    this.userAgent = navigator.userAgent;   
    const browser = Bowser.getParser(navigator.userAgent);
    this.browserName = browser.getBrowserName();
    this.browserVersion = browser.getBrowserVersion();
    this.operatingSystem = browser.getOSName();
    this.platform = browser.getPlatformType();
  }
}
