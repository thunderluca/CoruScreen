import { Component, OnInit, ViewChild } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { DeviceSelectorComponent } from '../device-selector/device-selector.component';
import { Size } from '../models/size';
import { SpeechConfiguration } from '../models/speech-configuration';
import { TranscribedSpeech } from '../models/transcribed-speech';
import { ConfigurationService } from '../services/configuration.service';
import { LogService } from '../services/log.service';
import { MediaService } from '../services/media.service';
import { RngService } from '../services/rng.service';
import { RtcService } from '../services/rtc.service';
import { SignalingService } from '../services/signaling.service';
import { ShareStreamComponent } from '../share-stream/share-stream.component';
import { SpeechOptionsComponent } from '../speech-options/speech-options.component';
import { StreamStatsComponent } from '../stream-stats/stream-stats.component';
import { VideoOptionsComponent } from '../video-options/video-options.component';

declare const speechService: any;

@Component({
  selector: 'app-streamer',
  templateUrl: './streamer.component.html',
  styleUrls: ['./streamer.component.css']
})
export class StreamerComponent implements OnInit {
  @ViewChild(DeviceSelectorComponent) deviceSelector: DeviceSelectorComponent;
  @ViewChild(ShareStreamComponent) shareStream: ShareStreamComponent;
  @ViewChild(SpeechOptionsComponent) speechOptions: SpeechOptionsComponent;
  @ViewChild(StreamStatsComponent) streamStats: StreamStatsComponent;
  @ViewChild(VideoOptionsComponent) videoOptions: VideoOptionsComponent;

  advancedDeviceOptions: boolean;
  isDesktopDevice: boolean;
  microphonePermission: PermissionState;
  streamingStarted: boolean;
  transcriptions: TranscribedSpeech[] = [];
  userMedia?: boolean = null;
  videoStreaming?: boolean = null;
  viewers: string[] = [];
  webcamPermission: PermissionState;

  private currentPlayerType: string;
  private currentStream: MediaStream;
  private eventsSubscription: Subscription = new Subscription();
  private streamId: string;
  private streamManuallyStopped: boolean = false;
  private transcriptionsTimeout: NodeJS.Timeout;

  constructor(
    private configuration: ConfigurationService,
    private deviceDetector: DeviceDetectorService,
    private log: LogService,
    private media: MediaService,
    private rng: RngService,
    private rtc: RtcService,
    private signaling: SignalingService) { }

  async checkPermissionsAsync(): Promise<void> {
    this.microphonePermission = await this.media.queryMicrophonePermissionAsync();

    this.webcamPermission = await this.media.queryWebcamPermissionAsync();
  }

  chooseDeviceType(type: number): void {
    switch (type) {
      case 0: {
        this.videoStreaming = true;
        this.userMedia = false;
        break;
      }
      case 1: {
        this.videoStreaming = true;
        this.userMedia = true;
        this.deviceSelector.loadDeviceList(['videoinput']);
        break;
      }
      case 2: {
        this.videoStreaming = false;
        this.userMedia = true;
        this.deviceSelector.loadDeviceList(['audioinput']);
        break;
      }
    }

    document.getElementById('options-header').querySelector('button').click();
  }

  deviceTypeChosen(): boolean {
    return this.videoStreaming !== undefined
      && this.videoStreaming !== null
      && this.userMedia !== undefined
      && this.userMedia !== null;
  }

