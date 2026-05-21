//app.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserService } from './services/user.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'M2SWebFE';
  isLoggedIn = false;
  showSidebar = true;
  showLanguageSelection = false;

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
  ) {
    // configure available languages
    translate.addLangs(['en', 'khm', 'ch', 'vn']);
    translate.setDefaultLang('en');

    const savedLang = localStorage.getItem('appLang');
    if (savedLang) {
      translate.use(savedLang);
      this.showLanguageSelection = false; // already chosen
    } else {
      this.showLanguageSelection = true; // first time → show selector
    }
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      this.userService.refresh().subscribe({
        next: (res: any) => {
          localStorage.setItem("accessToken", res.accessToken);
          localStorage.setItem("refreshToken", res.refreshToken);
          this.isLoggedIn = true;
        },
        error: () => {
          this.userService.logout();
          this.isLoggedIn = false;
          this.router.navigate(['/customer/browse']);
        }
      });
    } else {
      this.isLoggedIn = false;
    }

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.showSidebar = !(
          url.startsWith('/customer') ||
          url.startsWith('/sales/sales-form') ||
          url.startsWith('/sales/detail') ||
          url.startsWith('/admin/customers/form')
        );
      });
  }

  switchView(isSignIn: boolean) {
    this.isLoggedIn = isSignIn;
    if (isSignIn) {
      this.router.navigate(['/sales']);
    } else {
      this.router.navigate(['/customer/browse']);
    }
  }

  onActivate(componentRef: any) {
    if (componentRef.loginEvent) {
      componentRef.loginEvent.subscribe((loggedIn: boolean) => {
        this.switchView(loggedIn);
      });
    }
  }

  // ✅ handle language choice
  chooseLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('appLang', lang);
    this.showLanguageSelection = false;

    // ✅ Ask for location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('Location allowed:', position.coords);
          // You can store coords in localStorage or a service
          localStorage.setItem('userLat', position.coords.latitude.toString());
          localStorage.setItem('userLng', position.coords.longitude.toString());
        },
        error => {
          console.warn('❌ Location permission denied or unavailable', error);
        }
      );
    }
  }
}
