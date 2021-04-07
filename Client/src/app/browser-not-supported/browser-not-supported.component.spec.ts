import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserNotSupportedComponent } from './browser-not-supported.component';

describe('BrowserNotSupportedComponent', () => {
  let component: BrowserNotSupportedComponent;
  let fixture: ComponentFixture<BrowserNotSupportedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserNotSupportedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserNotSupportedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
