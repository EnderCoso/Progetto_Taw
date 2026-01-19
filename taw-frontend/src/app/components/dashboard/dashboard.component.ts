import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  aircrafts: any[] = []; // Lista aerei
  
  // Definizione corretta dell'oggetto volo (SENZA 'time', CON orari separati)
  newFlight = {
    flightCode: '',
    aircraftId: '',      
    departureCity: '',
    arrivalCity: '',
    date: '',
    departureTime: '',   // Ora partenza (es. 14:00)
    arrivalTime: '',     // Ora arrivo (es. 16:00)
    priceEconomy: 100,
    priceBusiness: 200,
    priceFirst: 500
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.checkAccess();
    this.loadStats();
    this.loadAircrafts(); 
  }

  checkAccess() {
    const role = localStorage.getItem('role');
    if (role !== 'airline') {
      alert('Accesso negato! Area riservata alle compagnie.');
      this.router.navigate(['/home']);
    }
  }

  loadStats() {
    this.api.getAirlineStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Errore stats:', err)
    });
  }

  loadAircrafts() {
    this.api.getAircrafts().subscribe({
      next: (data) => this.aircrafts = data,
      error: (err) => console.error('Errore aerei:', err)
    });
  }

  createFlight() {
    // NON facciamo più "new Date()" qui.
    // Inviamo i dati grezzi (date, departureTime, arrivalTime) al backend.
    // Il backend si occuperà di unirli.
    
    this.api.createFlight(this.newFlight).subscribe({
      next: (res) => {
        alert('Volo creato con successo! ✈️');
        this.loadStats();
        
        // Reset del form (rimettiamo i valori di default corretti)
        this.newFlight = {
          flightCode: '',
          aircraftId: '',
          departureCity: '',
          arrivalCity: '',
          date: '',
          departureTime: '',
          arrivalTime: '',
          priceEconomy: 100,
          priceBusiness: 200,
          priceFirst: 500
        };
      },
      error: (err) => alert('Errore creazione: ' + (err.error?.message || err.message))
    });
  }
}