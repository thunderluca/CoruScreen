import { Component, OnInit } from '@angular/core';

declare const speechService: any;

@Component({
  selector: 'app-speech-options',
  templateUrl: './speech-options.component.html',
  styleUrls: ['./speech-options.component.css']
})
export class SpeechOptionsComponent implements OnInit {

  availableLanguages: any[] = speechService.supportedLanguages;
  enableSpeechToText: boolean = false;
  language: string = null;
  validLanguage: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  reset(): void {
    this.enableSpeechToText = false;
    this.language = null;
    this.validLanguage = true;
  }

  validate(): boolean {
    this.validLanguage = this.language !== undefined && this.language !== null && this.language.trim() !== '';
  
    return this.validLanguage;
  }
}
