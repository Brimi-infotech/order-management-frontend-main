import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StaffS } from '../../services/staff-s';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-staff',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './staff.html',
  styleUrl: './staff.css'
})
export class Staff {
  private readonly _router = inject(Router);
  private readonly _staffS = inject(StaffS);
  private readonly _toast = inject(Toast);

  staffs = signal<any[]>([]);

  ngOnInit(): void {
    this.getStaffs();
  }

  getStaffs() {
    this._staffS.getStaffs().subscribe({
      next: (res) => {
        this.staffs.set(res.data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  editStaff(staffId: string) {
    this._router.navigate([`/oms/staff-form`], {
      queryParams: { id: staffId }
    });
  }

  deleteStaff(staffId: string) {
    this._staffS.deleteStaff(staffId).subscribe({
      next: (res) => {
        this._toast.success('Staff deleted successfully');
        this.getStaffs();
      },
      error: (err) => {
        this._toast.error('Error deleting staff');
        console.error('Error deleting staff:', err);
      }
    });
  }

  addStaff() {
    this._router.navigate(['/oms/staff-form']);
  }
}
