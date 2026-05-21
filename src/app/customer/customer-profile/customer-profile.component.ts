// src/app/customer/customer-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CustomerService, CustomerDTO } from '../../services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-profile',
  standalone: false,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  customer: CustomerDTO | null = null;
  isLoading = false;

  constructor(
    private readonly customerService: CustomerService,
    private readonly toastr: ToastrService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomer();
  }

  private loadCustomer(): void {
    this.isLoading = true;
    const id = localStorage.getItem('customerId');

    if (!id) {
      this.toastr.warning('No customer ID found');
      this.isLoading = false;
      return;
    }

    this.customerService.getById(+id).subscribe({
      next: (res: CustomerDTO) => {
        // Normalize arrays to avoid undefined
        this.customer = {
          ...res,
          phones: res.phones ?? [],
          addresses: res.addresses ?? []
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load customer:', err);
        this.toastr.error('Failed to load customer');
        this.isLoading = false;
      }
    });
  }

  editProfile(): void {
    if (!this.customer?.id) {
      this.toastr.warning('Cannot edit profile without a valid ID');
      return;
    }
    this.router.navigate(['/admin/customers/form', this.customer.id]);
  }
}
