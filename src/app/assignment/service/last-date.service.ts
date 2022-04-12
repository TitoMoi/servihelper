import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LastDateService {
  lastDate: Date;
  constructor() {}

  setLastDate(date: Date) {
    this.lastDate = date;
  }

  getLastDate() {
    return this.lastDate;
  }
}
