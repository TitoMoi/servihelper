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

    //Generated files of Windows, Mac and Linux that we want to keep
    if (file === "win-unpacked" || file.match(/.*\.(dmg|AppImage)$/)?.length > 0) {
      console.log("found " + fileDir);

      if (file === "win-unpacked") {
        fs.renameSync(fileDir, path.join(releaseDir + `/servihelper-${package.version}`));
      }
    } else {
      fs.removeSync(fileDir);
      console.log("removed " + fileDir);
    }
  });
});
