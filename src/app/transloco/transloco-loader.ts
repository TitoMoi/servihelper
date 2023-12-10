import { APP_CONFIG } from "../../environments/environment"; //Fix relative path
import { Observable } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Translation, TranslocoLoader } from "@ngneat/transloco";

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(
      APP_CONFIG.production
        ? __dirname + `/assets/i18n/${lang}.json`
        : `assets/i18n/${lang}.json`
    );
  }
}
