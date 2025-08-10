import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faq-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-card.component.html',
  styleUrl: './faq-card.component.scss'
})
export class FaqCardComponent {
  @Input() question: string = '';
  @Input() answer: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  get renderedAnswer(): SafeHtml {
    if (!this.answer) return '';
    
    // Configure marked options for security and styling
    marked.setOptions({
      breaks: true,
      gfm: true
    });
    
    const html = marked.parse(this.answer);
    return this.sanitizer.bypassSecurityTrustHtml(html as string);
  }
}
