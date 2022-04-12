import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { Subject } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";

@Injectable()
export class MyCustomPaginatorI18 implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = this.translocoService.translate(
    "PAGINATOR_FIRST_PAGE_LABEL"
  );
  itemsPerPageLabel = this.translocoService.translate(
    "PAGINATOR_ITEMS_PER_PAGE_LABEL"
  );
  lastPageLabel = this.translocoService.translate("PAGINATOR_LAST_PAGE_LABEL");
  nextPageLabel = this.translocoService.translate("PAGINATOR_NEXT_PAGE_LABEL");
  previousPageLabel = this.translocoService.translate(
    "PAGINATOR_PREVIOUS_PAGE_LABEL"
  );

  constructor(private translocoService: TranslocoService) {
    translocoService.langChanges$.subscribe((lang) => {
      //ensure file is loaded before translate
      translocoService.load(lang).subscribe((loaded) => {
        this.firstPageLabel = translocoService.translate(
          "PAGINATOR_FIRST_PAGE_LABEL"
        );
        this.itemsPerPageLabel = translocoService.translate(
          "PAGINATOR_ITEMS_PER_PAGE_LABEL"
        );
        this.lastPageLabel = translocoService.translate(
          "PAGINATOR_LAST_PAGE_LABEL"
        );
        this.nextPageLabel = translocoService.translate(
          "PAGINATOR_NEXT_PAGE_LABEL"
        );
        this.previousPageLabel = translocoService.translate(
          "PAGINATOR_PREVIOUS_PAGE_LABEL"
        );
        this.changes.next();
      });
    });
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.translocoService.translate(
        "PAGINATOR_PAGE_1_OF_1",
        null,
        this.translocoService.getActiveLang()
      );
    }
    const amountPages = Math.ceil(length / pageSize);
    return `${this.translocoService.translate("PAGINATOR_PAGE")} ${
      page + 1
    } ${this.translocoService.translate("PAGINATOR_OF")} ${amountPages}`;
  }
}
