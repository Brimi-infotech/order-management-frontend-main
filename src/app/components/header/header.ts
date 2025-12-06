import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToggleSidebar } from '../../directives/toggle-sidebar';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterModule, ToggleSidebar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly _router = inject(Router);
  private readonly _authService = inject(Auth);

  isSidebarOpen = signal(false);
  user = signal<any>(null);

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this._router.navigate(['/login']);
  }

  ngOnInit(): void {
    const user = this._authService.getUser();
    this.user.set(user);
  }

  onSidebarToggle(open: boolean) {
    this.isSidebarOpen.set(open);
  }
}
