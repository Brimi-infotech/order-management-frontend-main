import {
  Directive,
  HostListener,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appEnterNav]',
})
export class EnterNavDirective implements OnInit, OnDestroy, AfterViewInit {
  private modalObserver: MutationObserver | null = null;
  private modalTriggerElement: HTMLElement | null = null;
  private boundClickHandler: ((event: Event) => void) | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.setupModalObserver();
    this.setupModalShowListener();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusFirstElement();
    }, 100);
  }

  ngOnDestroy() {
    if (this.modalObserver) {
      this.modalObserver.disconnect();
    }
    if (this.boundClickHandler) {
      document.removeEventListener('shown.bs.modal', this.boundClickHandler);
    }
  }

  private focusFirstElement() {
    const container = this.el.nativeElement as HTMLElement;

    const isInModal = container.closest('.modal');
    if (isInModal) {
      return;
    }

    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement.focus();

      if (this.shouldAutoClick(firstElement)) {
        firstElement.click();
      }
    }
  }

  private setupModalShowListener() {
    this.boundClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains('modal')) {
        setTimeout(() => {
          this.focusFirstModalField(target);
        }, 100);
      }
    };

    document.addEventListener('shown.bs.modal', this.boundClickHandler);
  }

  @HostListener('keydown', ['$event'])
  onEnterKey(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }

    const target = event.target as HTMLElement;

    event.preventDefault();

    if (
      (target.tagName === 'BUTTON' || target.tagName === 'INPUT') &&
      target.getAttribute('data-bs-toggle') === 'modal'
    ) {
      this.modalTriggerElement = target;
      target.click();
      return;
    }

    const dataBsDismiss = target.getAttribute('data-bs-dismiss');
    if (dataBsDismiss === 'modal') {
      target.click();

      setTimeout(() => {
        this.focusNextAfterModalClose();
      }, 300);
      return;
    }

    const modal = target.closest('.modal.show');
    if (modal) {
      this.focusNextElement(modal as HTMLElement);
    } else {
      this.focusNextElement();
    }
  }

  private setupModalObserver() {
    this.modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList?.contains('modal')) {
              this.observeModal(node);
            }
          });
        }

        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;

          if (target.classList.contains('modal') && !target.classList.contains('show')) {
            setTimeout(() => {
              if (!document.querySelector('.modal.show')) {
                this.focusNextAfterModalClose();
              }
            }, 300);
          }
        }
      });
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => {
      this.observeModal(modal as HTMLElement);
    });

    this.modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private observeModal(modal: HTMLElement) {
    if (!this.modalObserver) return;

    this.modalObserver.observe(modal, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private focusFirstModalField(modal?: HTMLElement) {
    const modalElement = modal || document.querySelector('.modal.show');
    if (!modalElement) return;

    const modalBody = modalElement.querySelector('.modal-body');
    const searchRoot = modalBody || modalElement;

    const focusableElements = this.getFocusableElements(searchRoot as HTMLElement);

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;

      setTimeout(() => {
        firstElement.focus();

        if (this.shouldAutoClick(firstElement)) {
          firstElement.click();
        }
      }, 50);
    }
  }

  private focusNextAfterModalClose() {
    if (this.modalTriggerElement) {
      const focusableElements = this.getFocusableElements(document);
      const triggerIndex = focusableElements.findIndex((el) => el === this.modalTriggerElement);

      if (triggerIndex !== -1 && triggerIndex + 1 < focusableElements.length) {
        const nextElement = focusableElements[triggerIndex + 1] as HTMLElement;

        setTimeout(() => {
          nextElement.focus();

          if (this.shouldAutoClick(nextElement)) {
            nextElement.click();
          }
        }, 50);
      }

      this.modalTriggerElement = null;
    }
  }

  private focusNextElement(container?: HTMLElement) {
    let root: HTMLElement | Document = container || document;
    let isInModal = false;

    if (container && container.classList.contains('modal')) {
      root = container;
      isInModal = true;
    }

    const focusableElements = this.getFocusableElements(root);
    const currentIndex = focusableElements.findIndex((el) => el === document.activeElement);

    if (currentIndex === -1) {
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < focusableElements.length) {
      const nextElement = focusableElements[nextIndex] as HTMLElement;
      nextElement.focus();

      if (this.shouldAutoClick(nextElement)) {
        nextElement.click();
      }
    } else {
      if (isInModal && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }

  private getFocusableElements(root: HTMLElement | Document): Element[] {
    const selector = [
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = Array.from(root.querySelectorAll(selector));

    return elements.filter((el) => {
      const htmlEl = el as HTMLElement;

      if (htmlEl.hasAttribute('data-enter-skip')) {
        return false;
      }

      const rect = htmlEl.getBoundingClientRect();
      const style = window.getComputedStyle(htmlEl);

      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0;

      if (!isVisible) return false;

      let parent = htmlEl.parentElement;
      while (parent && parent !== document.body) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
          return false;
        }
        parent = parent.parentElement;
      }

      return true;
    });
  }

  private shouldAutoClick(element: HTMLElement): boolean {
    const tagName = element.tagName;
    const type = element.getAttribute('type');

    if (element.hasAttribute('data-enter-no-click')) {
      return false;
    }

    if (tagName === 'BUTTON') {
      const dataBsDismiss = element.getAttribute('data-bs-dismiss');
      const dataBsToggle = element.getAttribute('data-bs-toggle');
      const classList = element.classList;

      if (dataBsToggle) {
        return false;
      }

      if (classList.contains('btn-close') || classList.contains('close')) {
        return false;
      }

      if (type === 'submit') {
        return false;
      }

      if (dataBsDismiss === 'modal') {
        return false;
      }

      const isInModalHeader = element.closest('.modal-header') !== null;
      if (isInModalHeader) {
        return false;
      }

      const isInModalFooter = element.closest('.modal-footer') !== null;
      if (isInModalFooter) {
        if (dataBsDismiss) {
          return false;
        }
        return true;
      }

      return true;
    }

    if (tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
      return true;
    }

    return false;
  }
}
