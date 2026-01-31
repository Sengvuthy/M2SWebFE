import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  constructor(private userService: UserService, private fb: FormBuilder) { }
  loginForm!: FormGroup;
  @Output() loginEvent = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    })
  }

  signIn() {
    const loginData = this.loginForm.value;
    this.userService.login(loginData).subscribe({
      next: (res: any) => {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("username", loginData.username);
        this.loginEvent.emit(true);
      },
      error: err => console.error("Login failed", err)
    });
  }
}
