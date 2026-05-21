// sidebar.component.ts
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isLoggedIn = false;
  @Output() logoutEvent = new EventEmitter<boolean>();

  constructor(private router: Router, private userService: UserService) {}

  signOut() {
    this.userService.logout();
    this.logoutEvent.emit(false);
    this.router.navigate(['/admin/login']);
  }

  goToLogin() {
    this.router.navigate(['/admin/login']);
  }
}
