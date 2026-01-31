import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-form',
  standalone: false,
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  form!: FormGroup;
  originalId: number | null = null;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.originalId = idParam ? +idParam : null;

    if (this.originalId) {
      this.loadCategory(this.originalId);
    }
  }

  loadCategory(id: number) {
    this.categoryService.getCategoryById(id).subscribe({
      next: (res: any) => {
        this.form.patchValue({
          name: res.name
        });
      },
      error: () => {
        this.toastr.error("Category not found", "Error");
        this.router.navigate(['/category']);
      }
    });
  }

  save() {
    if (this.form.invalid || this.isSubmitted) return;

    this.isSubmitted = true;

    const data = {
      name: this.form.value.name.trim()
    };

    if (this.originalId) {
      this.updateCategory(data);
    } else {
      this.createCategory(data);
    }
  }

  private createCategory(data: any) {
    this.categoryService.createCategory(data).subscribe({
      next: () => {
        this.toastr.success("Category created successfully");
        this.router.navigate(['/category']);
      },
      error: err => {
        const msg = err.error?.message || "Create failed";
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  private updateCategory(data: any) {
    this.categoryService.updateCategory(this.originalId!, data).subscribe({
      next: () => {
        this.toastr.success("Category updated successfully");
        this.router.navigate(['/category']);
      },
      error: err => {
        const msg = err.error?.message || "Update failed";
        this.toastr.error(msg);
        this.isSubmitted = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/category']);
  }
}
