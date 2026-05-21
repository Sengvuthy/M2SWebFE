//src/app/customer/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce(
      (sum, item) => sum + (item.salePrice * item.quantity),
      0
    );
  }

  placeOrder(): void {
    // ✅ Clear cart and confirm order
    localStorage.removeItem('cart');
    alert('✅ Your order has been placed successfully!');
    this.router.navigate(['/customer/profile']); // redirect after checkout
  }
}
