import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReportDailyComponent } from './sale-report-daily.component';

describe('SaleReportDailyComponent', () => {
  let component: SaleReportDailyComponent;
  let fixture: ComponentFixture<SaleReportDailyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaleReportDailyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleReportDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
