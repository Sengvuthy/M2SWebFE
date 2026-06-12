//login.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  loginForm!: FormGroup;
  @Output() loginEvent = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  signIn() {
    const loginData = this.loginForm.value;
    this.userService.login(loginData).subscribe({
      next: (res: any) => {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("username", loginData.username);
        this.loginEvent.emit(true);

        // ✅ Navigate to Sales after successful login
        this.router.navigate(['/sales/list']);
      },
      error: err => console.error("Login failed", err)
    });
  }
}
