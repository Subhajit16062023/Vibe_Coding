import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('currentUser');
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  }
}