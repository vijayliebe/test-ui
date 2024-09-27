import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TODOs APP';
  userEmail:any = '';

  constructor(private authService: AuthService){}

  isAuthenticated(){
    this.userEmail = this.authService.getAuthDetails().email;
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
  }
}
