
module.exports = function(options) {

  var fs = require('fs');
  var path = require('path');
  var request = require('request');
  var inputDir = path.join(__dirname, '../../dist');
  var uploadQueue = [];

  function uploadFiles(dir, urlPath) {
    fs.readdir(dir, function(err, list) {

      list.forEach(function(file) {
        var url = urlPath + '/' + file

        if (url.indexOf('/test/') > -1 || url.indexOf('/ionic-site/') > -1 || url.indexOf('/docs/') > -1) return;

        fs.stat(dir + '/' + file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            uploadFiles(dir + '/' + file, urlPath + '/' + file);
          } else {
            uploadFile(url, dir + '/' + file);
          }
        });

      });

    });

    setTimeout(postNextUpload, 100);
  }

  function uploadFile(archiveFileUrlPath, archiveFileLocalPath) {
    uploadQueue.push({
      url_path: archiveFileUrlPath,
      local_path: archiveFileLocalPath,
      group_id: options.groupId,
      app_id: options.appId,
      test_id: options.testId,
      access_key: process.env.IONIC_SNAPSHOT_KEY
    });
  }

  function postNextUpload() {
    var uploadData = null;

    var totalUploading = 0;

    for (var i = 0; i < uploadQueue.length; i++) {
      if (uploadQueue[i].status === 'uploaded') {
        continue;

      } else if (uploadQueue[i].status === 'uploading') {
        totalUploading++;
        continue;

      } else {
        uploadData = uploadQueue[i];
      }
    }

    if (!uploadData || totalUploading > 20) {
      return;

    } else if (options.verbose) {
      console.log('Uploading: ' + uploadData.url_path);
    }

    uploadData.status = 'uploading';

    request.post({
        uri: 'http://' + options.domain + '/e2e/upload-url',
        formData: uploadData
      },
      function(err, httpResponse, body) {
        if (err) {
          uploadData.status = 'failed';
          console.error('Get upload failed:', err);

        } else {
          if (httpResponse.statusCode == 200) {
            uploadE2E(body, uploadData);
          } else {
            console.error('Get upload error:', httpResponse.statusCode, body);
          }
        }
      }
    );
  }

  function uploadE2E(uploadUrl, uploadData) {
    var formData = {
      file: fs.createReadStream(uploadData.local_path)
    };

    request.post({
        uri: uploadUrl,
        formData: formData
      },
      function(err, httpResponse, body) {
        setTimeout(postNextUpload, 100);

        if (err) {
          console.error('Upload failed:', err);
          uploadData.status = 'failed';

        } else {
          if (httpResponse.statusCode == 200) {
            uploadData.status = 'uploaded';

            if (options.verbose) {
              console.error('Uploaded:', uploadData.url_path);
            }
          } else {
            console.error('Upload error:', httpResponse.statusCode, body);
            uploadData.status = 'failed';
          }
        }
      }
    );
  }

  console.log('Uploading e2e tests:', options.testId);
  uploadFiles(inputDir, '');
};
