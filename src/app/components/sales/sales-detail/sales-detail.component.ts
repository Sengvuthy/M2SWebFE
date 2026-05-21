//sales-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService, SaleDTO, SaleItem } from '../../../services/sales.service';
import { ToastrService } from 'ngx-toastr';
import { ExchangeRateService } from '../../../services/exchange-rate.service';

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

  totalUSD = 0;
  totalKHR = 0;
  exchangeRate = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private salesService: SalesService,
    private toastr: ToastrService,
    private exchangeRateService: ExchangeRateService
  ) { }

  ngOnInit(): void {
    this.invoice = this.route.snapshot.paramMap.get('invoice') || '';
    this.countdown = Number(this.route.snapshot.queryParamMap.get('countdown')) || 0;

    this.exchangeRateService.getRate().subscribe({
      next: dto => this.exchangeRate = dto.rate,
      error: () => this.exchangeRate = 4000 // fallback
    });

    this.salesService.getSalesByInvoice(this.invoice).subscribe({
      next: (res: SaleDTO) => {
        this.items = res.items ?? [];

        this.info = {
          invoice: res.invoice,
          customerName: res.customerName,
          saleDate: res.saleDate,
          saleTime: res.saleTime
        };

        this.totalUSD = this.getTotal();
        this.totalKHR = this.roundUp100(this.totalUSD * this.exchangeRate);
      },
      error: () => this.toastr.error('Failed to load invoice items')
    });

    if (this.countdown > 0) {
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(timer);
          this.router.navigate(['/product-browse']);
        }
      }, 1000);
    }
  }

  private getTotal(): number {
    return this.items.reduce((sum, it) => {
      const subtotal = (Number(it.unitPrice) || 0) * (Number(it.numberOfUnit) || 0);
      const discountAmount = (Number(it.discount) || 0) / 100 * subtotal;
      const lineTotal = Number(it.soldAmount) || (subtotal - discountAmount);
      return sum + lineTotal;
    }, 0);
  }

  private roundUp100(value: number): number {
    return Math.ceil(value / 100) * 100;
  }

  continueShopping(): void {
    this.router.navigate(['/customer/browse']);
  }
}
