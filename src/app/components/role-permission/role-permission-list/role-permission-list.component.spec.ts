import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePermissionListComponent } from './role-permission-list.component';

describe('RolePermissionListComponent', () => {
  let component: RolePermissionListComponent;
  let fixture: ComponentFixture<RolePermissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolePermissionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolePermissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
