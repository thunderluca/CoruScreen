import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechOptionsComponent } from './speech-options.component';

describe('SpeechOptionsComponent', () => {
  let component: SpeechOptionsComponent;
  let fixture: ComponentFixture<SpeechOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeechOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeechOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
