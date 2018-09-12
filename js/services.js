angular.module('ATEM-App.services', [])
  .factory('cordovaReady', [function() {
    return function(fn) {
      var queue = [],
        impl = function() {
          queue.push([].slice.call(arguments));
        };

      document.addEventListener('deviceready', function() {
        queue.forEach(function(args) {
          fn.apply(this, args);
        });
        impl = fn;
      }, false);

      return function() {
        return impl.apply(this, arguments);
      };
    };
  }])

  .service('storeEvents', function() {
    var eventStorage = [];
    var sensorStorage = [];
    var results = [];
    var startTime;
    var x;
    var y;
    var z;

    window.addEventListener('devicemotion', function(event) {
      x = event.acceleration.x;
      y = event.acceleration.y;
      z = event.acceleration.z;
    });

    function appendFile(filename, msg) {
      var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
      window.resolveLocalFileSystemURL(fileDir, function(dirEntry) {
        dirEntry.getFile(fileName, {
          create: true,
          exclusive: false
        }, function(fileEntry) {

          writeFile(fileEntry, null, true);

        }, onErrorCreateFile);
      }, onErrorLoadFs);

    }

    function logEvent(logText, component, item) {
      var timestamp = Date.now() - startTime;
      appendFile("events" + startTime + ".txt", timestamp + ': Component ' + component + ', Item ' + item + ': ' + logText);
    }

    function logSensor() {
      var timestamp = Date.now() - startTime;
      appendFile("sensor"+startTime+".csv",timestamp + '; ' + x + '; ' + y + '; ' + z);
    }

    function logResult(msg){
      appendFile("results"+startTime+".txt",msg);
    }

    function saveResults() {
      createFile("results" + startTime + ".txt", results.join('\n'));
    }

    function saveEvents() {
      createFile("events" + startTime + ".txt", eventStorage.join('\n'));
    }

    function saveSensor() {
      createFile("sensor" + startTime + ".csv", 'Timestamp;X;Y;Z' + '\n' + sensorStorage.join('\n'));
    }

    function writeFile(fileEntry, dataObj, isAppend) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function() {
          console.log("Successful file read...");
          readFile(fileEntry);
        };

        fileWriter.onerror = function(e) {
          console.log("Failed file read: " + e.toString());
        };

        // If we are appending data to file, go to the end of the file.
        if (isAppend) {
          try {
            fileWriter.seek(fileWriter.length);
          } catch (e) {
            console.log("file doesn't exist!");
          }
        }
        fileWriter.write(dataObj);
      });
    }

    function createFile(fileName, fileText) {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
        var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
        var filePath = fileDir + fileName;
        console.log(fileDir);
        console.log(cordova.file.externalDataDirectory);
        fs.root.getFile(filePath, {
          create: true,
          exclusive: true
        }, function(fileEntry) {
          alert('File creation successfull!');
          writeFile(fileEntry, fileText, false);
        }, function(e) {
          alert('Error1' + e.code);
        });
      }, function(err) {
        alert('Error2' + err.code);
      });
    }

    function logStart() {
      startTime = Date.now();
      createFile("events" + startTime + ".txt");
      //createFile("sensor" + startTime + ".csv", 'Timestamp;X;Y;Z' + '\n');
      //createFile("results" + startTime + ".txt", results.join('\n'));
      logEvent('Start');
      setInterval(logSensor, 20);
    }

    return {
      logStart: logStart,
      logEvent: logEvent,
      eventStorage: eventStorage,
      sensorStorage: sensorStorage,
      saveEvents: saveEvents,
      saveSensor: saveSensor,
      saveResults: saveResults,
      logResult: logResult
    };

  })
  .service('audioService', function() {

    var my_media;

    function playAudio(url) {
      // Play the audio file at url

      //url = "/android_asset/www/" + url;
      //fix url for Android
      my_media = new Media(url,
        // success callback
        function() {
          console.log("playAudio():Audio Success");
        },
        // error callback
        function(err) {
          console.log("playAudio():Audio Error: " + err.code + err.message);
        }
      );

      // Play audio
      my_media.play();
    }

    function stopAudio() {
      my_media.stop();
    }

    return {
      playAudio: playAudio,
      stopAudio: stopAudio
    };
  });
