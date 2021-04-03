import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalingData } from '../models/signaling-data';
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
  streamStatus: StreamStatus = StreamStatus.Buffering;
  useDarkTheme: boolean = false;

  private connectionTickCounter: number;
  private currentPlayerType: string;
  private currentStream?: MediaStream;
  private streamId: string;
  private eventsSubscription: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private log: LogService,
    private rtc: RtcService,
    private signaling: SignalingService) { }

  ngOnInit(): void {
    const logPrefix = 'ViewerComponent.ngOnInit - ';

    this.streamId = this.activatedRoute.snapshot.queryParams.id;
    if (this.streamId === undefined || this.streamId === null || this.streamId.trim() === '') {
      throw new Error('Stream ID cannot be null, empty or blank');
    }

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

          this.eventsSubscription.add(this.rtc.stream$.subscribe((signal: SignalingData) => {
            this.streamStatus = StreamStatus.Buffering;

            this.startPlayer(signal, true);

            this.streamStatus = StreamStatus.Playing;
          }));

          this.eventsSubscription.add(this.signaling.streamStopped$.subscribe((result: boolean) => {
            if (result) {
              this.stopPlayer();

              this.streamStatus = StreamStatus.Ended;
            }
          }));
         
          this.signaling.joinAsync(this.streamId)
            .then(result => {
              if (result) {
                this.log.debug(logPrefix + 'Registered to group');

                this.startTimeout();
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
      this.connectionTickCounter++;

      const mod = this.connectionTickCounter % 4;

      let connectionLabel = 'Connecting';

      if (mod > 0) {
        for (let i = 0; i < mod; i++) {
          connectionLabel += '.';
        }
      }

      document.getElementById('connection-div').innerText = connectionLabel;

      if (this.streamStatus !== StreamStatus.Buffering) {
        clearInterval(timeout);
        return;
      }

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
      player.style.width = '100%';
    }

    player.srcObject = this.currentStream;
    document.getElementById('player-div').appendChild(player);
    player.play();

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

    this.rtc.destroyPeers();

    this.log.debug(logPrefix + 'Player stopped');
  }
}
