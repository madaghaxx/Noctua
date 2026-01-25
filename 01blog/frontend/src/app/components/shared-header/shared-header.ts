import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './shared-header.html',
  styleUrl: './shared-header.scss',
})
export class SharedHeaderComponent {}
