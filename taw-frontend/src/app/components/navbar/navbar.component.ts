import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // <--- Importiamo i moduli di routing

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], // <--- Aggiungiamoli all'inventario
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // Per ora non c'è logica, aggiungeremo il logout più avanti
}