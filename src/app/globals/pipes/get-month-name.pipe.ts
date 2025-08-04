import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getMonthNamePipe'
})
export class GetMonthNamePipe implements PipeTransform {
  transform(date: Date, lang: string): string {
    const formatter = new Intl.DateTimeFormat(lang, { month: 'long' });
    return formatter.format(date);
  }
}
