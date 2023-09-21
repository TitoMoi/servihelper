import { Injectable } from "@angular/core";
import { OnlineInterface } from "app/online/model/online.model";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJson } from "fs-extra";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class OnlineService {
  private onlineSubject$: BehaviorSubject<OnlineInterface> = new BehaviorSubject(undefined);
  /**
   * Like the private inner config object but public and observable
   */
  online$: Observable<OnlineInterface> = this.onlineSubject$.asObservable();

  #online: OnlineInterface;
  constructor(private configService: ConfigService) {}

  /**
   *
   * @returns RoomInterface[] the array of rooms
   */
  getOnline(): OnlineInterface {
    this.#online = readJSONSync(this.configService.onlinePath);
    this.onlineSubject$.next(this.#online);
    return this.#online;
  }

  /**
   *
   * @param online the object to replace
   * @returns true if online is updated and saved false otherwise
   */
  updateOnline(online: OnlineInterface): boolean {
    //update room
    this.#online = online;
    this.onlineSubject$.next(online);
    return this.saveOnlineToFile();
  }

  /**
   *
   * @returns true if rooms are saved to disk or false
   */
  saveOnlineToFile(): boolean {
    //Write rooms back to file
    writeJson(this.configService.onlinePath, this.#online);
    return true;
  }
}
