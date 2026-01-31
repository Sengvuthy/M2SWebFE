import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService, SaleDTO, SaleItem } from '../../../services/sales.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales-detail',
  standalone: false,
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.css']
})
export class SalesDetailComponent implements OnInit {
  invoice = '';
  items: SaleItem[] = [];
  info: any = {};
  countdown = 0;

  receivedAmount = 0;
  changeAmount = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private salesService: SalesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.invoice = this.route.snapshot.paramMap.get('invoice') || '';
    this.countdown = Number(this.route.snapshot.queryParamMap.get('countdown')) || 0;

    this.salesService.getSalesByInvoice(this.invoice).subscribe({
      next: (res: SaleDTO) => {
        this.items = res.items ?? [];

        this.info = {
          invoice: res.invoice,
          customerName: res.customerName,
          sellerName: res.sellerName,
          saleDate: res.saleDate,
          saleTime: res.saleTime
        };

        this.receivedAmount = Number(res.receiveAmount) || 0;
        this.changeAmount = Number(res.changeAmount) || 0;
      },
      error: () => {
        this.toastr.error('Failed to load invoice items');
      }
    });

    if (this.countdown > 0) {
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(timer);
          this.router.navigate(['/sales/form']);
        }
      }, 1000);
    }
  }

  getTotal(): number {
    return this.items.reduce((sum, it) => {
      const subtotal = (Number(it.unitPrice) || 0) * (Number(it.numberOfUnit) || 0);
      const discountAmount = (Number(it.discount) || 0) / 100 * subtotal;
      const lineTotal = Number(it.soldAmount) || (subtotal - discountAmount);
      return sum + lineTotal;
    }, 0);
  }

  print(): void {
    window.print();
  }

  cancel(): void {
    if (!confirm(`Cancel invoice ${this.invoice}? This will restore stock.`)) return;

    this.salesService.cancelSale(this.invoice).subscribe({
      next: () => {
        this.toastr.success('Invoice cancelled');
        this.router.navigate(['/sales']);
      },
      error: err => {
        const msg = err.error?.message || 'Cancel failed';
        this.toastr.error(msg);
      }
    });
  }
}
