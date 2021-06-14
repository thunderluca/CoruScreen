import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { StringHelper } from '../helpers/string-helper';
import { SignalingData } from '../models/signaling-data';
import { SpeechTranscription } from '../models/speech/speech-transcription';
import { StreamStatus } from '../models/stream-status';
import { LogService } from '../services/log.service';
import { RtcService } from '../services/rtc.service';
import { SignalingService } from '../services/signaling.service';

const CONNECTION_MAX_TIMEOUT_IN_SECONDS: number = 20;

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
  currentTranscription: string;
  hideStatusMessages: boolean = false;
  streamStatus: StreamStatus = StreamStatus.Buffering;
  transcriptions: SpeechTranscription[] = [];
  useDarkTheme: boolean = false;

  private connectionTickCounter: number;
  private currentPlayerType: string;
  private currentStream?: MediaStream;
  private streamId: string;
  private eventsSubscription: Subscription = new Subscription();
  private transcriptionsTimeout: NodeJS.Timeout;

  constructor(
    private activatedRoute: ActivatedRoute,
    private log: LogService,
    private rtc: RtcService,
    private signaling: SignalingService) { }

  ngOnInit(): void {
    const logPrefix = 'ViewerComponent.ngOnInit - ';

    this.streamId = this.activatedRoute.snapshot.queryParams.id;
    if (StringHelper.nullOrWhiteSpace(this.streamId)) {
      throw new Error('Stream ID cannot be null, empty or blank');
    }

    this.hideStatusMessages = this.activatedRoute.snapshot.queryParams.hm === '1';

    this.useDarkTheme = this.activatedRoute.snapshot.queryParams.dt === '1';

    this.signaling.startAsync()
      .then(result => {
        if (result) {
          this.log.debug(logPrefix + 'Signal connection started');

          this.signaling.registerCallback('signalReceived', (args: any[]) => {      
            const clientId = args[0] as string;
            const signal = args[1] as string;

            this.rtc.signalPeer(false, clientId, signal);
          });

          this.signaling.registerCallback('transcriptionReceived', (args: any[]) => {      
            const transcription = args[0] as string;

            if (StringHelper.nullOrWhiteSpace(transcription)) {
              this.transcriptions.push({ timestamp: new Date(), text: transcription });

              this.updateTranscriptions();
            }
          });

          this.eventsSubscription.add(this.rtc.stream$.subscribe((signal: SignalingData) => {
            this.streamStatus = StreamStatus.Buffering;

            this.startPlayer(signal, true);

            this.streamStatus = StreamStatus.Playing;

            this.transcriptionsTimeout = setInterval(this.updateTranscriptions, 1000);
          }));

          this.eventsSubscription.add(this.signaling.streamStopped$.subscribe((result: boolean) => {
            if (result) {
              this.stopPlayer();

              if (this.transcriptionsTimeout)
                clearInterval(this.transcriptionsTimeout);

              this.streamStatus = StreamStatus.Ended;
            }
          }));
         
          this.signaling.joinAsync(this.streamId)
            .then(result => {
              if (result) {
                this.log.debug(logPrefix + 'Registered to group');

                if (!this.hideStatusMessages) {
                  this.startTimeout();
                }
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
  
    window.onbeforeunload = () => {
      const logPrefix = 'ViewerComponent.onWindowBeforeunload - ';
  
      if (this.signaling) {
        this.signaling.leaveAsync(this.streamId)
          .then(() => {
            this.rtc.destroyPeers([]);
    
            this.signaling.stopAsync();
          })
          .catch((err: any) => {
            this.log.error(logPrefix + err);
          });
      }
    }
  }

  private isVideoStream(stream: MediaStream): boolean {
    if (!stream) {
      return false;
    }

    let videoTrackFound = false;

    stream.getTracks().forEach(track => {
      if (track.kind === 'video') {
        videoTrackFound = true;
      }
    });

    return videoTrackFound;
  }

  private startTimeout(): void {
    this.connectionTickCounter = 0;

    const timeout = setInterval(() => {
      if (this.streamStatus !== StreamStatus.Buffering) {
        clearInterval(timeout);
        return;
      }

      this.connectionTickCounter++;

      const mod = this.connectionTickCounter % 4;

      let connectionLabel = 'Connecting';

      if (mod > 0) {
        for (let i = 0; i < mod; i++) {
          connectionLabel += '.';
        }
      }

      document.getElementById('connection-div').innerText = connectionLabel;

      if (this.connectionTickCounter >= CONNECTION_MAX_TIMEOUT_IN_SECONDS) {
        this.streamStatus = StreamStatus.Ended;
        clearInterval(timeout);
        return;
      }
    }, 1000);
  }

  private startPlayer(signal: SignalingData, useControls: boolean): void {
    const logPrefix = 'ViewerComponent.startPlayer - ';

    this.currentStream = signal.data as MediaStream;

    const type = this.isVideoStream(this.currentStream) ? 'video' : 'audio';

    this.currentPlayerType = type;

    const player = document.createElement(type);

    if (useControls) {
      player.setAttribute('controls', '');
    }

    if (type === 'audio') {
      player.setAttribute('class', 'position-absolute top-50 start-50 translate-middle');
    } else {
      player.style.backgroundColor = '#000';
      player.style.width = '100%';
      player.style.height = '100%';
    }

    player.srcObject = this.currentStream;
    player.onloadedmetadata = () => {
      player.play();
    }

    document.getElementById('player-div').appendChild(player);

    this.log.debug(logPrefix + 'Player added');
  }

  private stopPlayer(): void {
    const logPrefix = 'ViewerComponent.stopVideo - ';

    const player = document.getElementById('player-div').querySelector(this.currentPlayerType) as HTMLMediaElement;
    player.pause();
    player.currentTime = 0;
    player.srcObject = null;
    player.parentElement.removeChild(player);
        
    this.currentStream.getTracks()
      .forEach(track => {
        track.stop();
        this.currentStream.removeTrack(track);
      });

    this.currentStream = null;

    this.rtc.destroyPeers([]);

    this.log.debug(logPrefix + 'Player stopped');
  }

  private updateTranscriptions(): void {
    if (!this.transcriptions || this.transcriptions.length === 0) {
      this.currentTranscription = '';
      return;
    }

    this.transcriptions = this.transcriptions.filter(t => t.timestamp >= new Date(Date.now() - 5000));
  
    this.currentTranscription = this.transcriptions.length === 0 ? '' : this.transcriptions.map(t => t.text).join(' ');
  }
}
