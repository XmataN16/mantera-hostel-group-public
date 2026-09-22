import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private authService = inject(AuthService);

  guestName = signal(this.authService.getGuestName());
  bookings = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    const guestId = this.authService.getGuestId();
    if (!guestId) {
      this.router.navigate(['/']);
      return;
    }
    this.api.getGuestHistory(Number(guestId)).subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      'CONFIRMED': 'success', 'CHECKED_IN': 'info', 'CREATED': 'warning',
      'CANCELLED': 'danger', 'CHECKED_OUT': 'secondary'
    };
    return map[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'CONFIRMED': 'Подтверждено', 'CHECKED_IN': 'Заселен', 'CREATED': 'Создано',
      'CANCELLED': 'Отменено', 'CHECKED_OUT': 'Выселен'
    };
    return map[status] || status;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}