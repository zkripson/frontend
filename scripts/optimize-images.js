import imagemin from "imagemin";
import mozjpeg from "imagemin-mozjpeg";
import pngquant from "imagemin-pngquant";

(async () => {
  await imagemin(["public/images/*.{jpg,png}"], {
    destination: "public/images/",
    plugins: [mozjpeg({ quality: 75 }), pngquant({ quality: [0.6, 0.8] })],
  });
  console.log("✔ Images optimized");
})();
