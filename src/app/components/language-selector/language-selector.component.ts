//src/app/components/language-selector.component.ts
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: false,
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
})
export class LanguageSelectorComponent {

  constructor(private translate: TranslateService) {}

  chooseLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('appLang', lang);
    window.location.reload(); // reload so app starts in chosen language
  }
}
