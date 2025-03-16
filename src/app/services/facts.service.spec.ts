import { TestBed } from '@angular/core/testing';

import { FactsService } from './facts.service';

describe('FactsService', () => {
  let service: FactsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FactsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
