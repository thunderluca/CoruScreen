import { Component, OnInit } from '@angular/core';
import { Connection } from '../models/connection';
import { RtcService } from '../services/rtc.service';

@Component({
  selector: 'app-stream-stats',
  templateUrl: './stream-stats.component.html',
  styleUrls: ['./stream-stats.component.css']
})
export class StreamStatsComponent implements OnInit {
  connections: Connection[] = [];
  currentTotalBitrate: number;
  viewers: string[] = [];

  private bitrateInterval: NodeJS.Timeout;

  constructor(private rtc: RtcService) { }

  ngOnInit(): void {
  }

  reset(clearViewers: boolean): void {
    this.currentTotalBitrate = 0;
    
    if (clearViewers) {
      this.viewers = [];
    }
  }

  start(): void {
    this.bitrateInterval = setInterval(() => {
      if (!this.viewers || this.viewers.length === 0) {
        this.currentTotalBitrate = 0;
      } else {
        this.viewers.forEach(clientId => {
          this.rtc.updateConnectionBitrate(clientId)
            .then(() => {
              const connection = this.rtc.getConnection(clientId);
              const connectionIndex = this.connections.findIndex(c => c.id === clientId);
              if (connectionIndex > -1) {
                this.connections[connectionIndex] = connection;
              } else {
                this.connections.push(connection);
              }
              this.currentTotalBitrate = this.rtc.getTotalBitrate(this.viewers);
            });
        });
      }
    }, 1000);
  }

  stop(): void {
    clearTimeout(this.bitrateInterval);
  }
}
