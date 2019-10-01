// Vendor
import chalk from "chalk";
import fs from "fs";
import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminWebp from "imagemin-webp";
import imageminZopfli from "imagemin-zopfli";
import Jimp from "jimp";

// Internal
import { IMAGE_EXTENSIONS, IMAGE_SIZES } from "./settings";

const optimizeImages = async path => {
  await imagemin([`${path}*.{jpg,png}`], "images/optimized", {
    plugins: [
      // imageminJpegtran({
      //   progressive: true
      // }),

      // imageminPngquant({
      //   quality: '65-80'
      // }),

      // https://goo.gl/uFNzki
      imageminMozjpeg({
        progressive: true
      }),

      // https://goo.gl/TTTM5p
      imageminZopfli({
        more: true
      })
    ]
  });

  await imagemin([`${path}*.{jpg,png}`], "images/webp", {
    plugins: [
      // https://goo.gl/BrLs8W
      imageminWebp({
        quality: 80
      })
    ]
  });
};

const resizeImage = (path, file) => {
  const fileCopy = `${file}`;
  const parts = fileCopy.split(".");
  const name = parts[0];
  const type = parts[1];
  let imgSource;

  Jimp.read(`${path}${file}`)
    .then(image => {
      imgSource = image.clone();
      image.write(`${path}resized/${name}.${type}`);
      return imgSource;
    })
    .then(image => {
      IMAGE_SIZES.map(({ ext, quality, width }) => {
        const filename = `${name}_${ext}.${type}`;
        imgSource = image.clone();

        // Only scale down, if the dimensions requested are large, leave it as it is
        if (image.bitmap.width <= width) {
          const notice = `should not be scaled to ${width}px from ${
            image.bitmap.width
          }px`;
          image.write(`${path}resized/${filename}`);

          console.log("⚠️ ", chalk.redBright(filename), notice);
        } else {
          const notice = `scaled to ${width}px.`;
          image
            .resize(width, Jimp.AUTO)
            // .quality(quality)
            .write(`${path}resized/${filename}`);

          console.log("✅", chalk.greenBright(filename), notice);
        }

        return imgSource;
      });
    })
    .then(() => {
      optimizeImages(`${path}resized/`);
    })
    .catch(error => {
      console.log("-> ERROR <-", error);
    });
};

/**
 * [extensions description]
 * @type {Array}
 */
fs.readdir("./images", (err, items) => {
  const path = "images/";

  const images = items.filter(file => {
    const parts = file.split(".");
    const ext = parts.pop();

    return IMAGE_EXTENSIONS.includes(ext);
  });

  images.map(file => {
    resizeImage(path, file);
  });
});
