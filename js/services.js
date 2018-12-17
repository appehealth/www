angular.module('ATEM-App.services', [])

  .service('fileService', ['$http', 'audioService', function($http, audioService) {
    var results = [];
    var files = [];
    var sensorBuffer = [];
    const SENSORID = 0;
    const EVENTID = 1;
    const RESULTID = 2;
    var startTime;
    var x, y, z, x_grav, y_grav, z_grav, alpha, beta, gamma;
    var sensorInterval;
    var filesystem;
    var points = 0;
    var isFinished = false;

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
        writeFile(files[EVENTID], timestamp + '; ' + component + '; ' + item + '; ' + logText + '; ' + param + '\n', true);
      }
    }

    function logSensor() {
      if (files.length > 0) {
        var timestamp = Date.now() - startTime;
        sensorBuffer.push(timestamp + '; ' + x + '; ' + y + '; ' + z + '; ' + x_grav + '; ' + y_grav + '; ' + z_grav + '; ' + alpha + '; ' + beta + '; ' + gamma);
        if (sensorBuffer.length == 50 || isFinished) {
          writeFile(files[SENSORID], sensorBuffer.join('\n') + '\n', true);
          sensorBuffer = [];
        }
      }
    }

    function logResult(msg) {
      if (files.length > 0) {
        results.push(msg);
        console.log(results);
        //writeFile(files[RESULTID], msg, true);

      }
    }

    // function logResult(comp, question, answer, correctAnswer, isRegItem) {
    //   var msg = "";
    //   msg += ("Komponente " + comp + ', Frage ' + question + ': ' + answer + ' (richtige Antwort: ' + correctAnswer + ')');
    //   console.log(msg);
    //   logResult(msg);
    //   if (answer == correctAnswer && !isRegItem) points++;
    // }

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
      isFinished = false;
      createFile("sensor" + userID + ".csv", 'Timestamp;X;Y;Z;X including gravity;Y including gravity;Z including Gravity;Alpha;Beta;Gamma' + '\n', SENSORID);
      createFile("events" + userID + ".csv", 'Timestamp;Component;Item;Event;Param' + '\n', EVENTID);
      createFile("results" + userID + ".csv", ageInMonths + ";" + "CODE" + ";" + gender + ";" + language + ";", RESULTID);
    }

    function logEnd() {
      if (files.length > 0) {
        var endTime = Date.now();
        logEvent('Test finished', 0, 0);
        clearInterval(sensorInterval);
        writeFile(files[SENSORID], sensorBuffer.join('\n') + '\n', true);
        sensorBuffer = [];
        //t("Bearbeitungszeit: " + printTime(startTime - endTime));
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
        logEvent('Test paused', '', 0, 0);
        clearInterval(sensorInterval);
        document.addEventListener('resume', function() {
          logEvent('Test continued', '', 0, 0);
          sensorInterval = setInterval(logSensor, 20);
        })
      })
    }

    function wipeData() {
      files = [];
      clearInterval(sensorInterval);
    }


    function finishTest() {
      logEvent('Test finished', '', 0, 0);
      var testTime = Date.now() - startTime;
      var hrs = Math.floor(testTime / 3600000);
      testTime -= hrs * 3600000;
      var mins = Math.floor(testTime / 60000);
      testTime -= mins * 60000;
      var secs = Math.floor(testTime / 1000);
      var timeString = hrs.toString() + ":";
      if (mins < 10) timeString += "0";
      timeString += mins.toString() + ":";
      if (secs < 10) timeString += "0";
      timeString += secs.toString();
      timeString = "Ende des Tests. Bearbeitungszeit: " + timeString;
      logResult(timeString);
      writeFile(files[RESULTID], results.join(';'), true);
      isFinished = true;
      logSensor();
      wipeData();
    }

    return {
      logStart: logStart,
      logEvent: logEvent,
      logResult: logResult,
      startSensor: startSensor,
      wipeData: wipeData,
      requestFS: requestFS,
      logResult: logResult,
      finishTest: finishTest
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
      playAudio(url);
    }

    return {
      playAudio: playAudio,
      stopAudio: stopAudio,
      repeatAudio: repeatAudio
    };
  })

  .service('compService', ['$http', 'fileService', 'audioService', function($http, fileService, audioService) {

    var scope, rootScope;
    var mistakes3_6;
    var answerQ1;

    function setScope(currentScope) {
      scope = currentScope;
      mistakes3_6 = 0;
    }

    function setRootScope(currentRootScope) {
      rootScope = currentRootScope;
    }

    function loadJson(id) {
      var filepath = "json/" + id + ".json";
      return $http.get(filepath);
    }

    function selectAnswer(answer) {
      scope.selectedAnswer = answer;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer', answer, rootScope.currentComp, scope.currentQuestion.id);
    }

    function nextComp() {
      switch (rootScope.currentComp) {
        case 1:
          window.location = '#/comp2';
          break;
        case 2:
          if (rootScope.mistakes1_2 < 4) {
            window.location = "#/comp3";
          } else {
            const QUESTIONS3_6 = 5 + 5 + 8 + 9;
            for (i = 0; i < QUESTIONS3_6; i++) {
              fileService.logResult("0");
            }
            window.location = "#/results";
          }
          break;
        default:
          scope.displayMode = 'story';
          audioService.playAudio(scope.currentStory.audio);
          break;
      }
    }

    function nextQuestion() {
      var comp = rootScope.currentComp;
      var item, maxItem;
      if (comp == 3) {
        item = scope.currentChoice.id;
        maxItem = scope.allChoices.length;
      } else {
        item = scope.currentQuestion.id;
        maxItem = scope.allQuestions.length;
      }
      audioService.stopAudio();

      if (comp > 4) {
        nextQuestion5_6(scope.nextStory, comp, item, maxItem);
      } else {
        fileService.logResult(scope.selectedAnswer.toString());
        fileService.logEvent('Confirm answer', scope.selectedAnswer, rootScope.currentComp, scope.currentQuestion.id);
        if (scope.selectedAnswer == scope.currentQuestion.correctAnswer) {
          mistakes3_6 = 0;
        } else if (scope.selectedAnswer != scope.currentQuestion.correctAnswer && !scope.currentQuestion.isRegItem) {
          if (comp < 3) {
            rootScope.mistakes1_2++;
            if (rootScope.mistakes1_2 == 4) {
              //fileService.logResult('Zu viele Fehler in Komponente 1 und 2. Test wird nach Komponente 2 beendet.');
            }
          } else {
            mistakes3_6++;
            if (mistakes3_6 == 3) {
              if (comp == 6) {
                fileService.logResult('Drei falsche Antworten hintereinander. Test wird beendet.');
              } else {
                fileService.logResult('Drei falsche Antworten hintereinander. Sprung zur nächsten Komponente.')
              }
              nextComp();
              fillResults();
            }
          }
        }
        scope.selectedAnswer = 0;

        if (item < maxItem) {
          switch (comp) {
            case 3:
              scope.currentChoice = scope.allChoices[item];
              break;
            case 5:
              scope.currentQuestion = scope.allQuestions[item];
              scope.currentQuestion.question = scope.allQuestions[currentId].question1;
              break;
            default:
              scope.currentQuestion = scope.allQuestions[item];
              break;
          }
          scope.showQuestionImg = true;
          if (scope.currentQuestion.id == scope.nextStory) {
            scope.displayMode = 'story';
            audioService.playAudio(scope.currentStory.audio);
          } else {
            if (comp == 3) {
              scope.displayMode = 'choice';
              audioService.playAudio(scope.currentChoice.choiceAudio);
            } else {
              scope.showAnswers = false;
              audioService.playAudio(scope.currentQuestion.audio[0]);
              window.scrollTo(0, 0);
            }
          }
        } else {
          audioService.stopAudio();
          nextComp();
        }
      }
    }

    function nextQuestion5_6(assa, comp, item, numberOfQuestions) {
      if (typeof(scope.allQuestions[item - 1].question2) === "undefined") {
        fileService.logResult(scope.selectedAnswer.toString());
        fileService.logEvent('Confirm answer', scope.selectedAnswer, comp, scope.currentQuestion.id);
        if (scope.selectedAnswer == scope.currentQuestion.correctAnswer1) {
          mistakes3_6 = 0;
        } else {
          mistakes3_6++;
          if (mistakes3_6 == 3) {
            if (comp == 5) {
              fileService.logResult('Drei falsche Antworten hintereinander. Sprung zur nächsten Komponente.');
            } else {
              fileService.logResult('Drei falsche Antworten hintereinander. Test wird beendet.');
            }
            nextComp();
            fillResults();
            return;
          }
        }
        nextItem();

      } else if (scope.currentQuestion.question == scope.allQuestions[item - 1].question1) {
        answerQ1 = scope.selectedAnswer;
        fileService.logEvent('Question A: Confirm answer', scope.selectedAnswer, comp, scope.currentQuestion.id);
        fileService.logResult(scope.selectedAnswer.toString());
        scope.selectedAnswer = 0;
        scope.currentQuestion.question = scope.allQuestions[item - 1].question2;
        audioService.playAudio(scope.currentQuestion.question.audio[1]);
      } else {
        fileService.logEvent('Question B: Confirm answer', scope.selectedAnswer, comp, scope.currentQuestion.id);
        if (answerQ1 == scope.allQuestions[item - 1].correctAnswer1 && scope.selectedAnswer == scope.allQuestions[item - 1].correctAnswer2) {
          mistakes3_6 = 0;
          fileService.logResult(scope.selectedAnswer.toString());
        } else {
          mistakes3_6++;
          fileService.logResult(scope.selectedAnswer.toString());
          if (mistakes3_6 == 3) {
            if (comp == 5) {
              fileService.logResult('Drei falsche Antworten hintereinander. Sprung zur nächsten Komponente.');
            } else {
              fileService.logResult('Drei falsche Antworten hintereinander. Test wird beendet.');
            }
            nextComp();
            fillResults();
            return;
          }
        }
        nextItem();

      }

      function nextItem() {
        audioService.stopAudio();
        scope.selectedAnswer = 0;
        if (item < numberOfQuestions) {
          scope.currentQuestion = scope.allQuestions[item];
          scope.currentQuestion.question = scope.allQuestions[item].question1;
          scope.showQuestionImg = true;
          if (scope.currentQuestion.id == scope.nextStory) {
            scope.displayMode = 'story';
            audioService.playAudio(scope.currentStory.audio);
          } else {
            scope.showAnswers = false;
            audioService.playAudio(scope.currentQuestion.question.audio[0]);
          }
        } else scope.displayMode = 'story';

        window.scrollTo(0, 0);
      }
    }

    function fillResults() {
      for (i = scope.currentQuestion.id; i < scope.allQuestions.length - 1; i++) {
        fileService.logResult("0");
        if (rootScope.currentComp > 4 && typeof(scope.allQuestions[i - 1].question2) != "undefined") {
          fileService.logResult("0");
        }
      }
    }

    return {
      loadJson: loadJson,
      selectAnswer: selectAnswer,
      setScope: setScope,
      setRootScope: setRootScope,
      nextQuestion: nextQuestion
    };
  }]);