//expense-form.component.ts
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseReportItem, ExpenseReportService, ExpenseReportDTO } from '../../../services/expense.service';
import { SupplierService } from '../../../services/supplier.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css'],
  standalone: false
})
export class ExpenseFormComponent implements OnInit {

  expenseForm!: FormGroup;
  suppliers: any[] = [];
  previewItems: ExpenseReportItem[] = [];
  expenseId: string | null = null;
  isSubmitted = false;
  editingIndex: number | null = null;
  loggedInUserName = localStorage.getItem('username') || 'Unknown';

  @ViewChild('productNameInput') productNameInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseReportService,
    private supplierService: SupplierService,
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
    this.expenseForm = this.fb.group({
      supplierId: [''],
      payer: ['', Validators.required],
      expenseDate: [this.today(), Validators.required],
      productName: ['', Validators.required],
      expenseUnit: [null, [Validators.required, Validators.min(1)]],
      expensePrice: [null, [Validators.required, Validators.min(0)]],
      totalExpense: [{ value: 0, disabled: true }]
    });
  }

  private loadSuppliers(): void {
    const params = new HttpParams().set('page', '1').set('size', '100').set('sort', 'id,asc');
    this.supplierService.getSupplierList(params).subscribe({
      next: res => this.suppliers = res.list,
      error: () => this.toastr.error('Failed to load suppliers')
    });
  }

  calculateAmount(): void {
    const qty = Number(this.expenseForm.get('expenseUnit')?.value);
    const price = Number(this.expenseForm.get('expensePrice')?.value);
    if (!isNaN(qty) && !isNaN(price)) {
      this.expenseForm.patchValue({ totalExpense: qty * price });
    }
  }

  addToPreview(): void {
    const values = this.expenseForm.getRawValue();
    const productName = values.productName?.trim();
    const qty = Number(values.expenseUnit);
    const price = Number(values.expensePrice);

    if (!productName || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      return;
    }

    const newItem: ExpenseReportItem = {
      productName,
      source: 'OTHER',
      expenseUnit: qty,
      expensePrice: price,
      expenseAmount: qty * price
    };

    if (this.editingIndex !== null) {
      this.previewItems[this.editingIndex] = newItem;
      this.editingIndex = null;
    } else {
      this.previewItems.push(newItem);
    }

    this.expenseForm.patchValue({ totalExpense: qty * price });
    this.resetProductFields();

    setTimeout(() => {
      this.productNameInput.nativeElement.focus();
      this.productNameInput.nativeElement.select();
    }, 0);
  }

  editPreviewItem(item: ExpenseReportItem, index: number): void {
    this.expenseForm.patchValue({
      productName: item.productName,
      expenseUnit: item.expenseUnit,
      expensePrice: item.expensePrice,
      totalExpense: item.expenseUnit * item.expensePrice
    });
    this.editingIndex = index;
  }

  removePreviewItem(index: number): void {
    this.previewItems.splice(index, 1);
  }

  private resetProductFields(): void {
    this.expenseForm.patchValue({
      productName: '',
      expenseUnit: null,
      expensePrice: null,
      totalExpense: 0
    });
  }

  getGrandTotal(): number {
    return this.previewItems.reduce((sum, item) => sum + (item.expensePrice * item.expenseUnit), 0);
  }

  saveOnly(): void { this.save(false); }

  private save(printAfter: boolean): void {
    if (this.isSubmitted) return;
    if (this.previewItems.length === 0) {
      this.toastr.warning('No items to save');
      return;
    }

    this.isSubmitted = true;

    const supplierId = this.expenseForm.get('supplierId')?.value;
    const supplier = this.suppliers.find(c => c.id === supplierId);
    const supplierName = supplier ? supplier.name : 'General';

    const now = new Date();
    const expenseTime = now.toTimeString().split(' ')[0];

    const data: ExpenseReportDTO = {
      expenseId: this.expenseId ?? '',
      supplierName,
      payerName: this.expenseForm.get('payer')?.value,
      expenseDate: this.expenseForm.get('expenseDate')?.value,
      expenseTime,
      items: this.previewItems
    };

    const request$ = this.expenseId
      ? this.expenseService.updateExpense(data)
      : this.expenseService.createExpense(data);

    request$.subscribe({
      next: res => {
        this.toastr.success('Expense saved successfully');
        if (printAfter) {
          const expenseNo = res?.expenseId ?? this.expenseId;
          this.router.navigate(['/expense/detail', expenseNo], {
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
    this.expenseForm.reset();
    this.expenseForm.patchValue({
      payer: '',
      expenseDate: this.today(),
      expenseUnit: 0,
      expensePrice: 0,
      totalExpense: 0
    });
    this.previewItems = [];
    this.expenseId = null;

    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[formControlName="productName"]');
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  cancel(): void {
    this.router.navigate(['/expense']);
  }

  @HostListener('document:keydown', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isQtyField = target.getAttribute('formcontrolname') === 'expenseUnit';
    const isPriceField = target.getAttribute('formcontrolname') === 'expensePrice';
    const isSupplierField = target.getAttribute('formcontrolname') === 'supplierId';

    // Escape key → cancel and go back to list
    if (event.key === 'Escape') {
      event.preventDefault();
      this.router.navigate(['/expense']);
      return;
    }

    // Enter key in quantity or price fields → add to preview
    if (event.key === 'Enter' && (isQtyField || isPriceField)) {
      event.preventDefault();
      this.addToPreview();
    }

    // Enter key in supplier field → save
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
      const expenseId = paramMap.get('expenseId');
      if (!expenseId) return;

      this.expenseId = expenseId;

      this.expenseService.getExpenseByExpenseId(expenseId).subscribe({
        next: (res: ExpenseReportDTO) => {
          const supplier = this.suppliers.find(s => s.name === res.supplierName);
          const supplierId = supplier ? supplier.id : '';

          this.expenseForm.patchValue({
            supplierId,
            payer: res.payerName,
            expenseDate: res.expenseDate
          });

          this.previewItems = res.items.map((item: ExpenseReportItem) => ({
            productName: item.productName,
            source: item.source,
            expenseUnit: item.expenseUnit,
            expensePrice: item.expensePrice,
            expenseAmount: item.expenseAmount
          }));
        },
        error: () => this.toastr.error('Failed to load expense for edit')
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
