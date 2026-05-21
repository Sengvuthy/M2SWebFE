// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.refreshCartCount();
  }

  private refreshCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
    this.cartCountSubject.next(count);
  }

  addItem(barcode: string, qty: number = 1) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((c: any) => c.barcode === barcode);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ barcode, qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    this.refreshCartCount();
  }

  removeItem(barcode: string) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter((c: any) => c.barcode !== barcode);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.refreshCartCount();
  }

  clearCart() {
    localStorage.removeItem('cart');
    this.refreshCartCount();
  }

  getCart(): any[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }
}
