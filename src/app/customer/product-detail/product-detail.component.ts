// src/app/customer/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { CartService } from '../../services/cart.service';   // ✅ import CartService

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  quantity: number = 1; // ✅ adjustable qty
  exchangeRate = 4000;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private exchangeRateService: ExchangeRateService,
    private cartService: CartService   // ✅ inject CartService
  ) { }

  ngOnInit(): void {
    // ✅ fetch exchange rate
    this.exchangeRateService.getRate().subscribe({
      next: dto => this.exchangeRate = dto.rate,
      error: () => this.exchangeRate = 4000 // fallback
    });

    const barcode = this.route.snapshot.paramMap.get('barcode');
    if (barcode) {
      this.productService.getByBarcode(barcode).subscribe({
        next: res => {
          this.product = res;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  toKHR(priceUSD: number | undefined): number {
    if (!priceUSD) return 0;
    const raw = priceUSD * this.exchangeRate;
    return Math.ceil(raw / 100) * 100;
  }

  addToSale(): void {
    if (!this.product) return;

    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      this.router.navigate(['/customer/login'], {
        queryParams: { redirect: `/customer/product/${this.product.barcode}` }
      });
      return;
    }

    this.cartService.addItem(this.product.barcode, this.quantity);
    this.flyToCart(); // ✅ trigger animation
  }

  flyToCart(): void {
    const cartIcon = document.getElementById('cart-icon');
    const productImg = document.querySelector(`img[data-barcode="${this.product?.barcode}"]`) as HTMLElement;

    if (!cartIcon || !productImg) return;

    const imgClone = productImg.cloneNode(true) as HTMLElement;
    const rect = productImg.getBoundingClientRect();

    imgClone.style.position = 'fixed';
    imgClone.style.left = rect.left + 'px';
    imgClone.style.top = rect.top + 'px';
    imgClone.style.width = rect.width + 'px';
    imgClone.style.height = rect.height + 'px';
    imgClone.style.zIndex = '2000';
    imgClone.style.transition = 'all 0.8s ease-in-out';
    imgClone.style.opacity = '1';

    document.body.appendChild(imgClone);

    const cartRect = cartIcon.getBoundingClientRect();
    setTimeout(() => {
      imgClone.style.left = cartRect.left + 'px';
      imgClone.style.top = cartRect.top + 'px';
      imgClone.style.width = '30px';
      imgClone.style.height = '30px';
      imgClone.style.opacity = '0';
      imgClone.style.transform = 'scale(0.1)';
    }, 50);

    setTimeout(() => {
      imgClone.remove();
      cartIcon.classList.add('cart-bounce');
      setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
    }, 900);
  }
}
