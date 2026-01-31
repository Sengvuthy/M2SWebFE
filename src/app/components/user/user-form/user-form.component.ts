//user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { RoleService, RoleDTO } from '../../../services/role.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  userForm!: FormGroup;
  roles: RoleDTO[] = [];
  isSubmitted = false;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize form with three role dropdowns
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      phoneNumber: [''],
      role1: ['', Validators.required],  // primary role required
      role2: [''],                       // optional
      role3: ['']                        // optional
    });

    // Load roles dynamically from backend
    this.roleService.getAllRoles().subscribe(res => {
      this.roles = res.list || res;
    });

    // If editing an existing user, patch values
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const id = Number(paramMap.get('id'));
      if (id) {
        this.userId = id;
        this.userService.getById(id).subscribe(user => {
          const roleNames = Array.isArray(user.roles)
            ? user.roles.map((r: any) => typeof r === 'string' ? r : r.roleName)
            : [];

          this.userForm.patchValue({
            username: user.username,
            password: '',
            phoneNumber: user.phoneNumber,
            role1: roleNames[0] || '',
            role2: roleNames[1] || '',
            role3: roleNames[2] || ''
          });
        });
      }
    });
  }

  // Collect form data and combine roles into an array
  private getUserData() {
    const data = this.userForm.value;
    const roles = [data.role1, data.role2, data.role3].filter(r => r); // remove empty
    return {
      username: data.username,
      password: data.password,
      phoneNumber: data.phoneNumber,
      roles: roles
    };
  }

  saveUser() {
    if (this.userForm.invalid || this.isSubmitted) return;
    this.isSubmitted = true;

    const data = this.getUserData();
    const request$ = this.userId
      ? this.userService.updateUser(this.userId, data)
      : this.userService.createUser(data);

    request$.subscribe({
      next: () => {
        this.toastr.success(`User ${this.userId ? 'updated' : 'created'} successfully!`);
        this.isSubmitted = false;
        this.router.navigate(['/user']);
      },
      error: err => {
        const msg = err.error?.message || "Operation failed";
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/user']);
  }
}
