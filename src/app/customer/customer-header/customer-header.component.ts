// src/app/customer/customer-header/customer-header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { VisionService } from '../../services/vision.service';

@Component({
  selector: 'app-customer-header',
  standalone: false,
  templateUrl: './customer-header.component.html',
  styleUrls: ['./customer-header.component.css']
})
export class CustomerHeaderComponent implements OnInit {
  searchKeyword = '';
  customerName: string | null = null;
  cartCount = 0;
  categories: any[] = [];
  selectedCategoryId: number | null = null;
  selectedCategoryName = 'All';
  previewImage: string | null = null;
  isLoading = false;

  // ✅ OCR language selector
  ocrLang = 'auto';
  availableLangs = [
    { code: 'auto', label: 'Auto Detect' },
    { code: 'en', label: 'English' },
    { code: 'km', label: 'Khmer' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'my', label: 'Burmese' }
  ];

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private cartService: CartService,
    private visionService: VisionService
  ) { }

  ngOnInit(): void {
    this.customerName = localStorage.getItem('customerName');
    this.cartService.cartCount$.subscribe(count => (this.cartCount = count));
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: res => {
        this.categories = res.list.map((c: any) => ({
          ...c,
          translationKey: `CATEGORY_${c.name.toUpperCase()}`
        }));
      },
      error: err => console.error('Error loading categories:', err)
    });
  }

  searchByCategory(): void {
    this.router.navigate(['/customer/browse'], {
      queryParams: {
        keyword: this.searchKeyword,
        categoryId: this.selectedCategoryId
      }
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.selectedCategoryName = categoryId
      ? this.categories.find(c => c.id === categoryId)?.name || 'All'
      : 'All';
    this.searchByCategory();
  }

  search(): void {
    this.router.navigate(['/customer/browse'], {
      queryParams: { keyword: this.searchKeyword }
    });
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.router.navigate(['/customer/browse']);
  }

  goHome(): void {
    this.router.navigate(['/customer/browse']);
  }
  goToLogin(): void {
    this.router.navigate(['/customer/login']);
  }

  logout(): void {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    this.customerName = null;
    this.router.navigate(['/customer/login']);
  }

  goToSale(): void {
    this.router.navigate(['/sales/sales-form']);
  }

  goToMyOrder(): void {
    const lastInvoice = localStorage.getItem('lastInvoice');
    if (lastInvoice) {
      this.router.navigate(['/sales/sales-detail', lastInvoice]);
    } else {
      this.router.navigate(['/customer/browse']);
    }
  }

  navigateToTelegramBind(): void {
    this.router.navigate(['/customer/telegram']);
  }

  // ✅ Helper: extract clean keyword from OCR text
  private extractKeyword(rawText: string): string {
    const words = rawText.split(/\s+/);
    const blacklist = ['HACCP', 'GMP', 'Product', 'Cambodia', 'eau'];
    const filtered = words.filter(
      w => !/^\d/.test(w) && !blacklist.includes(w)
    );
    return filtered[0] || rawText;
  }

  // ✅ Handle image upload + OCR
  handleImage(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
      const base64 = (this.previewImage as string).split(',')[1];
      this.isLoading = true;
      this.searchKeyword = 'Recognizing...';

      this.visionService.recognizeText(base64, this.ocrLang).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const response = res.responses[0];

          const rawText =
            response.fullTextAnnotation?.text ||
            response.textAnnotations?.[0]?.description ||
            response.logoAnnotations?.[0]?.description ||
            response.labelAnnotations?.[0]?.description ||
            '';

          if (rawText) {
            this.searchKeyword = this.extractKeyword(rawText.trim());
            this.search();
          } else {
            this.searchKeyword = '';
            alert('No text or logo detected in image.');
          }
        },
        error: err => {
          this.isLoading = false;
          console.error('Vision API error:', err);
          this.searchKeyword = '';
          alert('Failed to recognize text from image.');
        }
      });
    };
    reader.readAsDataURL(file);
  }
}
