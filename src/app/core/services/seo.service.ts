import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  setTitle(pageTitle: string): void {
    const full = `${pageTitle} | Mantera Hotels`;
    this.title.setTitle(full);
    this.meta.updateTag({ property: 'og:title', content: full });
  }

  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
  }

  setTags(title: string, description: string): void {
    this.setTitle(title);
    this.setDescription(description);
  }
}