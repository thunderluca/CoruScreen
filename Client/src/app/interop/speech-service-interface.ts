import { SpeechConfiguration } from "../models/speech/speech-configuration";
import { SpeechLanguage } from "../models/speech/speech-language";
import { SpeechTranscription } from "../models/speech/speech-transcription";

export interface SpeechServiceInterface {
    startTranslate(opt: SpeechConfiguration): void;
    stopTranslate(): void;
    supportedLanguages: SpeechLanguage[];
    transcriptions: SpeechTranscription[];
}