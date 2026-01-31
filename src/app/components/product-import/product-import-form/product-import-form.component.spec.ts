import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImportFormComponent } from './product-import-form.component';

describe('ProductImportFormComponent', () => {
  let component: ProductImportFormComponent;
  let fixture: ComponentFixture<ProductImportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductImportFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductImportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
