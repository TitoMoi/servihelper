const fs = require("fs-extra");
const path = require("path");
const package = fs.readJsonSync("./package.json");

const releaseDir = "./release";

fs.readdir(releaseDir, (err, files) => {
  if (err) {
    console.error(err);
  }

  files.forEach((file) => {
    const fileDir = path.join(releaseDir, file);

    //The folder of Windows and Linux, and the file (binary) of Mac
    if (
      file === "win-unpacked" ||
      file === `linux-unpacked` ||
      file === `servihelper-${package.version}-universal.dmg`
    ) {
      console.log("found " + fileDir);

      //Elegant name
      if (file === "win-unpacked" || file === "linux-unpacked") {
        fs.renameSync(fileDir, path.join(releaseDir + `/servihelper-${package.version}`));
      }
    } else {
      fs.removeSync(fileDir);
      console.log("removed " + fileDir);
    }
  });
});
