import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from './core/services/language.service';
import { LoaderComponent } from "./layout/dashboard-layout/components/loader/loader.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule, LoaderComponent], // إضافة TranslateModule هنا
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'clean-tech';
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}
}
