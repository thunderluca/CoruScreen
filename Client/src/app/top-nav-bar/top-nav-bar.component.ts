import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-top-nav-bar',
  templateUrl: './top-nav-bar.component.html',
  styleUrls: ['./top-nav-bar.component.css']
})

export class TopNavBarComponent implements OnInit {
  useDarkTheme: boolean = false;

  constructor(activatedRoute: ActivatedRoute) {
    this.useDarkTheme = activatedRoute.snapshot.queryParams.dt === '1';
  }

  ngOnInit(): void {
    this.updateTopNav();
  }

  switchTheme() {
    this.useDarkTheme = !this.useDarkTheme;

    this.updateTopNav();
  }

  updateTopNav(): void {
    const topNav = document.getElementById('top-nav');

    if (!this.useDarkTheme) {
      topNav.classList.remove('navbar-dark', 'bg-dark');
      topNav.classList.add('navbar-light', 'bg-light');
    } else {    
      topNav.classList.remove('navbar-light', 'bg-light');
      topNav.classList.add('navbar-dark', 'bg-dark');
    }
  }
}
