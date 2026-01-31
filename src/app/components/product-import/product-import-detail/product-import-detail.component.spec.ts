import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImportDetailComponent } from './product-import-detail.component';

describe('ProductImportDetailComponent', () => {
  let component: ProductImportDetailComponent;
  let fixture: ComponentFixture<ProductImportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductImportDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductImportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
