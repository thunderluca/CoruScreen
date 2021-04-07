import { TestBed } from '@angular/core/testing';

import { StreamerCompatibilityService } from './streamer-compatibility.service';

describe('StreamerCompatibilityService', () => {
  let service: StreamerCompatibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamerCompatibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
