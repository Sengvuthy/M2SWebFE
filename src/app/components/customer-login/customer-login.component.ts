//src/app/components/customer-login/customer-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-login',
  standalone: false,
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.css']
})
export class CustomerLoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      phone: [''] // login by phone number
    });
  }

  signIn(): void {
    const phone = this.loginForm.value.phone;
    this.customerService.findByPhone(phone).subscribe({
      next: (customer) => {
        localStorage.setItem('customerId', customer.id!.toString());
        localStorage.setItem('customerName', customer.name);

        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        if (redirect) {
          this.router.navigate([redirect]);
        } else {
          this.router.navigate(['/customer/browse']);
        }
      },
      error: () => alert('Customer not found')
    });
  }

  goToSignUp(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigate(['/admin/customers/form'], { queryParams: { redirect } });
  }
}
