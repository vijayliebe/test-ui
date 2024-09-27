import { Injectable, Inject, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AuthGuardService {

    constructor(@Inject(DOCUMENT) private document: HTMLDocument,
                private authService: AuthService,
                private zone: NgZone,
                private router: Router) { }

    canActivate(): boolean | void {
         const isAuthenticated = this.authService.isAuthenticated();
         const isAuthPage = window.location.pathname.includes('auth');
         if(isAuthenticated && isAuthPage){
          this.redirectTodo();
          return false;
         } else {
           return true; 
         }
    }

    redirectTodo() {
      window.location.pathname = '/';
    }

}
