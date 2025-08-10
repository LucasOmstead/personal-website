import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-namecard',
  standalone: true,
  imports: [],
  templateUrl: './namecard.component.html',
  styleUrl: './namecard.component.scss'
})
export class NamecardComponent {
   @Input() name!: string;
   @Input() description!: string;
   @Input() imageURL!: string;
   @Input() detailedDescription!: string;
   
}
