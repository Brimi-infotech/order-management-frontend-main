import { Directive, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appToggleSidebar]',
  host: {
    '(click)': 'onClick()'
  }
})
export class ToggleSidebar {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  onClick() {
    const body = document.querySelector('body');
    body?.classList.toggle('toggle-sidebar');
    this.sidebarToggled.emit(body?.classList.contains('toggle-sidebar'));
  }
}
