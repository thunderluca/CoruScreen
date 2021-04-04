import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeviceSelectorComponent } from '../device-selector/device-selector.component';
import { Size } from '../models/size';
import { LogService } from '../services/log.service';
import { MediaService } from '../services/media.service';
import { RngService } from '../services/rng.service';
import { RtcService } from '../services/rtc.service';
import { SignalingService } from '../services/signaling.service';
import { VideoOptionsComponent } from '../video-options/video-options.component';

@Component({
  selector: 'app-streamer',
  templateUrl: './streamer.component.html',
  styleUrls: ['./streamer.component.css']
})
export class StreamerComponent implements OnInit {
  @ViewChild(VideoOptionsComponent) videoOptions: VideoOptionsComponent;
  @ViewChild(DeviceSelectorComponent) deviceSelector: DeviceSelectorComponent;

  advancedDeviceOptions: boolean;
  shareUrl: string;
  streamingStarted: boolean;
  videoStreaming?: boolean = null;
  viewers: string[] = [];
  userMedia?: boolean = null;

  private currentPlayerType: string;
  private currentStream: MediaStream;
  private streamId: string;
  private eventsSubscription: Subscription = new Subscription();

  constructor(
    private log: LogService,
    private media: MediaService,
    private rng: RngService,
    private rtc: RtcService,
    private signaling: SignalingService) { }

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

  copyLinkToClipboard(): void {
    const shareUrlElement = document.getElementById('share-url') as HTMLInputElement;

    shareUrlElement.select();
    shareUrlElement.setSelectionRange(0, this.shareUrl.length);

    document.execCommand('copy');
  }

  deviceTypeChosen(): boolean {
    return this.videoStreaming !== undefined
      && this.videoStreaming !== null
      && this.userMedia !== undefined
      && this.userMedia !== null;
  }

  ngOnInit(): void {
    const logPrefix = 'StreamerComponent.ngOnInit - ';

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
      if (userLeaved) {
        this.viewers
          .filter(vid => ids.indexOf(vid) === -1)
          .forEach(id => this.rtc.removePeer(id));
      } else {
        this.rtc.getOrCreateSpectatorPeer(ids[ids.length - 1], this.currentStream);
      }
    }));
  }

  reset(): void {
    this.advancedDeviceOptions = false;
    this.videoStreaming = null;
    this.userMedia = null;
    
    if (this.deviceSelector) {
      this.deviceSelector.reset();
    }
    
    if (this.videoOptions) {
      this.videoOptions.reset();
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

  stopStream(): void {
    const logPrefix = 'StreamerComponent.stopStream';

    const result: Boolean = confirm('Are you sure to stop current stream?');
    if (!result) {
      return;
    }

    this.signaling.endStreamAsync(this.streamId)
      .then(() => {
        this.stopPlayer();
        
        this.currentStream.getTracks()
          .forEach(track => {
            track.stop();
            this.currentStream.removeTrack(track);
          });
    
        this.currentStream = null;
    
        this.rtc.destroyPeers();
        
        this.shareUrl = null;
    
        this.streamingStarted = false;
        
        this.reset();

        document.getElementById('choice-header').querySelector('button').click();
      })
      .catch((err: any) => {
        this.log.error(logPrefix + err);
      });
  }

  validateOptions(): void {
    if (this.userMedia && !this.deviceSelector.validate()) {
      return;
    }

    document.getElementById('control-header').querySelector('button').click();
  }

  private async manageStream(logPrefix: string, stream: MediaStream): Promise<void> {
    this.currentStream = stream;

    if (this.videoOptions.useSecondaryAudioSource) {
      const secondaryAudioDeviceStream: MediaStream = await this.media.getAudioDevice(this.videoOptions.deviceSelector.selectedDeviceId);
      if (secondaryAudioDeviceStream) {
        secondaryAudioDeviceStream.getAudioTracks().forEach(track => {
          this.currentStream.addTrack(track);
        });
      }
    }

    this.shareUrl = window.location.origin + '/view?id=' + this.streamId;

    this.streamingStarted = true;

    this.startPlayer(this.videoStreaming ? 'video' : 'audio', true);

    this.log.debug(logPrefix + 'Streaming started successfully');

    if (this.viewers && this.viewers.length > 0) {
      this.viewers.forEach(id => {
        this.rtc.getOrCreateSpectatorPeer(id, this.currentStream);
      });
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
      player.style.maxWidth = '100%';
    }

    player.srcObject = this.currentStream;
    document.getElementById('preview-div').appendChild(player);
    player.play();
    
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
}
