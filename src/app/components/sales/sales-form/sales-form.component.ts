//Sales-form.component.ts
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesService, SaleDTO, SaleItem } from '../../../services/sales.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService, Product, PageDTO } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-sales-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.css'],
  standalone: false
})
export class SalesFormComponent implements OnInit {

  saleForm!: FormGroup;
  customers: any[] = [];
  products: Product[] = [];
  previewItems: any[] = [];
  invoice: string | null = null;
  isSubmitted = false;
  highlightedIndex = -1;
  editingIndex: number | null = null;
  loggedInUserName = localStorage.getItem('username') || 'Unknown';
  selectedCustomerName: string = 'General';

  @ViewChild('quantityInput') quantityInput!: ElementRef;
  @ViewChild('productInput') productInput!: ElementRef;
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private customerService: CustomerService,
    private productService: ProductService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCustomers();
    this.checkEditMode();
    this.setupAutoCalculations();
  }

  private initializeForm(): void {
    this.saleForm = this.fb.group({
      customerId: [1], // ✅ default to General
      sellerName: [{ value: this.loggedInUserName, disabled: true }],
      saleDate: [this.today(), Validators.required],
      barcode: [''],
      productName: [''],
      discount: [0],
      numberOfUnit: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      soldAmount: [{ value: 0, disabled: true }],
      receiveAmount: [0],
      changeAmount: [{ value: 0, disabled: true }]
    });

    this.selectedCustomerName = 'General'; // ✅ sync display name
  }

  /* =========================
     CUSTOMER / PRODUCT
  ========================== */
  private loadCustomers(): void {
    const params = new HttpParams().set('page', '1').set('size', '100').set('sort', 'id,asc');
    this.customerService.getCustomerList(params).subscribe({
      next: res => this.customers = res.list,
      error: () => this.toastr.error('Failed to load customers')
    });
  }

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
        this.saleForm.patchValue({
          barcode: product.barcode,
          productName: product.name,
          unitPrice: product.salePrice ?? 0
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

  onCustomerChange(): void {
    const customerId = this.saleForm.get('customerId')?.value;
    const customer = this.customers.find(c => c.id === customerId);
    this.selectedCustomerName = customer?.name ?? 'General';
  }

  selectProduct(product: Product): void {
    this.saleForm.patchValue({
      barcode: product.barcode,
      productName: product.name,
      unitPrice: product.salePrice ?? 0
    });
    this.products = [];
    setTimeout(() => this.focusQuantity(), 0);
  }

  /* =========================
     PREVIEW ITEMS
  ========================== */
  addToPreview(): void {
    const values = this.saleForm.getRawValue();
    const subtotal = Number(values.unitPrice) * Number(values.numberOfUnit);
    const discountAmount = (Number(values.discount) / 100) * subtotal;
    const soldAmount = subtotal - discountAmount;

    // Try to add new condition
    const barcode = values.barcode?.trim();
    const productName = values.productName?.trim();
    const qty = Number(values.numberOfUnit);
    const price = Number(values.unitPrice);

    if (!barcode || !productName || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      return;
    }

    const newItem = {
      barcode: values.barcode,
      productName: values.productName,
      discount: Number(values.discount) || 0,
      numberOfUnit: Number(values.numberOfUnit) || 0,
      unitPrice: Number(values.unitPrice) || 0,
      soldAmount
    };

    if (this.editingIndex !== null) {
      this.previewItems[this.editingIndex] = newItem;
      this.editingIndex = null;
    } else {
      this.previewItems.push(newItem);
    }
    this.resetProductFields();

    setTimeout(() => {
      const input = this.productInput.nativeElement as HTMLInputElement;
      input.focus();
      input.select();
    }, 0);
  }

  editPreviewItem(item: any, index: number): void {
    this.saleForm.patchValue({
      barcode: item.barcode,
      productName: item.productName,
      discount: item.discount,
      numberOfUnit: item.numberOfUnit,
      unitPrice: item.unitPrice
    });
    this.editingIndex = index;
    setTimeout(() => this.focusQuantity(), 0);
  }

  removePreviewItem(index: number): void {
    this.previewItems.splice(index, 1);
  }

  private resetProductFields(): void {
    this.saleForm.patchValue({
      barcode: '', productName: '', discount: 0,
      numberOfUnit: 0, unitPrice: 0, soldAmount: 0
    });
  }

  /* =========================
     TOTALS
  ========================== */
  getGrandTotal(): number {
    return this.previewItems.reduce((sum, item) => {
      const subtotal = item.unitPrice * item.numberOfUnit;
      const discountAmount = (item.discount / 100) * subtotal;
      return sum + (subtotal - discountAmount);
    }, 0);
  }

  getChange(): number {
    const received = Number(this.saleForm.get('receiveAmount')?.value || 0);
    return received - this.getGrandTotal();
  }

  private setupAutoCalculations(): void {
    this.saleForm.valueChanges.subscribe(values => {
      const received = Number(values.receiveAmount ?? 0);
      const change = received - this.getGrandTotal();
      this.saleForm.patchValue({ changeAmount: change }, { emitEvent: false });
    });
  }
  /* =========================
     SAVE / PRINT
  ========================== */
  saveOnly(): void { this.save(false); }
  saveAndPrint(): void { this.save(true); }

  private save(printAfter: boolean): void {
    if (this.isSubmitted) return;
    if (this.previewItems.length === 0) {
      this.toastr.warning('No items to save');
      return;
    }

    this.isSubmitted = true;

    const grandTotal = this.getGrandTotal();
    const received = Number(this.saleForm.get('receiveAmount')?.value || 0);

    if (received < grandTotal) {
      this.toastr.warning('Received amount is less than total. Cannot proceed.');
      this.isSubmitted = false;
      return;
    }

    const customerId = this.saleForm.get('customerId')?.value || 1;
    let customerName = 'General';
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      customerName = customer.name;
    }

    const now = new Date();
    const saleTime = now.toTimeString().split(' ')[0];

    const total = grandTotal.toFixed(2);
    const change = (received - grandTotal).toFixed(2);

    const data: SaleDTO = {
      invoice: this.invoice ?? '',
      customerId,
      customerName,
      sellerName: this.loggedInUserName,
      saleDate: this.saleForm.get('saleDate')?.value,
      saleTime,
      receiveAmount: received,
      changeAmount: received - grandTotal,
      items: this.previewItems
    };

    const request$ = this.invoice
      ? this.salesService.updateSale(data)
      : this.salesService.createSale(data);

    request$.subscribe({
      next: res => {
        this.toastr.info(
          `Total: <b>$${total}</b><br>Received: <b>$${received.toFixed(2)}</b><br>Change: <b>$${change}</b>`,
          'Summary',
          { enableHtml: true, timeOut: 7000, closeButton: true }
        );

        if (printAfter) {
          const invoiceNo = res?.invoice ?? this.invoice;
          this.router.navigate(['/sales/sales/detail', invoiceNo], {
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
    this.saleForm.reset();
    this.saleForm.patchValue({
      sellerName: this.loggedInUserName,
      saleDate: this.today(),
      discount: 0,
      numberOfUnit: 0,
      unitPrice: 0,
      soldAmount: 0,
      receiveAmount: 0,
      changeAmount: 0
    });

    this.previewItems = [];
    this.invoice = null;

    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[formControlName="productName"]');
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  // Keep your global listener only for receiveAmount
  @HostListener('document:keydown', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isQtyField = target.getAttribute('formcontrolname') === 'numberOfUnit';
    const isBuyField = target.getAttribute('formcontrolname') === 'unitPrice';
    const isReceiveField = target.getAttribute('formcontrolname') === 'receiveAmount';

    if (event.key === 'Escape') {
      event.preventDefault();
      this.router.navigate(['/sales']);
      return;
    }

    // Enter key in quantity or buy price fields → add to preview
    if (event.key === 'Enter' && (isQtyField || isBuyField)) {
      event.preventDefault();
      this.addToPreview();
    }

    if (event.key === 'Enter' && isReceiveField) {
      event.preventDefault();
      this.saveAndPrint();
    }
  }


  /* =========================
     EDIT MODE
  ========================== */
  private checkEditMode(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const invoice = paramMap.get('invoice');
      if (!invoice) return;

      this.invoice = invoice;

      this.salesService.getSalesByInvoice(invoice).subscribe({
        next: (res: SaleDTO) => {
          // Ensure customers are loaded first
          if (this.customers.length === 0) {
            this.loadCustomers();
          }

          this.saleForm.patchValue({
            customerId: res.customerId,
            receiveAmount: res.receiveAmount,
            changeAmount: res.changeAmount,
            saleDate: res.saleDate
          });

          this.previewItems = res.items.map((item: SaleItem) => ({
            barcode: item.barcode,
            productName: item.productName,
            discount: item.discount,
            numberOfUnit: item.numberOfUnit,
            unitPrice: item.unitPrice,
            soldAmount: item.soldAmount
          }));
        },
        error: () => this.toastr.error('Failed to load invoice for edit')
      });
    });
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
