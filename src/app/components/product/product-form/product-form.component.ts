// product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

import { ProductService, Product } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { SupplierService, SupplierDTO } from '../../../services/supplier.service';

function extractFilename(url: string): string {
  if (!url) return '';
  return url.split('/').pop() || url;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  barcodeParam: string | null = null;
  isSubmitting = false;

  categories: any[] = [];
  suppliers: SupplierDTO[] = [];

  // state from query params
  searchKeyword = '';
  page = 1;
  sort = 'name,asc';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.buildForm();

    this.barcodeParam = this.route.snapshot.paramMap.get('barcode');

    // read search state from query params
    this.route.queryParams.subscribe(params => {
      this.searchKeyword = params['keyword'] || '';
      this.page = +params['page'] || 1;
      this.sort = params['sort'] || 'name,asc';
    });

    this.loadDropdowns(() => {
      if (this.barcodeParam) {
        this.loadProduct(this.barcodeParam);
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      barcode: ['', Validators.required],
      name: ['', Validators.required],
      khmerName: ['', Validators.required],
      availableUnit: [0, [Validators.min(0)]],
      buyPrice: [0, [Validators.min(0.00000)]],
      salePrice: [0, [Validators.min(0.00001)]],
      categoryId: [null, Validators.required],
      supplierId: [null, Validators.required],
      imagePath: ['']
    });
  }

  private loadProduct(barcode: string): void {
    this.productService.getByBarcode(barcode).subscribe({
      next: (p: Product) => {
        this.form.patchValue(this.productService.normalizeImagePath(p));
        console.log('Final image URL:', this.form.value.imagePath);
      },
      error: err => this.toastr.error(err.error?.message || 'Failed to load product')
    });
  }

  private loadDropdowns(done?: () => void): void {
    let catLoaded = false;
    let supLoaded = false;

    this.categoryService.getAllCategories().subscribe({
      next: res => {
        this.categories = res.list ?? res.content ?? res;
        catLoaded = true;
        if (catLoaded && supLoaded && done) done();
      },
      error: () => this.toastr.error('Failed to load categories')
    });

    this.supplierService.getAllSuppliers().subscribe({
      next: (res: any) => {
        const list = res.list ?? res.content ?? res;
        this.suppliers = list.map((s: any) => ({
          id: s.id ?? s.supplierId,
          name: s.name ?? s.supplierName
        }));
        supLoaded = true;
        if (catLoaded && supLoaded && done) done();
      },
      error: () => this.toastr.error('Failed to load suppliers')
    });
  }

  upload(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const barcode = this.form.value.barcode;
    if (!barcode) {
      this.toastr.error('Please enter a barcode before uploading an image');
      return;
    }

    this.productService.uploadImage(file, barcode).subscribe({
      next: fullUrl => {
        this.form.patchValue({ imagePath: fullUrl });
        this.toastr.success('Image uploaded');
      },
      error: err => this.toastr.error(err.error?.message || 'Upload failed')
    });
  }

  save(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    const payload = this.form.getRawValue() as Product;

    // ✅ Strip back to filename before sending to backend
    if (payload.imagePath) {
      payload.imagePath = extractFilename(payload.imagePath);
    }

    const request$ = this.barcodeParam
      ? this.productService.update(this.barcodeParam, payload)
      : this.productService.create(payload);

    request$.subscribe({
      next: () => {
        this.toastr.success('Saved successfully');
        this.router.navigate(['/product'], {
          queryParams: {
            keyword: this.searchKeyword,
            page: this.page,
            sort: this.sort
          }
        });
        console.log('Payload:', payload);
      },
      error: err => {
        this.toastr.error(err.error?.message || 'Save failed');
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/product'], {
      queryParams: {
        keyword: this.searchKeyword,
        page: this.page,
        sort: this.sort
      }
    });
  }
}
