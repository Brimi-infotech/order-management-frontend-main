

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StaffS } from '../../services/staff-s';
import { ItemsS } from '../../services/items-s';
import { Toast } from '../../services/toast';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-items-form',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './items-form.html',
  styleUrl: './items-form.css'
})
export class ItemsForm {
  private readonly _fb = inject(FormBuilder);
  private readonly _staffS = inject(StaffS);
  private readonly _itemsS = inject(ItemsS);
  private readonly _toast = inject(Toast);
  private readonly _auth = inject(Auth);
  private readonly _router = inject(Router);
  private readonly _activeRoute = inject(ActivatedRoute);

  staffList = signal<any[]>([]);
  itemId = signal<string | null>(null);

  itemsForm = this._fb.group({
    itemcode: ['', Validators.required],
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    const itemId = this._activeRoute.snapshot.queryParamMap.get('id');
    this.itemId.set(itemId);
    if (itemId) {
      this._itemsS.getItemById(itemId).subscribe({
        next: (res) => {
          this.itemsForm.patchValue(res.data);
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error fetching item details: ' + err.error?.message || err.message);
        }
      });
    };
  }

  formSubmit() {
    if (this.itemsForm.invalid) {
      this.itemsForm.markAllAsTouched();
      return;
    }

    const itemId = this.itemId();
    if (itemId) {
      this._itemsS.editItem(itemId, this.itemsForm.value).subscribe({
        next: (res) => {
          this._toast.success('Item updated successfully');
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error updating item: ' + err.error?.message || err.message);
        },
        complete: () => {
          console.log('Update item request completed');
          this._router.navigate(['/oms/items']);
        }
      });
    } else {
      this._itemsS.addItem(this.itemsForm.value).subscribe({
        next: (res) => {
          this._toast.success('Item added successfully');
          this.itemsForm.reset();
          this._router.navigate(['/oms/items']);
        },
        error: (err) => {
          console.error(err);
          this._toast.error('Error adding item: ' + err.error?.message || err.message);
        },
        complete: () => {
          console.log('Add item request completed');
        }
      });
    }
  }

  getPrefix(): string {
    return this.itemId() ? 'Edit' : 'Add';
  }
}
