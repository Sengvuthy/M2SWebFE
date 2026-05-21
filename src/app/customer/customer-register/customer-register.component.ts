// src/app/customer/customer-register.component.ts
import { Component } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-register',
  standalone: false,
  templateUrl: './customer-register.component.html',
  styleUrls: ['./customer-register.component.css']
})
export class CustomerRegisterComponent {
  name = '';
  phone = '';

  constructor(private customerService: CustomerService, private router: Router) {}

  async register() {
    this.customerService.getCustomerList({ phone: this.phone }).subscribe({
      next: res => {
        if (res.list.length > 0) {
          const existing = res.list[0];
          localStorage.setItem('customerId', existing.id!.toString());
          this.navigateAfterRegister();
        } else {
          // FIX: wrap phone in array
          this.customerService.signUpCustomer(this.name, [this.phone]).then(obs => {
            obs.subscribe({
              next: res => {
                localStorage.setItem('customerId', res.id!.toString());
                this.navigateAfterRegister();
              }
            });
          });
        }
      }
    });
  }

  private navigateAfterRegister(): void {
    const redirectUrl = this.router.routerState.snapshot.root.queryParams['redirect'];
    if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/customer/browse']);
    }
  }
}
