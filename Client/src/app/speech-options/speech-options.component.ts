import { Component, OnInit } from '@angular/core';
import { StringHelper } from '../helpers/string-helper';
import { SpeechServiceInterface } from '../interop/speech-service-interface';
import { SpeechLanguage } from '../models/speech/speech-language';

declare const speechService: SpeechServiceInterface;

@Component({
  selector: 'app-speech-options',
  templateUrl: './speech-options.component.html',
  styleUrls: ['./speech-options.component.css']
})
export class SpeechOptionsComponent implements OnInit {

  availableLanguages: SpeechLanguage[] = speechService.supportedLanguages;
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
    this.validLanguage = !StringHelper.nullOrWhiteSpace(this.language);
  
    return this.validLanguage;
  }
}
