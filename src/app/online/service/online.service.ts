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
  /**Like the private online object but public and observable */
  online$: Observable<OnlineInterface> = this.onlineSubject$.asObservable();

  #online: OnlineInterface;

  constructor(private configService: ConfigService) {}

  /**
   *
   * @returns OnlineInterface
   */
  getOnline(): OnlineInterface {
    this.#online = readJSONSync(this.configService.onlinePath);
    this.onlineSubject$.next(this.#online);
    return this.#online;
  }

  /**
   * @param online the object to replace
   */
  updateOnline(online: OnlineInterface) {
    //update online
    this.#online = online;
    this.onlineSubject$.next(online);
    this.saveOnlineToFile();
  }

  saveOnlineToFile() {
    //Write rooms back to file
    writeJson(this.configService.onlinePath, this.#online);
  }
}
