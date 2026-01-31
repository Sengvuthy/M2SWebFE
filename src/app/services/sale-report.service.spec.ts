import { TestBed } from '@angular/core/testing';

import { SaleReportService } from './sale-report.service';

describe('SaleReportService', () => {
  let service: SaleReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
