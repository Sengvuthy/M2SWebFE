import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'FE';
  isLoggedIn = false;

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.isLoggedIn = false;
      this.router.navigate(['/login']); // ✅ redirect if no token
    }
  }

  switchView(isSignIn: boolean) {
    this.isLoggedIn = isSignIn;
    if (isSignIn) {
      this.router.navigate(['/sales']); // ✅ redirect after login
    } else {
      this.router.navigate(['/login']);
    }
  }
}