  ngOnInit(): void {
    const logPrefix = 'StreamerComponent.ngOnInit - ';

    this.isDesktopDevice = this.deviceDetector.isDesktop();

    this.streamId = this.rng.generate(8);

    this.signaling.startAsync()
      .then(result => {
        if (result) {
          this.log.debug(logPrefix + 'Signal connection started');
         
          this.signaling.createAsync(this.streamId)
            .then(result => {
              if (result) {
                this.log.debug(logPrefix + 'Registered to group');

                this.signaling.registerCallback('signalReceived', (args: any[]) => {
                  const clientId = args[0] as string;
                  const signal = args[1] as string;

                  this.rtc.signalPeer(true, clientId, signal, this.currentStream);
                });      
              } else {
                this.log.warn(logPrefix + 'Group registration failed');
              }
            })
            .catch((err: any) => {
              this.log.error(logPrefix + err);
            });
        } else {
          this.log.warn(logPrefix + 'Signal connection not started');
        }
      })
      .catch((err: any) => {
        this.log.error(logPrefix + err);
      });

    this.eventsSubscription.add(this.signaling.viewers$.subscribe((ids: string[]) => {
      const userLeaved = this.viewers.length > ids.length;
      this.viewers = ids;
      if (this.streamStats) {
        this.streamStats.viewers = ids;
      }
      if (userLeaved) {
        this.viewers
          .filter(vid => ids.indexOf(vid) === -1)
          .forEach(id => this.rtc.removePeer(id));
      } else {
        this.rtc.getOrCreateSpectatorPeer(ids[ids.length - 1], this.currentStream);
      }
    }));

    this.checkPermissionsAsync()
      .then(() => {
        const promptMicrophonePermission = this.microphonePermission === 'prompt';
        const promptWebcamPermission = this.webcamPermission === 'prompt';

        if (!promptMicrophonePermission && !promptWebcamPermission) {
          return;
        }

        const devicePermissionToAsk = promptMicrophonePermission && promptWebcamPermission
          ? 'microphone and webcam'
          : promptMicrophonePermission ? 'microphone' : 'webcam';

        const result = confirm('CoruScreen need to check ' + devicePermissionToAsk + ' permissions to allow audio input devices to be used as streaming devices. Do you want to allow it?');
        if (result) {
          if (promptMicrophonePermission) {
            this.media.requestMicrophonePermissionAsync()
              .then(result => {
                if (result) {
                  this.media.queryMicrophonePermissionAsync()
                    .then(permission => {
                      this.microphonePermission = permission;
                    });
                }
              });
          }
          
          if (promptWebcamPermission) {
            this.media.requestWebcamPermissionAsync()
              .then(result => {
                if (result) {
                  this.media.queryWebcamPermissionAsync()
                    .then(permission => {
                      this.webcamPermission = permission;
                    });
                }
              });
          }
        }
      })
  }

  reset(): void {
    if (this.streamingStarted) {
      const result = confirm('You are currently streaming! If you proceed, the current stream will be stopped. Do you confirm?');
      if (!result) {
        return;
      }

      this.stopStream(true);
    } else {
      this.resetOptions();
    }
  }

  startStream(): void {
    const logPrefix = 'StreamerComponent.startStream - ';

    const useSourceAudio: boolean = this.videoOptions ? this.videoOptions.useSourceAudio : false;
    const frameRate: number = this.videoOptions ? this.videoOptions.selectedFrameRate : null;
    const size: Size = this.videoOptions ? this.videoOptions.selectedSize : null;

    if (this.videoStreaming && !this.userMedia) {
      this.media.getDisplay(useSourceAudio, frameRate, size)
        .then((stream: MediaStream) => this.manageStream(logPrefix, stream))
        .catch((err: any) => {
          this.log.error(logPrefix + err);
        });
    } else {
      let streamPromise: Promise<MediaStream>;

      if (!this.deviceSelector.selectedDeviceId) {
        throw new Error('Received null device id');
      }

      if (this.videoStreaming) {
        streamPromise = this.media.getVideoDevice(this.deviceSelector.selectedDeviceId, useSourceAudio, frameRate, size);
      } else {
        streamPromise = this.media.getAudioDevice(this.deviceSelector.selectedDeviceId);
      }

      streamPromise
        .then((stream: MediaStream) => this.manageStream(logPrefix, stream))
        .catch((err: any) => {
          this.log.error(logPrefix + err);
        });
    }
  }

  stopStream(skipConfirm?: boolean): void {
    const logPrefix = 'StreamerComponent.stopStream';

    if (!skipConfirm) {
      const result = confirm('Are you sure to stop current stream?');
      if (!result) {
        return;
      }
    }

    this.streamManuallyStopped = true;

    this.signaling.endStreamAsync(this.streamId)
      .then(() => {

        if (this.speechOptions.enableSpeechToText || this.videoOptions.speechOptions.enableSpeechToText) {
          if (this.transcriptionsTimeout) {
            clearInterval(this.transcriptionsTimeout);
            this.transcriptionsTimeout = null;
          }

          speechService.stopTranslate();
        }

        this.streamStats.stop();

        this.stopPlayer();

        this.media.disposeStream(this.currentStream, true);
    
        this.currentStream = null;
    
        this.rtc.destroyPeers(this.viewers);
        
        this.shareStream.resetUrl();
    
        this.streamingStarted = false;
        
        this.resetOptions();

        document.getElementById('choice-header').querySelector('button').click();

        this.streamManuallyStopped = false;
      })
      .catch((err: any) => {
        this.log.error(logPrefix + err);
      });
  }

  validateOptions(): void {
    let inputDeviceNotSelected = false;
    if ((this.userMedia && !this.deviceSelector.validate()) || (this.videoOptions.useSecondaryAudioSource && !this.videoOptions.deviceSelector.validate())) {
      inputDeviceNotSelected = true;
    }

    let speechLanguageNotSelected = false;
    if (this.speechOptions.enableSpeechToText || this.videoOptions.speechOptions.enableSpeechToText) {
      speechLanguageNotSelected = this.speechOptions.enableSpeechToText
        ? !this.speechOptions.validate()
        : !this.videoOptions.speechOptions.validate();
    }

    if (inputDeviceNotSelected || speechLanguageNotSelected) {
      return;
    }

    document.getElementById('control-header').querySelector('button').click();
  }

