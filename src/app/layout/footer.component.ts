import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <strong>Mantera Hotels</strong>
          <p>Сеть отелей на побережье Чёрного моря</p>
        </div>
        <div class="footer-contacts">
          <p>📞 +7 (861) 200-00-01</p>
          <p>✉️ info&#64;mantera-hotel.ru</p>
        </div>
        <div class="footer-copy">
          <p>&copy; 2026 Mantera Group. Все права защищены.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #1a2332;
      color: #90a4ae;
      padding: 2rem 1.5rem;
      margin-top: auto;
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }
    .footer-brand {
      strong { color: #fff; font-size: 1.1rem; }
      p { margin: 0.35rem 0 0; font-size: 0.9rem; }
    }
    .footer-contacts p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }
    .footer-copy p {
      font-size: 0.8rem;
      text-align: right;
    }
    @media (max-width: 640px) {
      .footer-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .footer-copy p { text-align: center; }
    }
  `],
})
export class FooterComponent {}