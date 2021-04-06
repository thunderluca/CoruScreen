import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareStreamComponent } from './share-stream.component';

describe('ShareStreamComponent', () => {
  let component: ShareStreamComponent;
  let fixture: ComponentFixture<ShareStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareStreamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
