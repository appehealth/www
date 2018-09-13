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
    var eventStorage = [];
    var sensorStorage = [];
    var results = [];
    var eventFile;
    var resultFile;
    var sensorFile;
    var startTime;
    var x;
    var y;
    var z;

    window.addEventListener( 'devicemotion', function( event ) {
      x = event.acceleration.x;
      y = event.acceleration.y;
      z = event.acceleration.z;
    } );

    function logEvent( logText, component, item ) {
      var timestamp = Date.now() - startTime;
      writeFile( eventFile, timestamp + ': Component ' + component + ', Item ' + item + ': ' + logText, true );
    }

    function logSensor() {
      var timestamp = Date.now() - startTime;
      writeFile( sensorFile, timestamp + '; ' + x + '; ' + y + '; ' + z + '\n', true );
    }

    function logResult( msg ) {
      writeFile( resultFile, msg, true );
    }

    function saveResults() {
      createFile( "results" + startTime + ".txt", results.join( '\n' ) );
    }

    function saveEvents() {
      createFile( "events" + startTime + ".txt", eventStorage.join( '\n' ) );
    }

    function saveSensor() {
      createFile( "sensor" + startTime + ".csv", 'Timestamp;X;Y;Z' + '\n' + sensorStorage.join( '\n' ) );
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

    function createFile( fileName, fileText ) {
      window.requestFileSystem( LocalFileSystem.PERSISTENT, 0, function( fs ) {
        console.log( fs.name );
        var fileDir = cordova.file.externalDataDirectory.replace( cordova.file.externalRootDirectory, '' );
        var filePath = fileDir + fileName;
        console.log( fileDir );
        console.log( cordova.file.externalDataDirectory );
        fs.root.getFile( filePath, {
          create: true,
          exclusive: true
        }, function( fileEntry ) {
          console.log( 'fileEntry: ' + fileEntry );
          if ( fileName.startsWith( "events" ) ) eventFile = fileEntry;
          if ( fileName.startsWith( "sensor" ) ) sensorFile = fileEntry;
          if ( fileName.startsWith( "results" ) ) resultFile = fileEntry;
          writeFile( fileEntry, fileText, false );
        }, function( e ) {
          console.log( 'Error1' + e.code );
        } );
      }, function( err ) {
        console.log( 'Error2' + err.code );
      } );
    }

    function readFile( fileEntry ) {

      fileEntry.file( function( file ) {
        var reader = new FileReader();

        reader.onloadend = function() {
          console.log( "Successful file read: " + this.result );
          displayFileData( fileEntry.fullPath + ": " + this.result );
        };

        reader.readAsText( file );

      }, function( err ) {
        console.log( 'error' + err.code );
      } );
    }

    function logStart() {
      startTime = Date.now();
      createFile( "events" + startTime + ".csv", '' );
      createFile( "sensor" + startTime + ".csv", 'Timestamp;X;Y;Z' + '\n' );
      createFile( "results" + startTime + ".txt", results.join( '\n' ) );
    }

    function startSensor() {
      logEvent( 'Start', 1, 1 );
      setInterval( logSensor, 20 );
    }

    return {
      logStart: logStart,
      logEvent: logEvent,
      eventStorage: eventStorage,
      sensorStorage: sensorStorage,
      saveEvents: saveEvents,
      saveSensor: saveSensor,
      saveResults: saveResults,
      logResult: logResult,
      startSensor: startSensor,
      results: results
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