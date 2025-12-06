import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ItemsS } from '../../services/items-s';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-items',
  imports: [RouterModule],
  templateUrl: './items.html',
  styleUrl: './items.css'
})
export class Items {
  private readonly _router = inject(Router);
  private readonly _itemsS = inject(ItemsS);
  private readonly _toast = inject(Toast);

  items = signal<any[]>([]);

  ngOnInit(): void {
    this.getItems();
  }

  getItems() {
    this._itemsS.getItems().subscribe({
      next: (res) => {
        this.items.set(res.data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  editItem(itemId: string) {
    this._router.navigate([`/oms/items-form`], {
      queryParams: { id: itemId }
    });
  }

  deleteItem(itemId: string) {
    this._itemsS.deleteItem(itemId).subscribe({
      next: (res) => {
        this._toast.success('Item deleted successfully');
        this.getItems();
      },
      error: (err) => {
        this._toast.error('Error deleting item');
        console.error('Error deleting item:', err);
      }
    });
  }

  addItem() {
    this._router.navigate(['/oms/items-form']);
  }
}
