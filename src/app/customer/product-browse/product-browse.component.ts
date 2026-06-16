// src/app/customer/product-browse/product-browse.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CustomerService, CustomerDTO } from '../../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { CartService } from '../../services/cart.service';   // ✅ import CartService

@Component({
  selector: 'app-product-browse',
  standalone: false,
  templateUrl: './product-browse.component.html',
  styleUrls: ['./product-browse.component.css'],
})
export class ProductBrowseComponent implements OnInit {
  products: Product[] = [];
  customerName: string | null = null;
  isLoading = false;
  cartCount = 0;
  exchangeRate = 4000;
  isLoggedIn = false;

  searchKeyword = '';
  page = 1;
  limit = 20;
  totalPages = 1;

  sortBy = 'name';
  sortDir: 'asc' | 'desc' = 'asc';
  selectedCategoryId: number | null = null;

  constructor(
    private productService: ProductService,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private exchangeRateService: ExchangeRateService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // ✅ subscribe to cart count updates
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);

    // ✅ fetch exchange rate
    this.exchangeRateService.getRate().subscribe({
      next: dto => (this.exchangeRate = dto.rate),
      error: () => (this.exchangeRate = 4000),
    });

    // ✅ initialize customer info
    this.customerName = localStorage.getItem('customerName');

    // ✅ capture geolocation once
    if (!localStorage.getItem('userLocation') && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          localStorage.setItem('userLocation', JSON.stringify(coords));
        },
        err => console.warn('Geolocation failed:', err)
      );
    }

    // ✅ fetch customer by ID if logged in
    const customerId = localStorage.getItem('customerId');
    this.isLoggedIn = !!customerId;
    if (customerId) {
      this.customerService.getById(+customerId).subscribe({
        next: (customer: CustomerDTO) => (this.customerName = customer.name),
        error: () => (this.customerName = null),
      });
    }

    // ✅ subscribe to query params
    this.route.queryParams.subscribe(params => {
      this.searchKeyword = params['keyword'] || '';
      this.page = params['page'] ? +params['page'] : 1;

      const sort = params['sort'] || 'name,asc';
      const [field, dir] = sort.split(',');
      this.sortBy = field;
      this.sortDir = dir as 'asc' | 'desc';

      this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : null;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    const keyword = this.searchKeyword.trim();

    this.productService
      .searchProducts(keyword, this.selectedCategoryId, this.page, this.limit, `${this.sortBy},${this.sortDir}`)
      .subscribe({
        next: res => {
          // ✅ ensure each product has selectedQty
          this.products = res.list.map((p: Product) => ({ ...p, selectedQty: 1 }));
          this.totalPages = res.paginationDTO.totalPages;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  toKHR(priceUSD?: number): number {
    if (!priceUSD) return 0;
    const raw = priceUSD * this.exchangeRate;
    return Math.ceil(raw / 100) * 100;
  }

  private updateUrl(): void {
    this.router.navigate(['/customer/browse'], {
      queryParams: {
        keyword: this.searchKeyword,
        categoryId: this.selectedCategoryId,
        page: this.page,
        sort: `${this.sortBy},${this.sortDir}`,
      },
    });
  }

  search(): void {
    this.page = 1;
    this.updateUrl();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.page = 1;
    this.updateUrl();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.updateUrl();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.updateUrl();
    }
  }

  goToPage(p: number): void {
    this.page = p;
    this.updateUrl();
  }

  get pageNumbers(): number[] {
    const delta = 2;
    const pages: number[] = [1];

    if (this.page - delta > 2) pages.push(-1);

    for (let i = Math.max(2, this.page - delta); i <= Math.min(this.totalPages - 1, this.page + delta); i++) {
      pages.push(i);
    }

    if (this.page + delta < this.totalPages - 1) pages.push(-1);
    if (this.totalPages > 1) pages.push(this.totalPages);

    return pages;
  }

  viewDetail(product: Product): void {
    const customerId = localStorage.getItem('customerId');
    const productRoute = `/customer/product/${product.barcode}`;

    if (customerId) {
      this.router.navigate([productRoute]);
    } else {
      this.router.navigate(['/customer/login'], { queryParams: { redirect: productRoute } });
    }
  }

  addToSale(product: Product): void {
    const qty = product.selectedQty && product.selectedQty > 0 ? product.selectedQty : 1;

    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      this.router.navigate(['/customer/login'], {
        queryParams: { redirect: '/customer/browse' }
      });
      return;
    }

    // ✅ Add to cart
    this.cartService.addItem(product.barcode, qty);

    // ✅ Trigger animation
    this.flyToCart(product);
  }

  flyToCart(product: Product): void {
    const cartIcon = document.getElementById('cart-icon');
    const productImg = document.querySelector(`img[data-barcode="${product.barcode}"]`) as HTMLElement;

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

  goToSale(): void {
    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      this.router.navigate(['/sales/sales-form']);
    } else {
      this.router.navigate(['/customer/login'], { queryParams: { redirect: '/sales/sales-form' } });
    }
  }

  logout(): void {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    this.customerName = null;
    this.router.navigate(['/customer/login']);
  }

  openTelegram(): void {
    window.open('https://t.me/m2sweb', '_blank');
  }
}
