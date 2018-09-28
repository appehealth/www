angular.module( 'ATEM-App.services', [] )
  .factory( 'cordovaReady', [ function() {
    return function( fn ) {
      var queue = [],
        impl = function() {
          queue.push( [].slice.call( arguments ) );
        };

      document.addEventListener( 'deviceready', function() {
        queue.forEach( function( args ) {
          fn.apply( this, args );
        } );
        impl = fn;
      }, false );

      return function() {
        return impl.apply( this, arguments );
      };
    };
  } ] )

  .service( 'storeEvents', function() {
    var results = [];
    var eventFile;
    var resultFile;
    var sensorFile;
    var startTime;
    var x;
    var y;
    var z;
    var sensorInterval;
    var filesystem;

    window.addEventListener( 'devicemotion', function( event ) {
      x = event.acceleration.x;
      y = event.acceleration.y;
      z = event.acceleration.z;
    } );

    window.requestFileSystem( LocalFileSystem.PERSISTENT, 0, function( fs ) {
      filesystem = fs;
    } );

    function logEvent( logText, component, item ) {
      // var timestamp = Date.now() - startTime;
      // writeFile(eventFile, timestamp + ': Component ' + component + ', Item ' + item + ': ' + logText + '\n', true);
    }

    function logSensor() {
      // var timestamp = Date.now() - startTime;
      // writeFile(sensorFile, timestamp + '; ' + x + '; ' + y + '; ' + z + '\n', true);
    }

    function logResult( msg ) {
      // writeFile(resultFile, msg + '\n', true);
    }

    function writeFile( fileEntry, dataObj, isAppend ) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter( function( fileWriter ) {

        fileWriter.onwriteend = function() {
          console.log( "Successful file read..." );
          readFile( fileEntry );
        };

        fileWriter.onerror = function( e ) {
          console.log( "Failed file read: " + e.toString() );
        };

        // If we are appending data to file, go to the end of the file.
        if ( isAppend ) {
          try {
            fileWriter.seek( fileWriter.length );
          } catch ( e ) {
            console.log( "file doesn't exist!" );
          }
        }
        fileWriter.write( dataObj );
      } );
    }

    function logBirthday( day, month, year ) {
      startTime = new Date();

      var dayNow = startTime.getDate();
      var monthNow = startTime.getMonth() + 1;
      var yearNow = startTime.getFullYear();
      var bthDate = new Date( year, month - 1, day );
      var ageYears, ageMonths, ageDays;

      function leapYear( yr ) {
        return ( ( yr % 4 == 0 ) && ( yr % 100 != 0 ) ) || ( yr % 400 == 0 );
      }

      if ( yearNow == year && ( month > monthNow || ( month == monthNow && day > dayNow ) ) ) throw "Ungültiges Geburtsdatum"
      else switch ( month ) {
        case 4:
        case 6:
        case 9:
        case 11:
          if ( day > 30 ) throw "Ungültiges Geburtsdatum";
          break;
        case 2:
          if ( day > 29 ) throw "Ungültiges Geburtsdatum";
          if ( day == 29 )
            if ( !leapYear( year ) ) throw " Ungültiges Geburtsdatum";
          break;
      }

      ageYears = startTime.getFullYear() - year;
      ageMonths = startTime.getMonth() - ( month - 1 );
      ageDays = startTime.getDate() - day;
      if ( ageDays < 0 ) ageMonths = ageMonths - 1;
      if ( ageMonths < 0 ) {
        ageYears = ageYears - 1;
        ageMonths = ageMonths + 12;
      }
      console.log( "alter: " + ( ageYears * 12 + ageMonths ) + " Monate" );
      return ( ageYears * 12 + ageMonths );
    }

    function createFile( fileName, fileText ) {
      // var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
      // var filePath = fileDir + fileName;
      // console.log(fileDir);
      // console.log(cordova.file.externalDataDirectory);
      // filesystem.root.getFile(filePath, {
      //   create: true,
      //   exclusive: true
      // }, function(fileEntry) {
      //   console.log('fileEntry: ' + fileEntry);
      //   if (fileName.startsWith("events")) eventFile = fileEntry;
      //   if (fileName.startsWith("sensor")) sensorFile = fileEntry;
      //   if (fileName.startsWith("results")) resultFile = fileEntry;
      //   writeFile(fileEntry, fileText, false);
      // }, function(e) {
      //   console.log('Error1' + e.code);
      // });

    }

    function readFile( fileEntry ) {

      fileEntry.file( function( file ) {
        var reader = new FileReader();

        reader.onloadend = function() {
          console.log( "Successful file read: " + this.result );
        };

        reader.readAsText( file );

      }, function( err ) {
        console.log( 'error' + err.code );
      } );
    }

    function logStart( day, month, year, gender ) {
      // var ageInMonths;
      // ageInMonths = logBirthday(day, month, year);
      // createFile("events" + startTime + ".txt", '');
      // createFile("sensor" + startTime + ".csv", 'Timestamp;X;Y;Z' + '\n');
      // createFile("results" + startTime + ".txt", "Age: " + ageInMonths + " months" + '\n' + "Gender: " + gender + '\n');
    }

    function startSensor() {
      // logEvent('Start', 1, 1);
      // sensorInterval = setInterval(logSensor, 20);
    }

    function wipeData() {
      results = [];
      clearInterval( sensorInterval );
    }

    return {
      logStart: logStart,
      logEvent: logEvent,
      logResult: logResult,
      startSensor: startSensor,
      results: results,
      wipeData: wipeData
    };

  } )

  .service( 'audioService', function() {

    var my_media;

    function playAudio( url ) {
      // Play the audio file at url

      url = "/android_asset/www/" + url;
      //fix url for Android
      my_media = new Media( url,
        // success callback
        function() {
          console.log( "playAudio():Audio Success" );
        },
        // error callback
        function( err ) {
          console.log( "playAudio():Audio Error: " + err.code + err.message );
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
  } );