import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const ACCESS_TOKEN: string = 'access_token';
const EMAIL: string = 'email';

interface AuthDetails {
  token: string | null;
  email: string | null;
}

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post('http://localhost:3000/auth/login', {
      email,
      password,
    });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post('http://localhost:3000/auth/register', {
      email,
      password,
    });
  }

  logout(): void{
    localStorage.clear();
  }

  storeAuth(token: string, email: string): void{
    localStorage.setItem(ACCESS_TOKEN, token);
    localStorage.setItem(EMAIL, email);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN);
  }

  getAuthDetails(): AuthDetails{
    return { 
      token: localStorage.getItem(ACCESS_TOKEN), 
      email: localStorage.getItem(EMAIL) 
    };
  }
}
