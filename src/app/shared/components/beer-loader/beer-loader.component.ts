import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-beer-loader',
  standalone: true,
  templateUrl: './beer-loader.component.html',
  styleUrls: ['./beer-loader.component.scss']
})
export class BeerLoaderComponent {
  @Input() isLoading = false;
}
