//exchange-rate.component.ts
import { Component, OnInit } from '@angular/core';
import { ExchangeRateService, ExchangeRateDTO } from '../../services/exchange-rate.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.css'],
  standalone: false
})
export class ExchangeRateComponent implements OnInit {
  rate: number = 0;

  constructor(
    private exchangeRateService: ExchangeRateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.exchangeRateService.getRate().subscribe({
      next: (dto: ExchangeRateDTO) => this.rate = dto.rate,
      error: () => this.rate = 4000
    });
  }

  updateRate(): void {
    this.exchangeRateService.setRate(this.rate).subscribe({
      next: (dto: ExchangeRateDTO) => {
        this.toastr.success('Exchange rate updated successfully');
        this.rate = dto.rate;
      },
      error: () => this.toastr.error('Failed to update exchange rate')
    });
  }
}
