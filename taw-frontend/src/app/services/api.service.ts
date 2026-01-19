import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // L'indirizzo del tuo backend
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // --- AIUTANTE: Crea l'intestazione con il Token ---
  // Ogni volta che serve il token (prenotazioni, dashboard), useremo questo metodo
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- AUTH ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  // --- VOLI (Pubblico) ---
  // Cerca voli con filtri opzionali
  searchFlights(from?: string, to?: string, date?: string): Observable<any> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (date) params = params.set('date', date);

    return this.http.get(`${this.baseUrl}/flights`, { params });
  }

  // --- PRENOTAZIONI (Solo Passeggeri) ---
  bookFlight(bookingData: any): Observable<any> {
    // Nota: Passiamo { headers: this.getHeaders() } per dimostrare che siamo loggati
    return this.http.post(`${this.baseUrl}/bookings`, bookingData, { headers: this.getHeaders() });
  }

  getMyTickets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings/my-tickets`, { headers: this.getHeaders() });
  }

  // --- DASHBOARD (Solo Compagnie) ---
  createFlight(flightData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/flights`, flightData, { headers: this.getHeaders() });
  }

  getAirlineStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/flights/stats`, { headers: this.getHeaders() });
  }

  addAircraft(aircraftData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/aircrafts`, aircraftData, { headers });
  }

  // Ottieni lista aerei (utile per debug o liste)
  getAircrafts(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/aircrafts`, { headers });
  }
}