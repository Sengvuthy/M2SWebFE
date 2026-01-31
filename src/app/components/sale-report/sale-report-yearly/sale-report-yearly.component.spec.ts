import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReportYearlyComponent } from './sale-report-yearly.component';

describe('SaleReportYearlyComponent', () => {
  let component: SaleReportYearlyComponent;
  let fixture: ComponentFixture<SaleReportYearlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaleReportYearlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleReportYearlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
