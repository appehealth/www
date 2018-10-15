angular.module('ATEM-App.controllers', [])

  .controller('StartCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.normalClick = function() {
      $rootScope.presentationMode = false;
      window.location = '#/intro';
    }

    $scope.presentationClick = function() {
      $rootScope.presentationMode = true; +
      window.location = '#/intro';
    }
  }])

  .controller('IntroCtrl', ['$scope', 'fileService', 'audioService', function($scope, fileService, audioService) {
    var part2 = false;
    var text1, text2;
    var audio = [];
    var d = new Date();
    var y = d.getFullYear();
    $scope.birthdayYears = [];
    for (i = y - 30; i <= y; i++) {
      $scope.birthdayYears.push(i);
    }
    $scope.language = 'keine andere Sprache';
    $scope.day = 'Tag';
    $scope.month = 'Monat';
    $scope.year = 'Jahr';
    $scope.gender = '';

    fileService.loadJson("intro").then(function(response) {
      text1 = response.data.text1;
      text2 = response.data.text2;
      $scope.introText = text1;
      audio = response.data.audio;
      fileService.requestFS();
    });

    $scope.startStory = function() {
      fileService.logStart(parseInt($scope.day), $scope.monthID, $scope.year, $scope.gender, $scope.language);
      window.location = '#/introduction';
      audioService.playAudio(audio[0]);
    }

    $scope.startComp1 = function() {
      if (part2) {
        audioService.stopAudio();
        window.location = '#/comp1';
        fileService.startSensor();
      } else {
        part2 = true;
        $scope.introText = text2;
        window.scrollTo(0, 0);
      }
    }
  }])

  .controller('Comp1Ctrl', ['$scope', '$rootScope', 'audioService', 'fileService', function($scope, $rootScope, audioService, fileService) {
    var allQuestions = [];
    var numberOfQuestions = 0;
    $rootScope.mistakes1_2 = 0;
    $scope.finished = false;

    fileService.loadJson("comp1").then(function(response) {
      allQuestions = response.data.questions;
      numberOfQuestions = allQuestions.length;
      $scope.rewardImg = response.data.rewardImg;
      $scope.albumText = response.data.text;
      $scope.currentQuestion = allQuestions[0];
      audioService.playAudio($scope.currentQuestion.audio);
    });

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer ' + ans, 1, $scope.currentQuestion.id);
    }

    $scope.repeatAudio = function() {
      audioService.repeatAudio();
    }

    $scope.nextQuestion = function() {
      audioService.stopAudio();
      fileService.logAnswer(1, $scope.currentQuestion.id, $scope.selectedAnswer, $scope.currentQuestion.correctAnswer);
      if ($scope.selectedAnswer != $scope.currentQuestion.correctAnswer) {
        $rootScope.mistakes1_2++;
        if ($rootScope.mistakes1_2 == 4) {
          fileService.logResult('Zu viele Fehler in Komponente 1. Test wird nach Komponente 2 beendet.');
        }
      }
      $scope.selectedAnswer = 0;
      fileService.logEvent('Confirm answer', 1, $scope.currentQuestion.id);
      if ($scope.currentQuestion.id < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[$scope.currentQuestion.id];
        audioService.playAudio($scope.currentQuestion.audio);
        window.scrollTo(0, 0);
      } else {
        $scope.finished = true;
      }
    }

    $scope.nextComp = function() {
      audioService.stopAudio();
      fileService.logEvent('Start component 2')
      window.location = '#/comp2';
    }
  }])

  .controller('Comp2Ctrl', ['$scope', '$rootScope', 'audioService', 'fileService', function($scope, $rootScope, audioService, fileService) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    $scope.confirmQuestion = function() {
      audioService.stopAudio();
      fileService.logAnswer(2, $scope.currentQuestion.id, $scope.selectedAnswer, $scope.currentQuestion.correctAnswer);
      fileService.logEvent('Confirm answer', 2, $scope.currentQuestion.id)
      if ($scope.selectedAnswer != $scope.currentQuestion.correctAnswer && !$scope.currentQuestion.isRegItem) {
        $rootScope.mistakes1_2++;
        console.log("fehler: " + $rootScope.mistakes1_2);
        if ($rootScope.mistakes1_2 == 4) {
          fileService.logResult('Zu viele Fehler in Komponente 1 und 2. Test wird nach dieser Komponente beendet.');
        }
      }

      $scope.selectedAnswer = 0;

      if ($scope.currentQuestion.id < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[$scope.currentQuestion.id];
        $scope.showQuestionImg = true;
        if ($scope.currentQuestion.id == nextStory) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.showAnswers = false;
          audioService.playAudio($scope.currentQuestion.audio[0]);
        }
      } else $scope.displayMode = 'story';

      window.scrollTo(0, 0);

    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio($scope.currentQuestion.audio[1]);
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer ' + ans, 2, $scope.currentQuestion.id);
    }

    $scope.repeatAudio = function() {
      audioService.repeatAudio();
    }

    $scope.continueStory = function() {
      audioService.stopAudio();
      if ($scope.currentStory.id == story.length) {
        $rootScope.mistakes1_2 < 4 ? window.location = '#/comp3' : window.location = '#/results';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'question';
          audioService.playAudio($scope.currentQuestion.audio[0]);
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }

      window.scrollTo(0, 0);
    }

    //Load component from JSON
    fileService.loadJson("comp2").then(function(response) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[0];

      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory <= 1) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio($scope.currentQuestion.audio[0]);
        }
      }
      console.log($scope.displayMode);
    });
    /////////////////////////

  }])

  .controller('Comp3Ctrl', ['$scope', 'fileService', 'audioService', function($scope, fileService, audioService) {
    var allChoices = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var showAnswers = false;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showChoiceImg = true;
    $scope.showQuestionImg = true;

    $scope.btnChoice = function(ch) {
      audioService.stopAudio();
      fileService.logEvent('Select choice ' + ch, 3, $scope.currentChoice.id);
      if (ch == 'A') $scope.currentQuestion = $scope.currentChoice.questionA;
      else $scope.currentQuestion = $scope.currentChoice.questionB;
      $scope.displayMode = 'question';
      audioService.playAudio($scope.currentQuestion.audio[0]);
      window.scrollTo(0, 0);
    }

    $scope.repeatAudio = function() {
      audioService.repeatAudio();
    }

    $scope.confirmQuestion = function() {
      audioService.stopAudio();
      fileService.logAnswer(3, $scope.currentQuestion.id, $scope.selectedAnswer, $scope.currentQuestion.correctAnswer);
      fileService.logEvent('Confirm answer', 3, $scope.currentChoice.id)
      if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if (wrongAnswers == 3) {
          fileService.logResult('Drei falsche Antworten hintereinander. Sprung zu Komponente 5.');
          window.location = '#/comp4';
        }
      }

      $scope.selectedAnswer = 0;

      if ($scope.currentChoice.id < numberOfQuestions) {
        $scope.currentChoice = allChoices[$scope.currentChoice.id];
        $scope.showQuestionImg = true;
        if ($scope.currentChoice.id == nextStory) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.displayMode = 'choice';
          audioService.playAudio($scope.currentChoice.choiceAudio);
        }
      } else {
        $scope.displayMode = 'story';
        audioService.playAudio($scope.currentStory.audio);
      }

      window.scrollTo(0, 0);

    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer ' + ans, 3, $scope.currentChoice.id);
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio($scope.currentQuestion.audio[1]);
    }

    $scope.continueStory = function() {
      audioService.stopAudio();

      if ($scope.currentStory.id == story.length) {
        window.location = '#/comp4';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'choice';
          audioService.playAudio($scope.currentChoice.choiceAudio);
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }

      window.scrollTo(0, 0);
    }

    fileService.loadJson("comp3").then(function(response) {
      allChoices = response.data.choices;
      story = response.data.story;
      numberOfQuestions = allChoices.length;
      $scope.currentChoice = allChoices[0];

      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory == 1) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.displayMode = 'choice';
          audioService.playAudio($scope.currentChoice.choiceAudio);
        }
      }
    })

  }])

  .controller('Comp4Ctrl', ['$scope', 'fileService', 'audioService', function($scope, fileService, audioService) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    $scope.confirmQuestion = function() {
      audioService.stopAudio();
      fileService.logAnswer(4, $scope.currentQuestion.id, $scope.selectedAnswer, $scope.currentQuestion.correctAnswer);
      fileService.logEvent('Confirm answer', 4, $scope.currentQuestion.id)
      if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if (wrongAnswers == 3) {
          fileService.logResult('Drei falsche Antworten hintereinander. Sprung zu Komponente 4.');
          window.location = '#/comp5';
        }
      }

      $scope.selectedAnswer = 0;

      if ($scope.currentQuestion.id < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[$scope.currentQuestion.id];
        $scope.showQuestionImg = true;
        if ($scope.currentQuestion.id == nextStory) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.showAnswers = false;
          audioService.playAudio($scope.currentQuestion.audio[0]);
        }
      } else $scope.displayMode = 'story';

      window.scrollTo(0, 0);
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer ' + ans, 4, $scope.currentQuestion.id);
    }

    $scope.repeatAudio = function() {
      audioService.repeatAudio();
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio($scope.currentQuestion.audio[1]);
    }

    $scope.continueStory = function() {
      audioService.stopAudio();
      if ($scope.currentStory.id == story.length) {
        window.location = '#/comp5';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'question';
          audioService.playAudio($scope.currentQuestion.audio[0]);
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }

      window.scrollTo(0, 0);
    }

    //Load component from JSON
    fileService.loadJson("comp4").then(function(response) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[0];

      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory == 1) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio($scope.currentQuestion.audio[0]);
        }
      }
    })

  }])

  .controller('Comp5Ctrl', ['$scope', 'fileService', 'audioService', function($scope, fileService, audioService) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var nextStory = 0;
    var answerQ1 = 0;
    var currentId = 1;

    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    function nextQuestion() {
      audioService.stopAudio();
      $scope.selectedAnswer = 0;
      if (currentId < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[currentId];
        $scope.currentQuestion.question = allQuestions[currentId].question1;
        $scope.showQuestionImg = true;
        currentId++;
        if ($scope.currentQuestion.id == nextStory) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.showAnswers = false;
          audioService.playAudio($scope.currentQuestion.question.audio[0]);
        }
      } else $scope.displayMode = 'story';

      window.scrollTo(0, 0);
    }


    $scope.repeatAudio = function() {
      audioService.repeatAudio();
    }

    $scope.confirmQuestion = function() {
      audioService.stopAudio();
      if (typeof(allQuestions[currentId - 1].question2) === "undefined") {
        fileService.logAnswer(5, $scope.currentQuestion.id, $scope.selectedAnswer, $scope.currentQuestion.correctAnswer1);
        fileService.logEvent('Confirm answer', 5, $scope.currentQuestion.id);
        if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer1) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            fileService.logResult('Drei falsche Antworten hintereinander. Sprung zu Komponente 6.');
            window.location = '#/comp6';
          }
        }
        nextQuestion();

      } else if ($scope.currentQuestion.question == allQuestions[currentId - 1].question1) {
        answerQ1 = $scope.selectedAnswer;
        fileService.logEvent('Question A: Confirm answer', 5, $scope.currentQuestion.id);
        fileService.logAnswer(5, $scope.currentQuestion.id + 'a', $scope.selectedAnswer, $scope.currentQuestion.correctAnswer1);
        $scope.selectedAnswer = 0;
        $scope.currentQuestion.question = allQuestions[currentId - 1].question2;
        audioService.playAudio($scope.currentQuestion.question[0]);
      } else {
        fileService.logEvent('Question B: Confirm answer', 5, $scope.currentQuestion.id);
        fileService.logAnswer(5, $scope.currentQuestion.id + 'b', $scope.selectedAnswer, $scope.currentQuestion.correctAnswer2);
        if (answerQ1 == allQuestions[currentId - 1].correctAnswer1 && $scope.selectedAnswer == allQuestions[currentId - 1].correctAnswer2) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            fileService.logResult('Drei falsche Antworten hintereinander. Sprung zu Komponente 6.');
            window.location = '#/comp6';
          }
        }
        nextQuestion();
      }
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer ' + ans, 5, $scope.currentQuestion.id);
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio($scope.currentQuestion.question.audio[1]);
    }

    $scope.continueStory = function() {
      if ($scope.currentStory.id == story.length) {
        window.location = '#/comp6';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'question';
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }

      window.scrollTo(0, 0);
    }

    //Load component from JSON
    fileService.loadJson("comp5").then(function(response) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[0];
      $scope.currentQuestion.question = allQuestions[0].question1;
      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory == 1) {
          $scope.displayMode = 'story';
          audioService.playAudio($scope.currentStory.audio);
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio($scope.currentQuestion.question.audio[0]);
        }
      }
    });
    /////////////////////////

  }])

  .controller('Comp6Ctrl', ['$scope', 'fileService', function($scope, fileService) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var nextStory = 0;
    var answerQ1 = 0;
    var currentId = 1;

    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    function nextQuestion() {
      $scope.selectedAnswer = 0;
      if (currentId < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[currentId];
        $scope.currentQuestion.question = allQuestions[currentId].question1;
        $scope.showQuestionImg = true;
        currentId++;
        if ($scope.currentQuestion.id == nextStory) {
          $scope.displayMode = 'story';
        } else $scope.showAnswers = false;
      } else $scope.displayMode = 'story';

      window.scrollTo(0, 0);
    }

    $scope.confirmQuestion = function() {
      if (typeof(allQuestions[currentId - 1].question2) === "undefined") {
        fileService.logAnswer(6, $scope.currentQuestion.id, $scope.selectedAnswer, $scope.currentQuestion.correctAnswer1);
        fileService.logEvent('Confirm answer', 6, $scope.currentQuestion.id);
        if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer1) {
          wrongAnswers = 0;
        } else {
          if (!$scope.currentQuestion.isRegItem) wrongAnswers++;
          if (wrongAnswers == 3) {
            fileService.logResult('Drei falsche Antworten hintereinander. Test wird beendet.');
            window.location = '#/results';
          }
        }
        nextQuestion();

      } else if ($scope.currentQuestion.question == allQuestions[currentId - 1].question1) {
        answerQ1 = $scope.selectedAnswer;
        fileService.logEvent('Question A: Confirm answer', 6, $scope.currentQuestion.id);
        fileService.logAnswer(6, $scope.currentQuestion.id + 'a', $scope.selectedAnswer, $scope.currentQuestion.correctAnswer1);
        $scope.selectedAnswer = 0;
        $scope.currentQuestion.question = allQuestions[currentId - 1].question2;
      } else {
        fileService.logAnswer(6, $scope.currentQuestion.id + 'b', $scope.selectedAnswer, $scope.currentQuestion.correctAnswer2);
        fileService.logEvent('Question B: Confirm answer', 6, $scope.currentQuestion.id);
        if (answerQ1 == allQuestions[currentId - 1].correctAnswer1 && $scope.selectedAnswer == allQuestions[currentId - 1].correctAnswer2) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            fileService.logResult('Drei falsche Antworten hintereinander. Test wird beendet.');
            window.location = '#/results';
          }
        }
        nextQuestion();
      }
    }
    $scope.repeatAudio = function() {
      audioService.repeatAudio();
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      window.scrollTo(0, document.body.scrollHeight);
      fileService.logEvent('Select answer ' + ans, 5, $scope.currentQuestion.id);
    }

    $scope.continueStory = function() {
      if ($scope.currentStory.id == story.length) {
        window.location = '#/results';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'question';
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }

      window.scrollTo(0, 0);
    }

    //Load component from JSON
    fileService.loadJson("comp6").then(function(response) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[0];
      $scope.currentQuestion.question = allQuestions[0].question1;
      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory == 1) {
          $scope.displayMode = 'story';
        } else {
          $scope.displayMode = 'question';
        }
      }
    });
    /////////////////////////

  }])

  .controller('ResultsCtrl', ['$scope', 'fileService', function($scope, fileService) {

    $scope.returnToTitle = function() {
      fileService.wipeData();
      window.location = '#/';
    }
  }])

;