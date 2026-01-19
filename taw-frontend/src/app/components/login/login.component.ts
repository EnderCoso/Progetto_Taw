import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Serve per *ngIf
import { FormsModule } from '@angular/forms';   // Serve per i form
import { Router } from '@angular/router';       // Serve per cambiare pagina
import { ApiService } from '../../services/api.service'; // Il nostro telefono

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- IMPORTANTE: Importa questi moduli
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  onLogin() {
    // 1. Prepara i dati
    const credentials = { email: this.email, password: this.password };
    
    // 2. Chiama il backend
    this.api.login(credentials).subscribe({
      next: (res) => {
        console.log('Login riuscito!', res);
        
        // 3. Salva il token nel browser
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);

        // 4. Reindirizza in base al ruolo
        if (res.role === 'airline') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Errore login:', err);
        this.errorMessage = 'Email o password errati.';
      }
    });
  }
}