import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  reservationId = signal('');
  reservationNumber = signal('');

  ngOnInit(): void {
    this.seo.setTags('Бронирование подтверждено', 'Ваше бронирование в Mantera Hotels успешно оформлено');
    this.reservationId.set(this.route.snapshot.paramMap.get('id') || '');
    this.reservationNumber.set(this.route.snapshot.queryParams['number'] || '');
  }
}