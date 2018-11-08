angular.module('ATEM-App.services', [])
  // .factory( 'cordovaReady', [ function() {
  //   return function( fn ) {
  //     var queue = [],
  //       impl = function() {
  //         queue.push( [].slice.call( arguments ) );
  //       };
  //
  //     document.addEventListener( 'deviceready', function() {
  //       queue.forEach( function( args ) {
  //         fn.apply( this, args );
  //       } );
  //       impl = fn;
  //     }, false );
  //
  //     return function() {
  //       return impl.apply( this, arguments );
  //     };
  //   };
  // } ] )

  .service('fileService', ['$http', 'audioService', function($http, audioService) {
    var files = [];
    var sensorBuffer = [];
    const SENSORID = 0;
    const EVENTID = 1;
    const RESULTID = 2;
    var startTime;
    var x, y, z, x_grav, y_grav, z_grav, alpha, beta, gamma;
    var sensorInterval;
    var filesystem;
    var points;

    window.addEventListener('devicemotion', function(event) {
      x_grav = event.accelerationIncludingGravity.x.toString().replace(".", ",");
      y_grav = event.accelerationIncludingGravity.y.toString().replace(".", ",");
      z_grav = event.accelerationIncludingGravity.z.toString().replace(".", ",");
      x = event.acceleration.x.toString().replace(".", ",");
      y = event.acceleration.y.toString().replace(".", ",");
      z = event.acceleration.z.toString().replace(".", ",");
    });

    window.addEventListener("deviceorientation", function(event) {
      alpha = event.alpha.toString().replace(".", ",");
      beta = event.beta.toString().replace(".", ",");;
      gamma = event.gamma.toString().replace(".", ",");;
    }, true);

    function requestFS() {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
        filesystem = fs;
      });
    }

    function logEvent(logText, param, component, item) {
      if (files.length > 0) {
        var timestamp = Date.now() - startTime;
        writeFile(files[EVENTID], timestamp + '; ' + component + '; ' + item + '; ' + logText + '\n', true);
      }
    }

    function logSensor() {
      if (files.length > 0) {
        var timestamp = Date.now() - startTime;
        sensorBuffer.push(timestamp + '; ' + x + '; ' + y + '; ' + z + '; ' + x_grav + '; ' + y_grav + '; ' + z_grav + '; ' + alpha + '; ' + beta + '; ' + gamma);
        if (sensorBuffer.length == 50) {
          writeFile(files[SENSORID], sensorBuffer.join('\n') + '\n', true);
          sensorBuffer = [];
        }
      }
    }

    function logResult(msg) {
      if (files.length > 0) {
        writeFile(files[RESULTID], msg + '\n', true);
      }
    }

    function logAnswer(comp, question, answer, correctAnswer, isRegItem) {
      var msg = "";
      msg += ("Komponente " + comp + ', Frage ' + question + ': ' + answer + ' (richtige Antwort: ' + correctAnswer + ')');
      console.log(msg);
      logResult(msg);
      if (answer == correctAnswer && !isRegItem) points++;
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

    function countMonths(day, month, year) {
      startTime = new Date();

      var dayNow = startTime.getDate();
      var monthNow = startTime.getMonth() + 1;
      var yearNow = startTime.getFullYear();
      var bthDate = new Date(year, month - 1, day);
      var ageYears, ageMonths, ageDays;
      //
      // function leapYear( yr ) {
      //   return ( ( yr % 4 == 0 ) && ( yr % 100 != 0 ) ) || ( yr % 400 == 0 );
      // }
      //
      // if ( yearNow == year && ( month > monthNow || ( month == monthNow && day > dayNow ) ) ) throw "Ungültiges Geburtsdatum"
      // else switch ( month ) {
      //   case 4:
      //   case 6:
      //   case 9:
      //   case 11:
      //     if ( day > 30 ) throw "Ungültiges Geburtsdatum";
      //     break;
      //   case 2:
      //     if ( day > 29 ) throw "Ungültiges Geburtsdatum";
      //     if ( day == 29 )
      //       if ( !leapYear( year ) ) throw " Ungültiges Geburtsdatum";
      //     break;
      // }

      ageYears = startTime.getFullYear() - year;
      ageMonths = startTime.getMonth() - (month - 1);
      ageDays = startTime.getDate() - day;
      if (ageDays < 0) ageMonths = ageMonths - 1;
      if (ageMonths < 0) {
        ageYears = ageYears - 1;
        ageMonths = ageMonths + 12;
      }
      console.log("alter: " + (ageYears * 12 + ageMonths) + " Monate");
      return (ageYears * 12 + ageMonths);
    }

    function createFile(fileName, fileText, fileID) {
      var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
      var filePath = fileDir + fileName;
      console.log(fileDir);
      console.log(cordova.file.externalDataDirectory);
      filesystem.root.getFile(filePath, {
        create: true,
        exclusive: true
      }, function(fileEntry) {
        console.log('fileEntry: ' + fileEntry);
        files[fileID] = fileEntry;
        writeFile(fileEntry, fileText, false);
      }, function(e) {
        console.log('Error1' + e.code);
      });
    }

    function readFile(fileEntry) {

      fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function() {};

        reader.readAsText(file);

      }, function(err) {
        console.log('error' + err.code);
      });
    }

    function logStart(day, month, year, gender, language) {
      var ageInMonths = countMonths(day, month, year);
      var userID = Date.now();
      createFile("sensor" + userID + ".csv", 'Timestamp;X;Y;Z;X including gravity;Y including gravity;Z including Gravity;Alpha;Beta;Gamma' + '\n', SENSORID);
      createFile("events" + userID + ".csv", 'Timestamp;Component;Item;Event;Param' + '\n', EVENTID);
      createFile("results" + userID + ".txt", "Alter: " + ageInMonths + " Monate" + '\n' + "Geschlecht: " + gender + '\n' + "Sprache: " + language + '\n', RESULTID);
    }

    function logEnd() {
      if (files.length > 0) {
        var endTime = Date.now();
        logEvent('Test finished', 0, 0);
        clearInterval(sensorInterval);
        writeFile(files[SENSORID], sensorBuffer.join('\n') + '\n', true);
        sensorBuffer = [];
        //logResult("Bearbeitungszeit: " + printTime(startTime - endTime));
        files = [];
      }

      // function printTime(ms) {
      //   var hr = ms / 36000;
      //   time -= (hr * 36000);
      //   var min = ms / 6000;
      //   ms -= (min * 6000);
      //   var sec = ms / 1000;
      //   ms -= (sec * 1000);
      //   var msg;
      //   if (hr > 0) {
      //     msg = hr.toString() + ':';
      //     min < 10 ? msg += '0';
      //   }
      //   msg += min.toString() + ':';
      //   sec < 10 ? msg += '0';
      //   mgs += sec.toString() + ':';
      //   ms < 100 ? msg += '0';
      //   ms < 10 ? msg += '0';
      //   msg += ms;
      //   return msg;
      // }
    }

    function startSensor() {
      logEvent('Start', 0, 0);
      sensorInterval = setInterval(logSensor, 20);

      document.addEventListener('pause', function() {
        audioService.stopAudio();
        logEvent('Test paused', 0, 0);
        clearInterval(sensorInterval);
        document.addEventListener('resume', function() {
          logEvent('Test continued', 0, 0);
          sensorInterval = setInterval(logSensor, 20);
        })
      })
    }

    function wipeData() {
      results = [];
      clearInterval(sensorInterval);
    }

    function loadJson(id) {
      var filepath = "json/" + id + ".json";
      return $http.get(filepath);
    }

    return {
      logStart: logStart,
      logEvent: logEvent,
      logResult: logResult,
      startSensor: startSensor,
      wipeData: wipeData,
      requestFS: requestFS,
      logAnswer: logAnswer,
      loadJson: loadJson
    };

  }])

  .service('audioService', function() {

    var my_media;

    function playAudio(url) {
      // Play the audio file at url
      if (my_media != null) my_media.release();

      url = "/android_asset/www/" + url;
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

    function repeatAudio(url) {
      my_media.stop();
      my_media.play();
    }

    return {
      playAudio: playAudio,
      stopAudio: stopAudio,
      repeatAudio: repeatAudio
    };
  });