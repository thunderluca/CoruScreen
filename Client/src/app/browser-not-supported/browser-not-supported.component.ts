import { Component } from '@angular/core';
import { BrowserRequirement } from '../models/browser-requirement';

@Component({
  selector: 'app-browser-not-supported',
  templateUrl: './browser-not-supported.component.html',
  styleUrls: ['./browser-not-supported.component.css']
})
export class BrowserNotSupportedComponent {
  browserRequirements: BrowserRequirement[] = BrowserRequirement.DEFAULT
    .filter(br => br.feature === 'app');
  
  constructor() { }
}
