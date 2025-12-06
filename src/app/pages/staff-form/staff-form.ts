import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StaffS } from '../../services/staff-s';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-staff-form',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.css'
})
export class StaffForm {
  private readonly _fb = inject(FormBuilder);
  private readonly _staffS = inject(StaffS);
  private readonly _toast = inject(Toast);
  private readonly _router = inject(Router);
  private readonly _activeRoute = inject(ActivatedRoute);

  staffId = signal<string | null>(null);

  ngOnInit(): void {
    const staffId = this._activeRoute.snapshot.queryParamMap.get('id');
    this.staffId.set(staffId);
    if (staffId) {
      this._staffS.getStaffById(staffId).subscribe({
        next: (res) => {
          this.staffForm.patchValue(res.data);
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error fetching staff details: ' + err.error.message);
        }
      });
    }
  }

  staffForm = this._fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    userCode: ['', Validators.required]
  });

  formSubmit() {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const staffId = this.staffId();
    if (staffId) {
      this._staffS.editStaff(staffId, this.staffForm.value).subscribe({
        next: (res) => {
          this._toast.success('Staff updated successfully');
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error updating staff: ' + err.error.message);
        },
        complete: () => {
          this._router.navigate(['/oms/staff']);
        }
      });
    } else {
      this._staffS.addStaff(this.staffForm.value).subscribe({
        next: (res) => {
          this._toast.success('Staff added successfully');
          this.staffForm.reset();
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error adding staff: ' + err.error.message);
        },
        complete: () => {
          this._router.navigate(['/oms/staff']);
        }
      });
    }
  }

  getPrefix(): string {
    return this.staffId() ? 'Edit' : 'Add';
  }
}
