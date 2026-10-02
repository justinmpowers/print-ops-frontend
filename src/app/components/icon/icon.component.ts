import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName =
  | 'orders' | 'production' | 'printers' | 'filaments' | 'products' | 'analytics' | 'integrations'
  | 'bell' | 'logout' | 'refresh' | 'chevron-down' | 'edit' | 'trash' | 'plus' | 'alert' | 'send'
  | 'filter' | 'check' | 'play' | 'menu' | 'close' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'external';

/** Small inline stroke icons, so the UI doesn't depend on emoji or an icon font. */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @switch (name) {
        @case ('orders') {
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" />
        }
        @case ('production') {
          <polygon points="12 3 21 8 12 13 3 8" /><polyline points="3 12.5 12 17.5 21 12.5" /><polyline points="3 17 12 22 21 17" />
        }
        @case ('printers') {
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="8" x2="21" y2="8" />
          <polyline points="10 8 10 11 12 13 14 11 14 8" /><line x1="8" y1="17" x2="16" y2="17" />
        }
        @case ('filaments') {
          <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="3" x2="12" y2="9" />
        }
        @case ('products') {
          <path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5" /><line x1="12" y1="13" x2="12" y2="21" />
        }
        @case ('analytics') {
          <line x1="5" y1="20" x2="5" y2="12" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="19" y1="20" x2="19" y2="9" />
        }
        @case ('integrations') {
          <circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><line x1="9" y1="12" x2="15" y2="12" />
        }
        @case ('bell') {
          <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" /><path d="M10 20a2 2 0 0 0 4 0" />
        }
        @case ('logout') {
          <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><polyline points="15 8 19 12 15 16" /><line x1="19" y1="12" x2="9" y2="12" />
        }
        @case ('refresh') {
          <path d="M20 12a8 8 0 1 1-2.34-5.66" /><polyline points="20 3 20 7 16 7" />
        }
        @case ('chevron-down') { <polyline points="6 9 12 15 18 9" /> }
        @case ('edit') { <path d="M4 20h4L19 9l-4-4L4 16z" /><line x1="13" y1="7" x2="17" y2="11" /> }
        @case ('trash') {
          <line x1="4" y1="7" x2="20" y2="7" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" />
        }
        @case ('plus') { <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /> }
        @case ('alert') {
          <path d="M12 4l9 16H3z" /><line x1="12" y1="10" x2="12" y2="14" /><line x1="12" y1="17" x2="12" y2="17.01" />
        }
        @case ('send') { <path d="M4 12l16-8-6 16-3-7z" /> }
        @case ('filter') { <path d="M4 5h16l-6 8v6l-4-2v-4z" /> }
        @case ('check') { <polyline points="5 12 10 17 19 7" /> }
        @case ('play') { <polygon points="7 5 19 12 7 19" /> }
        @case ('menu') {
          <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
        }
        @case ('close') { <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /> }
        @case ('arrow-left') { <line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 6 5 12 11 18" /> }
        @case ('arrow-up') { <line x1="12" y1="19" x2="12" y2="5" /><polyline points="6 11 12 5 18 11" /> }
        @case ('arrow-down') { <line x1="12" y1="5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" /> }
        @case ('external') {
          <path d="M14 5h5v5" /><line x1="19" y1="5" x2="11" y2="13" /><path d="M18 14v5H5V6h5" />
        }
      }
    </svg>
  `,
  styles: [`:host { display: inline-flex; line-height: 0; flex-shrink: 0; }`],
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;
}
