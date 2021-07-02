import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  getDecodedToken() {
    return jwt_decode(localStorage.getItem('auth_token'))['data'];
  }

  deleteToken() {
    localStorage.removeItem('auth_token');
  }

  isExpiredToken() {
    return jwt_decode(localStorage.getItem('auth_token'))['exp'] < new Date().getTime() + 1 ? false : true;
  }
}
