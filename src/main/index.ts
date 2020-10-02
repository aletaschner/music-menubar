import path from "path";
import url from "url";
import { app, ipcMain } from "electron";
import is from "electron-is";
import { menubar, Menubar } from "menubar";
import { autoUpdater } from "electron-updater";
import open from "open";
import { addContextmenu } from "./menu";

autoUpdater.checkForUpdatesAndNotify();

let mb: Menubar;

app.commandLine.appendSwitch("ignore-certificate-errors");

ipcMain.on("notify", () => {
  mb.tray.setImage(path.resolve(__dirname, "assets/cassette.png"));
});

app.on("ready", () => {
  mb = menubar({
    index: is.dev()
      ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
      : // "http://localhost:8080"
        url.format({
          pathname: path.join(__dirname, "index.html"),
          protocol: "file:",
          slashes: true,
        }),
    icon: path.resolve(__dirname, "assets/cassette.png"),
    tooltip: "menubar",
    browserWindow: {
      //   transparent: true,
      //   resizable: false,
      //   fullscreenable: false,
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    },
    // showOnAllWorkspaces: false,
    // preloadWindow: true,
  });

  mb.on("after-create-window", () => {
    if (is.dev()) {
      mb.window?.webContents.openDevTools({ mode: "undocked" });
    }

    addContextmenu(mb);
  });

  // mb.on("after-show", () => {
  //   mb.tray.setImage(path.resolve(__dirname, "cassette.png"));
  // });
});

// reroute new windows to default browser
function createOpenHandler(_: Electron.Event, contents: Electron.webContents) {
  const anyContents = contents as any;
  anyContents.on("new-window", (e: Electron.NewWindowEvent, url: string) => {
    e.preventDefault();
    open(url);
  });
}

app.on("web-contents-created", createOpenHandler);

app.on("window-all-closed", (event: Event) => {
  app.dock.hide();
  event.preventDefault();
});
