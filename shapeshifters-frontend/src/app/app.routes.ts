import { Routes } from '@angular/router';
import { ShapeshiftersComponent } from './shapeshifters/shapeshifters.component';

export const routes: Routes = [
  { path: '', component: ShapeshiftersComponent },
  { path: '**', redirectTo: '' }
];
