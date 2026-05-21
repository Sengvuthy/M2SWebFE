// src/app/services/vision.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VisionService {
  private apiKey = environment.visionApiKey;

  constructor(private http: HttpClient) { }

  recognizeText(base64Image: string, lang: string = 'auto') {
    const hints = lang === 'auto'
      ? ["en", "km", "zh", "ja", "ko", "vi", "my"]
      : [lang];

    const body = {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: 'DOCUMENT_TEXT_DETECTION' },
            { type: 'LOGO_DETECTION' }
          ],
          imageContext: { languageHints: hints }
        }
      ]
    };

    return this.http.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
      body
    );
  }
}
