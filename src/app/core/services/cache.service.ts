import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface CacheItem<T> {
  data: T;
  expiry: number; // Timestamp в миллисекундах
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Сохранить данные в кэш
   * @param key Уникальный ключ
   * @param data Данные
   * @param ttlMs Время жизни в миллисекундах (по умолчанию 1 час)
   */
  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    if (!this.isBrowser) return; // Защита от SSR
    
    try {
      const item: CacheItem<T> = {
        data,
        expiry: Date.now() + ttlMs
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('CacheService: Не удалось сохранить в localStorage', e);
    }
  }

  /**
   * Получить данные из кэша
   * @returns Данные или null, если кэш пуст или протух
   */
  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Проверка на протухание
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (e) {
      localStorage.removeItem(key); // Битый JSON
      return null;
    }
  }

  /**
   * Удалить конкретный ключ
   */
  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  /**
   * Удалить все ключи, начинающиеся с определенного префикса.
   * Идеально для событийного сброса (например, сбросить всю историю гостя).
   */
  removeByPrefix(prefix: string): void {
    if (!this.isBrowser) return;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}