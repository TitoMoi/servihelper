/* eslint-disable complexity */
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
  lockObj: LockInterface = undefined;

  isOnline = this.onlineService.getOnline().isOnline;

  constructor(
    private configService: ConfigService,
    private onlineService: OnlineService,
  ) {}

  /**
   * @returns LockInterface
   */
  initGetLock(): LockInterface {
    if (this.isOnline) {
      try {
        this.lockObj = readJSONSync(this.configService.lockPath);
        return this.lockObj;
      } catch (e) {
        //This should never happen, prevent a death file
        this.lockObj = {
          lock: false,
          timestamp: new Date(),
        };
        this.saveLockToFile();
        return this.lockObj;
      }
    }
  }

  /** Set lock to true */
  takeLock() {
    if (this.lockObj) {
      this.lockObj.lock = true;
      this.saveLockToFile();
    }
  }

  /** Set lock to false */
  releaseLock() {
    if (this.lockObj) {
      this.lockObj.lock = false;
      this.saveLockToFile();
    }
  }

  updateTimestamp() {
    if (this.lockObj) {
      this.lockObj.timestamp = new Date();
      this.saveLockToFile();
    }
  }

  takeLockAndTimestamp() {
    this.lockObj.lock = true;
    this.lockObj.timestamp = new Date();
    this.saveLockToFile();
  }

  /**
   * When the lock remains true, after 'mins' without timestamp allow the app to take it.
   * So, if we encounter a lock true and a timestamp above 'mins' we must take the app.
   */
  checkIdleAdmin(mins: number): boolean {
    if (this.lockObj.lock) {
      const { years, days, months, hours, minutes } = intervalToDuration({
        start: new Date(this.lockObj.timestamp),
        end: new Date(),
      });
      if (years || days || months || hours) {
        return true;
      }
      if (minutes > mins) {
        return true;
      }
      return false;
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
      const isDeathEnd = this.checkIdleAdmin(15);
      if (isDeathEnd) {
        //shared function but we get a circular di injection
        ipcRenderer.send("closeApp");
      }
    }, 900000);
  }

  /** Save the lock only if we are online */
  saveLockToFile() {
    if (this.isOnline) {
      //Make sure the file is saved
      writeJsonSync(this.configService.lockPath, this.lockObj);
    }
  }
}
