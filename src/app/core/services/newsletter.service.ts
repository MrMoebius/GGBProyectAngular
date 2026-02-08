import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private storage = inject(LocalStorageService);
  private toast = inject(ToastService);

  subscribe(email: string): boolean {
    const subscribers = this.storage.load<string[]>('newsletter', []);
    if (subscribers.includes(email)) {
      this.toast.show('Ya estas suscrito con este email', 'info');
      return false;
    }
    subscribers.push(email);
    this.storage.save('newsletter', subscribers);
    this.toast.success('Te has suscrito correctamente al newsletter');
    return true;
  }

  isSubscribed(email: string): boolean {
    const subscribers = this.storage.load<string[]>('newsletter', []);
    return subscribers.includes(email);
  }
}
