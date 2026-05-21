// src/app/customer/telegram/telegram.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-telegram',
  standalone: false,
  templateUrl: './telegram.component.html',
  styleUrls: ['./telegram.component.css']
})
export class TelegramComponent {
  telegramPhone = '';

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  connectTelegram(): void {
    if (!this.telegramPhone) {
      this.toastr.warning('Please enter your Telegram phone number');
      return;
    }

    this.customerService.bindTelegramByPhone(this.telegramPhone).subscribe({
      next: () => {
        this.toastr.success('Telegram connected successfully!');
        // Open Telegram bot right after binding
        window.open(`https://t.me/m2sweb_bot?start=${this.telegramPhone}`, '_blank');
        this.router.navigate(['/customer/browse']);
      },
      error: err => this.toastr.error(err.error?.message || 'Failed to connect Telegram')
    });
  }
}
