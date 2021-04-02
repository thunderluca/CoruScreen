import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalingData } from '../models/signaling-data';
import { LogService } from '../services/log.service';
import { RtcService } from '../services/rtc.service';
import { SignalingService } from '../services/signaling.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit {
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
            this.playVideo(signal);
          }));

          this.eventsSubscription.add(this.signaling.streamStopped$.subscribe((result: boolean) => {
            if (result) {
              this.stopVideo();
            }
          }));
         
          this.signaling.joinAsync(this.streamId)
            .then(result => {
              if (result) {
                this.log.debug(logPrefix + 'Registered to group');
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

  private playVideo(signal: SignalingData): void {
    const logPrefix = 'ViewerComponent.playVideo - ';

    this.currentStream = signal.data as MediaStream;

    const videoPlayer = document.getElementById('player') as HTMLVideoElement;
    videoPlayer.srcObject = this.currentStream;
    videoPlayer.play();

    this.log.debug(logPrefix + 'Video player added');
  }

  private stopVideo(): void {
    const logPrefix = 'ViewerComponent.stopVideo - ';

    const videoPlayer = document.getElementById('player') as HTMLVideoElement;
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.srcObject = null;
        
    this.currentStream.getTracks()
      .forEach(track => {
        track.stop();
        this.currentStream.removeTrack(track);
      });

    this.currentStream = null;

    this.rtc.destroyPeers();

    this.log.debug(logPrefix + 'Video player stopped');
  }
}
