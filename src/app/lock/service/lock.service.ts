import { Injectable } from "@angular/core";
import { LockInterface } from "app/lock/model/lock.model";
import { ConfigService } from "app/config/service/config.service";
import { readJSONSync, writeJsonSync } from "fs-extra";
import { intervalToDuration } from "date-fns";
import { OnlineService } from "app/online/service/online.service";
import { ipcRenderer } from "electron";

@Injectable({
  providedIn: "root",
})
export class LockService {
  #lock: LockInterface = undefined;

  isOnline = this.onlineService.getOnline().isOnline;

  constructor(private configService: ConfigService, private onlineService: OnlineService) {}

  /**
   * @returns LockInterface
   */
  getLock(): LockInterface {
    if (this.isOnline) {
      try {
        this.#lock = readJSONSync(this.configService.lockPath);
        return this.#lock;
      } catch (e) {
        //This should never happen, prevent a death file
        this.#lock = {
          lock: false,
          timestamp: new Date(),
        };
        this.saveLockToFile();
        return this.#lock;
      }
    }
  }

  /** Set lock to true */
  takeLock() {
    if (this.#lock) {
      this.#lock.lock = true;
      this.saveLockToFile();
    }
  }

  /** Set lock to false */
  releaseLock() {
    if (this.#lock) {
      this.#lock.lock = false;
      this.saveLockToFile();
    }
  }

  updateTimestamp() {
    if (this.#lock) {
      this.#lock.timestamp = new Date();
      this.saveLockToFile();
    }
  }

  takeLockAndTimestamp() {
    this.#lock.lock = true;
    this.#lock.timestamp = new Date();
    this.saveLockToFile();
  }

  /**
   * When the lock remains true, after 20 minuts without timestamp allow the app to take it.
   * If the user is away 10 minuts the lock is released and the app is closed.
   * So, if we encounter a lock true and a timestamp above 20 min we must take the app.
   */
  checkDeathEnd(mins: number): boolean {
    if (
      this.#lock.lock &&
      intervalToDuration({
        start: new Date(this.#lock.timestamp),
        end: new Date(),
      }).minutes > mins
    ) {
      return true;
    }
    return false;
  }

  /**
   * If there is no activity or the network status is offline, the user wont we able to update the timestamp.
   * Then the user will be logged out.
   */
  intervalNoActivity() {
    //900000 millisecons is 15 min
    setInterval(() => {
      const isDeathEnd = this.checkDeathEnd(15);
      if (isDeathEnd) {
        //shared function but we get a circular di injection
        ipcRenderer.send("closeApp");
      }
    }, 900000);
  }

  /* checkTimer(){
    if(this.#lock.timestamp)
  } */

  /** Save the lock only if we are online */
  saveLockToFile() {
    if (this.isOnline) {
      //Make sure the file is saved
      writeJsonSync(this.configService.lockPath, this.#lock);
    }
  }
}
