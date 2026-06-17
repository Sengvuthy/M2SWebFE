// src/app/components/sales-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesService, SaleDTO, SaleItem } from '../../../services/sales.service';
import { ProductService } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ExchangeRateService } from '../../../services/exchange-rate.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-sales-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.css'],
  standalone: false
})
export class SalesFormComponent implements OnInit {

  saleForm!: FormGroup;
  previewItems: SaleItem[] = [];
  invoice: string | null = null;
  isSubmitted = false;
  selectedCustomerName = 'General';
  exchangeRate = 0;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private productService: ProductService,
    private exchangeRateService: ExchangeRateService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    this.exchangeRateService.getRate().subscribe({
      next: dto => this.exchangeRate = dto.rate,
      error: () => this.exchangeRate = 4000
    });

    const customerId = localStorage.getItem('customerId');
    const customerName = localStorage.getItem('customerName');
    this.saleForm.patchValue({ customerId });
    this.selectedCustomerName = customerName || 'General';

    // ✅ Load preview items from CartService
    const cart = this.cartService.getCart();
    this.previewItems = [];
    cart.forEach((c: any) => {
      this.productService.getByBarcode(c.barcode).subscribe({
        next: product => {
          this.previewItems.push({
            barcode: product.barcode,
            productName: product.name,
            khmerName: product.khmerName,
            discount: 0,
            numberOfUnit: c.qty,
            unitPrice: product.salePrice ?? 0,
            soldAmount: (product.salePrice ?? 0) * c.qty,
            imagePath: product.imagePath
          });
        },
        error: () => this.toastr.error(`Product ${c.barcode} not found`)
      });
    });
  }

  private initializeForm(): void {
    this.saleForm = this.fb.group({
      customerId: [null, Validators.required],
      saleDate: [this.today(), Validators.required]
    });
  }

  updateCart(): void {
    // ✅ sync previewItems back to CartService
    this.cartService.clearCart();
    this.previewItems.forEach(item => {
      this.cartService.addItem(item.barcode, item.numberOfUnit);
    });
  }

  increaseQty(index: number): void {
    this.previewItems[index].numberOfUnit++;
    this.updateCart();
  }

  decreaseQty(index: number): void {
    if (this.previewItems[index].numberOfUnit > 1) {
      this.previewItems[index].numberOfUnit--;
      this.updateCart();
    }
  }

  removePreviewItem(index: number): void {
    const removed = this.previewItems[index].barcode;
    this.previewItems.splice(index, 1);
    this.cartService.removeItem(removed);   // ✅ use CartService

    // 🔹 If no items left, redirect to product-browse
    if (this.previewItems.length === 0) {
      this.router.navigate(['/customer/browse']);
    }
  }

  getGrandTotal(): number {
    const total = this.previewItems.reduce((sum, item) => {
      const subtotal = item.unitPrice * item.numberOfUnit;
      const discountAmount = (item.discount / 100) * subtotal;
      return sum + (subtotal - discountAmount);
    }, 0);
    return Math.round(total * 100) / 100;
  }

  getGrandTotalKHR(): number {
    const grandTotalUSD = this.getGrandTotal();
    return Math.round(grandTotalUSD * this.exchangeRate);
  }

  Checkout(): void {
    if (this.isSubmitted || this.previewItems.length === 0) return;

    this.isSubmitted = true;

    const grandTotal = this.getGrandTotal();
    const customerId = this.saleForm.get('customerId')?.value || null;
    const customerName = this.selectedCustomerName?.trim() || 'General';

    const now = new Date();
    const saleTime = now.toTimeString().split(' ')[0];

    const data: SaleDTO = {
      invoice: this.invoice ?? '',
      customerId,
      customerName,
      saleDate: this.saleForm.get('saleDate')?.value,
      saleTime,
      items: this.previewItems,
      soldAmount: grandTotal
    };

    const request$ = this.invoice
      ? this.salesService.updateSale(data)
      : this.salesService.createSale(data);

    request$.subscribe({
      next: res => {
        console.log('Sale response:', res);
        const invoiceNo = res?.invoice;
        if (invoiceNo) {
          localStorage.setItem('lastInvoice', invoiceNo);
          this.router.navigate(['/sales/sales-detail', invoiceNo]);
        }
        this.resetForm();
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
    this.saleForm.reset({ saleDate: this.today() });
    this.previewItems = [];
    this.invoice = null;
    this.cartService.clearCart();
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
