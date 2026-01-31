import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImportListComponent } from './product-import-list.component';

describe('ProductImportListComponent', () => {
  let component: ProductImportListComponent;
  let fixture: ComponentFixture<ProductImportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductImportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductImportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