  private async manageStream(logPrefix: string, stream: MediaStream): Promise<void> {
    this.currentStream = stream;
    this.currentStream.getTracks().forEach(track => {
      track.onended = () => this.onTrackEnded(track);
    });

    if (this.videoOptions.useSecondaryAudioSource) {
      const secondaryAudioDeviceStream: MediaStream = await this.media.getAudioDevice(this.videoOptions.deviceSelector.selectedDeviceId);
      if (secondaryAudioDeviceStream) {
        secondaryAudioDeviceStream.getAudioTracks().forEach(track => {
          this.currentStream.addTrack(track);
        });
      }
    }

    if (this.advancedDeviceOptions && (this.speechOptions.enableSpeechToText || this.videoOptions.speechOptions.enableSpeechToText)) {
      const speechConfiguration = this.configuration.get<SpeechConfiguration>('stt');

      speechConfiguration.deviceId = this.userMedia ? this.deviceSelector.selectedDeviceId : this.videoOptions.deviceSelector.selectedDeviceId;
      speechConfiguration.isDebugMode = this.configuration.get('debug') as boolean;
      speechConfiguration.language = this.speechOptions.language ?? this.videoOptions.speechOptions.language;

      speechService.startTranslate(speechConfiguration);

      this.transcriptionsTimeout = setInterval(() => {
        if (this.transcriptions.length > 0) {
          this.transcriptions.sort(t => t.timestamp.getTime());

          const lastTimestamp = this.transcriptions[this.transcriptions.length - 1].timestamp;
  
          const diff = speechService.transcriptions.filter(t => t.timestamp > lastTimestamp);
          if (diff && diff.length > 0) {
            diff.forEach(t => this.updateAndSignalTranscriptions(t.timestamp, t.text));
          }
        } else {
          speechService.transcriptions.forEach(t => this.updateAndSignalTranscriptions(t.timestamp, t.text));
        }
      }, 500);
    }

    this.shareStream.setUrl(window.location.origin + '/view?id=' + this.streamId);

    this.streamingStarted = true;

    this.startPlayer(this.videoStreaming ? 'video' : 'audio', true);
    
    this.streamStats.start();

    this.log.debug(logPrefix + 'Streaming started successfully');

    if (this.viewers && this.viewers.length > 0) {
      this.viewers.forEach(id => {
        this.rtc.getOrCreateSpectatorPeer(id, this.currentStream);
      });
    }
  }

  private onTrackEnded(track: MediaStreamTrack): void {
    if (!this.currentStream || this.streamManuallyStopped) {
      return;
    }

    this.currentStream.removeTrack(track);

    const tracks = this.currentStream.getTracks();
    if (!tracks || tracks.length === 0) {
      this.stopStream(true);
    }
  }

  private resetOptions(): void {
    this.advancedDeviceOptions = false;
    this.userMedia = null;
    this.videoStreaming = null;
    
    if (this.deviceSelector) {
      this.deviceSelector.reset();
    }

    if (this.speechOptions) {
      this.speechOptions.reset();
    }

    if (this.streamStats) {
      this.streamStats.reset(false);
    }
    
    if (this.videoOptions) {
      this.videoOptions.reset();
    }
  }

  private startPlayer(type: string, useControls: boolean): void {
    const logPrefix = 'StreamerComponent.startPlayer - ';

    if (type !== 'audio' && type !== 'video') {
      throw new Error('Not supported player type (' + type + ')');      
    }

    this.currentPlayerType = type;
    
    const player = document.createElement(type);

    if (useControls) {
      player.setAttribute('controls', '');
    }

    if (type === 'video') {
      player.style.backgroundColor = '#000';
      player.style.maxWidth = '100%';
      player.muted = true;
    }

    player.srcObject = this.currentStream;
    player.onloadedmetadata = () => {
      player.play();
    }
    document.getElementById('preview-div').prepend(player);
    
    this.log.debug(logPrefix + 'Player added');
  }

  private stopPlayer(): void {
    const logPrefix = 'StreamerComponent.stopPlayer - ';
    
    const player = document.getElementById('preview-div').querySelector(this.currentPlayerType) as HTMLMediaElement;
    player.pause();
    player.currentTime = 0;
    player.srcObject = null;
    player.parentElement.removeChild(player);
    
    this.log.debug(logPrefix + 'Player stopped');
  }

  private updateAndSignalTranscriptions(date: Date, text: string) {
    this.transcriptions.push({ timestamp: date, text: text });
    this.signaling.sendTranscription(this.streamId, text);
  }
}
