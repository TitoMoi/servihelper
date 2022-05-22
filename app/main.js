"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs-extra");
var url = require("url");
// Initialize remote module
require("@electron/remote/main").initialize();
var win = null;
var args = process.argv.slice(1), serve = args.some(function (val) { return val === "--serve"; });
function createWindow() {
    var electronScreen = electron_1.screen;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: electronScreen.getPrimaryDisplay().workAreaSize.width,
        height: electronScreen.getPrimaryDisplay().workAreaSize.height,
        titleBarStyle: "default",
        autoHideMenuBar: true,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve ? true : false,
            contextIsolation: false
        }
    });
    require("@electron/remote/main").enable(win.webContents);
    if (serve) {
        win.webContents.openDevTools();
        require("electron-reload")(__dirname, {
            electron: require(path.join(__dirname, "/../node_modules/electron"))
        });
        win.loadURL("http://localhost:4200");
    }
    else {
        // Path when running electron executable
        var pathIndex = "./index.html";
        if (fs.existsSync(path.join(__dirname, "../dist/index.html"))) {
            // Path when running electron in local folder
            pathIndex = "../dist/index.html";
        }
        win.loadURL(url.format({
            pathname: path.join(__dirname, pathIndex),
            protocol: "file:",
            slashes: true
        }));
    }
    // Emitted when the window is closed.
    win.on("closed", function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    return win;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on("ready", function () { return setTimeout(createWindow, 400); });
    // Quit when all windows are closed.
    electron_1.app.on("window-all-closed", function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== "darwin") {
            electron_1.app.quit();
        }
    });
    electron_1.app.on("activate", function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
