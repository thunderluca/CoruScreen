import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-share-stream',
  templateUrl: './share-stream.component.html',
  styleUrls: ['./share-stream.component.css']
})
export class ShareStreamComponent implements OnInit {
  fullUrl: string;
  hideStatusMessages: boolean;
  url: string;

  constructor() { }

  copyLinkToClipboard(): void {
    const shareUrlElement = document.getElementById('share-url') as HTMLInputElement;

    shareUrlElement.select();
    shareUrlElement.setSelectionRange(0, this.fullUrl.length);

    document.execCommand('copy');
  }

  buildFullUrl(): void {
    this.fullUrl = this.hideStatusMessages ? this.url + '&hm=1' : this.url;
  }

  ngOnInit(): void {
  }

  resetUrl(): void {
    this.fullUrl = null;
    this.url = null;
  }

  setUrl(url: string): void {
    this.url = url;
    this.buildFullUrl();
  }
}
