//product-import-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductImportService, ProductImportDTO, ProductImportItem } from '../../../services/product-import.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-import-detail',
  standalone: false,
  templateUrl: './product-import-detail.component.html',
  styleUrl: './product-import-detail.component.css'
})
export class ProductImportDetailComponent implements OnInit {

  importId = '';
  items: ProductImportItem[] = [];
  info: any = {};
  countdown = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private importService: ProductImportService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.importId = this.route.snapshot.paramMap.get('importId') || '';
    this.countdown = Number(this.route.snapshot.queryParamMap.get('countdown')) || 0;

    this.importService.getProductImportByImportId(this.importId).subscribe({
      next: (res: ProductImportDTO) => {
        this.items = res.items ?? [];
        this.info = {
          importId: res.importId,
          supplierName: res.supplierName,
          importerName: res.importerName,
          importDate: res.importDate,
          importTime: res.importTime
        };
      },
      error: () => {
        this.toastr.error('Failed to load import id items');
      }
    });

    if (this.countdown > 0) {
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(timer);
          this.router.navigate(['/productImport/form']);
        }
      }, 1000);
    }
  }

  getTotal(): number {
    return this.items.reduce((sum, it) => {
      const subtotal = (Number(it.buyPrice) || 0) * (Number(it.importUnit) || 0);
      return sum + subtotal;
    }, 0);
  }

  print(): void {
    window.print();
  }

  cancel(): void {
    if (!confirm(`Cancel import id ${this.importId}? This will restore stock.`)) return;

    this.importService.cancelProductImport(this.importId).subscribe({
      next: () => {
        this.toastr.success('ImportId cancelled');
        this.router.navigate(['/productImport']);
      },
      error: err => {
        const msg = err.error?.message || 'Cancel failed';
        this.toastr.error(msg);
      }
    });
  }
}
