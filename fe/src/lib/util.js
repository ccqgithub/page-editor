export function imageLoad(url, callback) {
  let image = new Image();

  image.onload = () => {
    callback({
      width: image.width,
      height: image.height,
      url: url
    });
    image = null;
  }

  image.src = url;
}
