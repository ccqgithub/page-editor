import $ from 'jquery';
import {imageLoad} from './util.js';

export default function ossUploader(dialog) {
  let xhr, image, meta, xhrProgress, xhrComplete;

  dialog
    .addEventListener('imageuploader.mount', function() {
      dialog.busy(true);
      $.ajax({
        url: '/api/upload/meta',
        type: 'get',
        data: {}
      }).done((data) => {
        if (data.status != 200) {
          alert(data.message);
          return;
        }
        meta = data.result;
        dialog.busy(false);
      }).fail((error) => {
        alert('error');
        dialog.busy(false);
      });
    });


  dialog
    .addEventListener('imageuploader.cancelupload', function() {
      // Cancel the current upload

      // Stop the upload
      if (xhr) {
        xhr
          .upload
          .removeEventListener('progress', xhrProgress);
        xhr.removeEventListener('readystatechange', xhrComplete);
        xhr.abort();
      }

      // Set the dialog to empty
      dialog.state('empty');
    });

  dialog.addEventListener('imageuploader.clear', function() {
    // Clear the current image
    dialog.clear();
    image = null;
  });

  dialog.addEventListener('imageuploader.fileready', function(ev) {

    // Upload a file to the server
    let formData;
    let file = ev
      .detail()
      .file;

    // Define functions to handle upload progress and completion
    xhrProgress = function(ev) {
      // Set the progress for the upload
      dialog.progress((ev.loaded / ev.total) * 100);
    }

    xhrComplete = function(ev) {
      var response;

      // Check the request is complete
      if (ev.target.readyState != 4) {
        return;
      }

      // Clear the request
      xhr = null
      xhrProgress = null
      xhrComplete = null

      // Handle the result of the upload
      if (parseInt(ev.target.status) >= 200) {
        let $doc= $($.parseXML(ev.target.responseText));
        let location = $doc.find('Location').text();

        if (!location) {
          alert('上传失败!');
          return;
        }

        imageLoad(location, (data) => {
          // Store the image details
          image = {
            originUrl: location,
            url: location,
            width: data.width,
            height: data.height,
            rotate: 0,
          };

          // Populate the dialog
          dialog.populate(image.url, [image.width, image.height]);
        });

      } else {
        // The request failed, notify the user
        new ContentTools.FlashUI('no');
      }
    }

    // Set the dialog state to uploading and reset the progress bar to 0
    dialog.state('uploading');
    dialog.progress(0);

    // Build the form data to post to the server
    formData = new FormData();

    let ext = file.ext || 'jpg';
    let filename = 'page-editor' + (new Date()
      .getTime()
      .toString() + '-' + Math.floor(Math.random() * 1000) + '.' + ext);

    formData.append('key', filename);
    Object.keys(meta).forEach(key => {
      formData.append(key, meta[key]);
    });
    formData.append('file', file);

    // Make the request
    xhr = new XMLHttpRequest();
    xhr
      .upload
      .addEventListener('progress', xhrProgress);
    xhr.addEventListener('readystatechange', xhrComplete);
    xhr.open('POST', meta.bucketUrl, true);
    xhr.send(formData);
  });

  function rotateImage(direction) {
    if (direction == 'CCW') {
      image.rotate -= 90;
    } else {
      image.rotate += 90;
    }

    if (image.rotate < 0) {
      image.rotate += 360;
    }

    if (image.rotate > 360) {
      image.rotate -= 360;
    }

    dialog.busy(true);
    image.url = `${image.originUrl}?x-oss-process=image/rotate,${image.rotate}`;
    imageLoad(image.url, (data) => {
      image.width = data.width;
      image.height = data.height;
      dialog.populate(image.url, [image.width, image.height]);
      dialog.busy(false);
    });
  }

  dialog
    .addEventListener('imageuploader.rotateccw', function() {
      rotateImage('CCW');
    });

  dialog.addEventListener('imageuploader.rotatecw', function() {
    rotateImage('CW');
  });

  dialog.addEventListener('imageuploader.save', function() {
    let cropRegion = dialog.cropRegion();
    let nw = image.width;
    let nh = image.height;

    if (cropRegion) {
      let x = parseInt(cropRegion[0] * image.width);
      let y = parseInt(cropRegion[1] * image.height);
      let w = parseInt(cropRegion[2] * image.width);
      let h = parseInt(cropRegion[3] * image.height);

      if (image.url.indexOf('x-oss-process') == -1) {
        image.url += `?x-oss-process=image/crop,x_${x},y_${y},w_${w},h_${h}`;
      } else {
        image.url += `,image/crop,x_${x},y_${y},w_${w},h_${h}`;
      }

      nw = w;
      nh = h;
    }

    dialog.save(
      image.url,
      [200, parseInt(200 * nh / nw)],
      {
        'alt': '222',
        'data-ce-max-width': nw,
      }
    );
  });
}
