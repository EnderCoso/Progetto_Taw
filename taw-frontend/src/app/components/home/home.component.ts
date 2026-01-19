import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html', // <--- DEVE ESSERE HOME, NON DASHBOARD!
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit { // <--- Assicurati che ci sia 'export class HomeComponent'
  flights: any[] = [];
  
  // Variabili Ricerca
  fromCity = '';
  toCity = '';
  selectedDate = '';

  // Variabili Modale
  showModal = false;
  selectedFlight: any = null;
  availableSeats: any[] = [];
  bookingSeat = '';
  addBag = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadFlights();
  }

  loadFlights() {
    this.api.searchFlights(this.fromCity, this.toCity, this.selectedDate).subscribe({
      next: (data) => this.flights = data,
      error: (err) => console.error(err)
    });
  }

  openBookingModal(flight: any) {
    if (!localStorage.getItem('token')) {
      alert('Devi fare il login per prenotare!');
      this.router.navigate(['/login']);
      return;
    }
    this.selectedFlight = flight;
    // Filtra solo i posti NON occupati
    this.availableSeats = flight.seats.filter((s: any) => !s.isOccupied);
    this.bookingSeat = '';
    this.addBag = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFlight = null;
  }

  confirmBooking() {
    if (!this.bookingSeat) {
      alert('Seleziona un posto!');
      return;
    }

    const bookingData = {
      flightId: this.selectedFlight._id,
      seatNumber: this.bookingSeat,
      extras: { extraBaggage: this.addBag }
    };

    this.api.bookFlight(bookingData).subscribe({
      next: (res) => {
        alert('Prenotazione Confermata! Buon viaggio.');
        this.closeModal();
        this.loadFlights(); 
      },
      error: (err) => {
        alert('Errore: ' + (err.error.message || 'Qualcosa è andato storto'));
      }
    });
  }
}