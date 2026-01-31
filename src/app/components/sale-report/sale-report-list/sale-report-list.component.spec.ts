import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleReportListComponent } from './sale-report-list.component';

describe('SaleReportListComponent', () => {
  let component: SaleReportListComponent;
  let fixture: ComponentFixture<SaleReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaleReportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
