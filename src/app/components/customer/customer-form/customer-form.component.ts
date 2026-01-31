import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CustomerService, CustomerDTO } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: false,
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {

  customerForm!: FormGroup;
  isSubmitted = false;
  customerId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      isDefault: [false]
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = Number(paramMap.get('id'));
      if (id) {
        this.customerId = id;
        this.customerService.getById(id).subscribe({
          next: (customer: CustomerDTO) => {
            this.customerForm.patchValue(customer);
          },
          error: () => {
            this.toastr.error("Customer not found", "Error");
            this.router.navigate(['/customer']);
          }
        });
      }
    });
  }

  private getCustomerData(): CustomerDTO {
    return { ...this.customerForm.value };
  }

  createCustomer() {
    const data = this.getCustomerData();
    this.isSubmitted = true;

    this.customerService.createCustomer(data).subscribe({
      next: () => {
        this.toastr.success("Customer created successfully!", "Success");
        this.isSubmitted = false;
        this.router.navigate(['/customer']);
      },
      error: err => {
        const msg = err.error?.message || "Create failed";
        this.toastr.error(msg, "Create Failed");
        this.isSubmitted = false;
      }
    });
  }

  updateCustomer() {
    const data = this.getCustomerData();
    this.isSubmitted = true;

    this.customerService.updateCustomer(this.customerId!, data).subscribe({
      next: () => {
        this.toastr.success("Customer updated successfully!", "Success");
        this.isSubmitted = false;
        this.router.navigate(['/customer']);
      },
      error: err => {
        const msg = err.error?.message || "Update failed";
        this.toastr.error(msg, "Update Failed");
        this.isSubmitted = false;
      }
    });
  }

  saveCustomer() {
    if (this.customerForm.invalid || this.isSubmitted) return;

    if (this.customerId) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  cancel() {
    this.router.navigate(['/customer']);
  }
}
