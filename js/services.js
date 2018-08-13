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
    var startTime;
    var x;
    var y;
    var z;

    window.addEventListener( 'devicemotion', function( event ) {
      x = event.acceleration.x;
      y = event.acceleration.y;
      z = event.acceleration.z;
    } );

    function createFile() {

    }

    function logEvent( logText, component, item ) {
      var timestamp = Date.now() - startTime;
      eventStorage.push( timestamp + ': Component ' + component + ', Item ' + item + ': ' + logText );
    }

    function logSensor() {
      var timestamp = Date.now() - startTime;
      sensorStorage.push( timestamp + '; ' + x + '; ' + y + '; ' + z );
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

    function writeFile( fileEntry, dataObj ) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter( function( fileWriter ) {

        fileWriter.onwriteend = function() {
          console.log( "Successful file write..." );
          //          readFile( fileEntry );
        };

        fileWriter.onerror = function( e ) {
          console.log( "Failed file write: " + e.toString() );
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if ( !dataObj ) {
          dataObj = new Blob( [ 'some file data' ], {
            type: 'text/plain'
          } );
        }

        fileWriter.write( dataObj );
      } );
    }

    function createFile( fileName, fileText ) {
      window.requestFileSystem( LocalFileSystem.PERSISTENT, 0, function( fs ) {
        var fileDir = cordova.file.externalDataDirectory.replace( cordova.file.externalRootDirectory, '' );
        var filePath = fileDir + fileName;
        console.log( fileDir );
        console.log( cordova.file.externalDataDirectory );
        fs.root.getFile( filePath, {
          create: true,
          exclusive: true
        }, function( fileEntry ) {
          alert( 'File creation successfull!' );
          writeFile( fileEntry, fileText );
        }, function( e ) {
          alert( 'Error1' + e.code );
        } );
      }, function( err ) {
        alert( 'Error2' + err.code );
      } );
    }

    function logStart() {
      startTime = Date.now();
      logEvent( 'Start' );
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
      results: results
    };

  } );
