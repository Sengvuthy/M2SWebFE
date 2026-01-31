//product-import-form.component.ts
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductImportService, ProductImportDTO, ProductImportItem } from '../../../services/product-import.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService, Product, PageDTO } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-product-import-form',
  templateUrl: './product-import-form.component.html',
  styleUrls: ['./product-import-form.component.css'],
  standalone: false
})
export class ProductImportFormComponent implements OnInit {

  importForm!: FormGroup;
  suppliers: any[] = [];
  products: Product[] = [];
  previewItems: ProductImportItem[] = [];
  importId: string | null = null;
  isSubmitted = false;
  highlightedIndex = -1;
  editingIndex: number | null = null;
  loggedInUserName = localStorage.getItem('username') || 'Unknown';

  @ViewChild('quantityInput') quantityInput!: ElementRef;
  @ViewChild('productInput') productInput!: ElementRef;
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private importService: ProductImportService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSuppliers();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.importForm = this.fb.group({
      supplierId: ['', Validators.required],
      importerName: [{ value: this.loggedInUserName, disabled: true }],
      importDate: [this.today(), Validators.required],
      barcode: [''],
      productName: [''],
      importUnit: [null, [Validators.required, Validators.min(1)]],
      buyPrice: [null, [Validators.required, Validators.min(0)]],
      salePrice: [{ value: 0, disabled: true }],
      buyAmount: [{ value: 0, disabled: true }]
    });
  }

  /* =========================
     SUPPLIER / PRODUCT
  ========================== */
  private loadSuppliers(): void {
    const params = new HttpParams().set('page', '1').set('size', '100').set('sort', 'id,asc');
    this.supplierService.getSupplierList(params).subscribe({
      next: res => this.suppliers = res.list,
      error: () => this.toastr.error('Failed to load suppliers')
    });
  }

  /* =========================
     PRODUCT LOOKUP
  ========================== */
  searchProducts(name: string): void {
    if (!name.trim()) { this.products = []; return; }
    this.productService.search(name.trim(), 1, 10, 'name,asc').subscribe({
      next: (res: PageDTO<Product>) => this.products = res.list,
      error: () => {
        this.products = [];
        this.toastr.error('Failed to search products');
      }
    });
  }

  lookupByBarcode(barcode: string): void {
    if (!barcode || barcode.trim().length < 5) return;
    this.productService.getByBarcode(barcode.trim()).subscribe({
      next: product => {
        this.importForm.patchValue({
          barcode: product.barcode,
          productName: product.name,
          buyPrice: product.buyPrice ?? 0
        });
        setTimeout(() => this.focusQuantity(), 0);
      },
      error: () => this.toastr.error('Product not found by barcode')
    });
  }

  private focusQuantity(): void {
    const input = this.quantityInput.nativeElement as HTMLInputElement;
    input.focus(); input.select();
  }

  /* =========================
     PRODUCT DROPDOWN
  ========================== */
  handleKeyDown(event: KeyboardEvent): void {
    if (this.products.length === 0) return;
    if (event.key === 'ArrowDown') {
      this.highlightedIndex = (this.highlightedIndex + 1) % this.products.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.highlightedIndex = (this.highlightedIndex - 1 + this.products.length) % this.products.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
      this.selectProduct(this.products[this.highlightedIndex]);
      event.preventDefault();
    }
  }

  selectProduct(product: Product): void {
    this.importForm.patchValue({
      barcode: product.barcode,
      productName: product.name,
      buyPrice: product.buyPrice ?? 0,
      salePrice: product.salePrice ?? 0
    });
    this.products = [];
    setTimeout(() => this.focusQuantity(), 0);
  }

  /* =========================
     PREVIEW ITEMS
  ========================== */
  addToPreview(): void {
    const values = this.importForm.getRawValue();
    const barcode = values.barcode?.trim();
    const productName = values.productName?.trim();
    const qty = Number(values.importUnit);
    const price = Number(values.buyPrice);

    if (!barcode || !productName || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      return;
    }

    const newItem: ProductImportItem = {
      barcode,
      productName,
      importUnit: qty,
      buyPrice: price,
      salePrice: 0 // ✅ explicitly clear sale price
    };

    if (this.editingIndex !== null) {
      this.previewItems[this.editingIndex] = newItem;
      this.editingIndex = null;
    } else {
      this.previewItems.push(newItem);
    }

    this.importForm.patchValue({ buyAmount: qty * price });

    this.resetProductFields();

    setTimeout(() => {
      const input = this.productInput.nativeElement as HTMLInputElement;
      input.focus();
      input.select();
    }, 0);
  }

  editPreviewItem(item: ProductImportItem, index: number): void {
    this.importForm.patchValue({
      barcode: item.barcode,
      productName: item.productName,
      importUnit: item.importUnit,
      buyPrice: item.buyPrice,
      buyAmount: item.importUnit * item.buyPrice
    });
    this.editingIndex = index;
    setTimeout(() => this.focusQuantity(), 0);
  }

  removePreviewItem(index: number): void {
    this.previewItems.splice(index, 1);
  }

  private resetProductFields(): void {
    this.importForm.patchValue({
      barcode: '',
      productName: '',
      importUnit: null,
      buyPrice: null,
      salePrice: null,
      buyAmount: 0
    });
  }

  /* =========================
     TOTALS
  ========================== */
  getGrandTotalBuy(): number {
    return this.previewItems.reduce((sum, item) => sum + (item.buyPrice * item.importUnit), 0);
  }

  /* =========================
     SAVE
  ========================== */
  saveOnly(): void { this.save(false); }

  private save(printAfter: boolean): void {
    if (this.isSubmitted) return;

    if (this.previewItems.length === 0) {
      this.toastr.warning('No items to save');
      return;
    }

    const supplierId = this.importForm.get('supplierId')?.value;

    // ✅ Resolve supplier name safely, fallback to "General"
    let supplierName = 'General';
    if (supplierId) {
      const supplier = this.suppliers.find(s => String(s.id) === String(supplierId));
      console.log('Selected supplierId:', supplierId);
      console.log('Matched supplier:', supplier);
      if (supplier?.name) {
        supplierName = supplier.name;
      }
    } else {
      console.log('No supplier selected — defaulting to "General"');
    }

    this.isSubmitted = true;

    const now = new Date();
    const importTime = now.toTimeString().split(' ')[0];
    const importDate = this.importForm.get('importDate')?.value;

    const dto: ProductImportDTO = {
      importId: this.importId ?? '',
      supplierName,
      importerName: this.loggedInUserName,
      importDate,
      importTime,
      items: this.previewItems
    };

    console.log('Sending DTO:', dto);

    const request$ = this.importId
      ? this.importService.updateProductImport(dto)
      : this.importService.createProductImport(dto);

    request$.subscribe({
      next: res => {
        this.toastr.success('Import saved successfully');
        if (printAfter) {
          const importNo = res?.importId ?? this.importId;
          this.router.navigate(['/product-import/product-import/detail', importNo], {
            queryParams: { countdown: 5 }
          });
        } else {
          this.resetForm();
        }
        this.isSubmitted = false;
      },
      error: err => {
        const msg = err.error?.message || err.message || 'Save failed';
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  private resetForm(): void {
    this.importForm.reset();
    this.importForm.patchValue({
      importerName: this.loggedInUserName,
      importDate: this.today(),
      importUnit: 0,
      buyPrice: 0,
      buyAmount: 0
    });
    this.previewItems = [];
    this.importId = null;

    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[formControlName="productName"]');
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  /* =========================
     ENTER KEY HANDLING
  ========================== */
  @HostListener('document:keydown', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isQtyField = target.getAttribute('formcontrolname') === 'importUnit';
    const isBuyField = target.getAttribute('formcontrolname') === 'buyPrice';
    const isSupplierField = target.getAttribute('formcontrolname') === 'supplierId';

    // Escape key → cancel and go back to list
    if (event.key === 'Escape') {
      event.preventDefault();
      this.router.navigate(['/product-import']);
      return;
    }

    // Enter key in quantity or buy price fields → add to preview
    if (event.key === 'Enter' && (isQtyField || isBuyField)) {
      event.preventDefault();
      this.addToPreview();
    }

    // Enter key in supplier field → save & print
    if (event.key === 'Enter' && isSupplierField) {
      event.preventDefault();
      this.saveOnly();
    }
  }

  /* =========================
     EDIT MODE
  ========================== */
  private checkEditMode(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const importId = paramMap.get('importId');
      if (!importId) return;

      this.importId = importId;

      this.importService.getProductImportByImportId(importId).subscribe({
        next: (res: ProductImportDTO) => {
          const supplier = this.suppliers.find(s => s.name === res.supplierName);
          const supplierId = supplier ? supplier.id : '';

          this.importForm.patchValue({
            supplierId,
            importDate: res.importDate
          });
          this.previewItems = res.items.map((item: ProductImportItem) => ({
            barcode: item.barcode,
            productName: item.productName,
            importUnit: item.importUnit,
            buyPrice: item.buyPrice,
            salePrice: item.salePrice
          }));
        },
        error: () => this.toastr.error('Failed to load import for edit')
      });
    });
  }

  /* =========================
     UTIL
  ========================== */
  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
