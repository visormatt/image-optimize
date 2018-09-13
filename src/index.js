// Vendor
import chalk from 'chalk';
import fs from 'fs';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import Jimp from 'jimp';

// Internal
import { IMAGE_EXTENSIONS, SIZE_ARRAY } from './settings';

const optimizeImages = async (path) => {
  const files = await imagemin([`${path}*.{jpg,png}`], 'images/optmized', {
    plugins: [
      imageminJpegtran({
        // progressive: true
      }),

      imageminPngquant({
        quality: '80-100'
      })
    ]
  });
};

const resizeImage = (path, file) => {
  const fileCopy = `${file}`;
  const parts = fileCopy.split('.');
  const name = parts[0];
  const type = parts[1];
  let imgSource;

  Jimp.read(`${path}${file}`)
    .then((image) => {
      imgSource = image.clone();
      image.write(`${path}resized/${name}.${type}`);
      return imgSource;
    })
    .then((image) => {
      SIZE_ARRAY.map(({ ext, quality, width }) => {
        const filename = `${name}_${ext}.${type}`;
        imgSource = image.clone();

        // Only scale down, if the dimensions requested are large, leave it as it is
        if (image.bitmap.width <= width) {
          const notice = `should not be scaled to ${width}px from ${image.bitmap.width}px`;
          image.write(`${path}resized/${filename}`);

          console.log('⚠️ ', chalk.redBright(filename), notice);
        } else {
          const notice = `scaled to ${width}px.`;
          image.resize(width, Jimp.AUTO)
            .quality(quality)
            .write(`${path}resized/${filename}`);

          console.log('✅', chalk.greenBright(filename), notice);
        }

        return imgSource;
      })
    })
    .then(() => {
      optimizeImages(`${path}resized/`);
    })
    .catch((error) => {
      console.log('-> ERROR <-', error);
    });
};

/**
 * [extensions description]
 * @type {Array}
 */
fs.readdir('./images', (err, items) => {
  const path = 'images/';

  const images = items.filter((file) => {
    const parts = file.split('.');
    const ext = parts.pop();

    return IMAGE_EXTENSIONS.includes(ext);
  })

  images.map((file) => {
    resizeImage(path, file);
  })
});
