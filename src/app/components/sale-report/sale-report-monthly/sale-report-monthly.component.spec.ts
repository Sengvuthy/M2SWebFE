import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReportMonthlyComponent } from './sale-report-monthly.component';

describe('SaleReportMonthlyComponent', () => {
  let component: SaleReportMonthlyComponent;
  let fixture: ComponentFixture<SaleReportMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaleReportMonthlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleReportMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
