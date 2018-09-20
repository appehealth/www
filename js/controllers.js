angular.module('ATEM-App.controllers', [])

  .controller('IntroCtrl', ['$scope', '$http', 'storeEvents', 'audioService', function($scope, $http, storeEvents, audioService) {
    var part2 = false;
    var text1, text2;
    var audio = [];
    var d = new Date();
    var y = d.getFullYear();
    $scope.birthdayYears = [];
    for (i = y - 30; i <= y; i++) {
      $scope.birthdayYears.push(i);
    }
    $scope.language = 'german';

<<<<<<< HEAD

=======
>>>>>>> 35f9103a1d40bcd60dc09f4c1ae940776b0375a2
    $http.get("json/intro.json").then(function(response) {
      text1 = response.data.text1;
      text2 = response.data.text2;
      $scope.introText = text1;
      audio = response.data.audio;
    });

    $scope.startStory = function() {
<<<<<<< HEAD
      // storeEvents.logStart();
      // storeEvents.logResult( 'Birthday: ' + $scope.day + '. ' + $scope.month + '. ' + $scope.year );
      // storeEvents.logResult( 'Gender: ' + $scope.gender );
      // storeEvents.logResult( 'Language: ' + $scope.language );
      // window.location = '#/introduction';
      // audioService.playAudio( audio[ 0 ] );
      storeEvents.logStart(parseInt($scope.day), $scope.monthID, $scope.year, $scope.gender);
=======
      storeEvents.logStart();
      storeEvents.logResult('Birthday: ' + $scope.day + '. ' + $scope.month + '. ' + $scope.year);
      storeEvents.logResult('Gender: ' + $scope.gender);
      storeEvents.logResult('Language: ' + $scope.language);
      window.location = '#/introduction';
      audioService.playAudio(audio[0]);
>>>>>>> 35f9103a1d40bcd60dc09f4c1ae940776b0375a2
    }

    $scope.startComp1 = function() {
      if (part2) {
        audioService.stopAudio();
        window.location = '#/comp1';
      } else {
        part2 = true;
        $scope.introText = text2;
        window.scrollTo(0, 0);
      }
    }
  }])

  .controller('Comp1Ctrl', ['$scope', '$http', 'audioService', 'storeEvents', function($scope, $http, audioService, storeEvents) {
    var allQuestions = [];
    var numberOfQuestions = 0;
    var rewardImg;
    $scope.finished = false;

    $http.get("json/comp1.json").then(function(response) {
      allQuestions = response.data.questions;
      numberOfQuestions = allQuestions.length;
      rewardImg = response.data.rewardImg;
      $scope.currentQuestion = allQuestions[0];
      audioService.playAudio($scope.currentQuestion.audio);
    });

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent('Select answer ' + ans, 1, $scope.currentQuestion.id);
<<<<<<< HEAD
=======
      window.scrollTo(0, 500);
>>>>>>> 35f9103a1d40bcd60dc09f4c1ae940776b0375a2
    }

    $scope.nextQuestion = function() {
      audioService.stopAudio();
      storeEvents.logResult('Component 1, Question ' + $scope.currentQuestion.id + ': ' + $scope.selectedAnswer);
      $scope.selectedAnswer = 0;
      storeEvents.logEvent('Confirm answer', 1, $scope.currentQuestion.id);
      if ($scope.currentQuestion.id < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[$scope.currentQuestion.id];
        audioService.playAudio($scope.currentQuestion.audio);
        window.scrollTo(0, 0);
      } else {
        storeEvents.logEvent('Start component 2')
        window.location = '#/comp2';
      }
    }
  }])

  .controller('Comp2Ctrl', ['$scope', '$http', 'audioService', 'storeEvents', function($scope, $http, audioService, storeEvents) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    $scope.confirmQuestion = function() {
      audioService.stopAudio();
      storeEvents.logResult('Component 2, Question ' + $scope.currentQuestion.id + ': ' + $scope.selectedAnswer);
      storeEvents.logEvent('Confirm answer', 2, $scope.currentQuestion.id)
      if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if (wrongAnswers == 3) {
          storeEvents.logResult('Three wrong answers in a row. Test was stopped.');
          window.location = '#/results';
        }
      }

      $scope.selectedAnswer = 0;

      if ($scope.currentQuestion.id < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[$scope.currentQuestion.id];
        $scope.showQuestionImg = true;
        if ($scope.currentQuestion.id == nextStory) {
          $scope.displayMode = 'story';
        } else {
          $scope.showAnswers = false;
        }
      } else $scope.displayMode = 'story';

    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent('Select answer ' + ans, 2, $scope.currentQuestion.id);
    }

    $scope.continueStory = function() {
      if ($scope.currentStory.id == story.length) {
        window.location = '#/comp3';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'question';
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }
    }

    //Load component from JSON
    $http.get("json/comp2.json").then(function(response) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[0];

      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory <= 1) {
          $scope.displayMode = 'story';
        } else {
          $scope.displayMode = 'question';
        }
      }
      console.log($scope.displayMode);
    });
    /////////////////////////

  }])

  .controller('Comp3Ctrl', ['$scope', '$http', '$window', 'storeEvents', function($scope, $http, $window, storeEvents) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    $scope.confirmQuestion = function() {

      storeEvents.logResult('Component 3, Question ' + $scope.currentQuestion.id + ': ' + $scope.selectedAnswer);
      storeEvents.logEvent('Confirm answer', 3, $scope.currentQuestion.id)
      if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if (wrongAnswers == 3) {
          storeEvents.logResult('Three wrong answers in a row. Jumping to component 4.');
          $window.location = '#/comp4';
        }
      }

      $scope.selectedAnswer = 0;

      if ($scope.currentQuestion.id < numberOfQuestions) {
        $scope.currentQuestion = allQuestions[$scope.currentQuestion.id];
        $scope.showQuestionImg = true;
        if ($scope.currentQuestion.id == nextStory) {
          $scope.displayMode = 'story';
        } else $scope.showAnswers = false;
      } else $scope.displayMode = 'story';

    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent('Select answer ' + ans, 3, $scope.currentQuestion.id);
    }

    $scope.continueStory = function() {
      if ($scope.currentStory.id == story.length) {
        window.location = '#/comp4';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'question';
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }
    }

    //Load component from JSON
    $http.get("json/comp3.json").then(function(response) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[0];

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

  .controller('Comp4Ctrl', ['$scope', '$http', 'storeEvents', function($scope, $http, storeEvents) {
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
      storeEvents.logEvent('Select choice ' + ch, 4, $scope.currentChoice.id);
      if (ch == 'A') $scope.currentQuestion = $scope.currentChoice.questionA;
      else $scope.currentQuestion = $scope.currentChoice.questionB;
      $scope.displayMode = 'question';
    }

    $scope.confirmQuestion = function() {
      storeEvents.logResult('Component 4, Question ' + $scope.currentQuestion.id + ': ' + $scope.selectedAnswer);
      storeEvents.logEvent('Confirm answer', 4, $scope.currentChoice.id)
      if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if (wrongAnswers == 3) {
          storeEvents.logResult('Three wrong answers in a row. Jumping to component 5.');
          $window.location = '#/comp5';
        }
      }

      $scope.selectedAnswer = 0;

      if ($scope.currentChoice.id < numberOfQuestions) {
        $scope.currentChoice = allChoices[$scope.currentChoice.id];
        $scope.showQuestionImg = true;
        if ($scope.currentChoice.id == nextStory) {
          $scope.displayMode = 'story';
        } else $scope.displayMode = 'choice';
      } else $scope.displayMode = 'story';
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent('Select answer ' + ans, 4, $scope.currentChoice.id);
    }

    $scope.continueStory = function() {
      if ($scope.currentStory.id == story.length) {
        window.location = '#/comp5';
      } else {
        if (($scope.currentStory.location != story[$scope.currentStory.id].location) && $scope.currentStory.location <= numberOfQuestions) {
          $scope.displayMode = 'choice';
        }
        $scope.currentStory = story[$scope.currentStory.id];
        nextStory = $scope.currentStory.location;
      }
    }

    //Load component from JSON
    $http.get("json/comp4.json").then(function(response) {
      allChoices = response.data.choices;
      story = response.data.story;
      numberOfQuestions = allChoices.length;
      $scope.currentChoice = allChoices[0];

      if (story.length > 0) {
        $scope.currentStory = story[0];
        nextStory = story[0].location;
        if (nextStory == 1) {
          $scope.displayMode = 'story';
        } else {
          $scope.displayMode = 'choice';
        }
      }
    });
    /////////////////////////

  }])

  .controller('Comp5Ctrl', ['$scope', '$http', '$window', 'storeEvents', function($scope, $http, $window, storeEvents) {
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
    }

    $scope.confirmQuestion = function() {
      if (typeof(allQuestions[currentId - 1].question2) === "undefined") {
        storeEvents.logResult('Component 5, Question ' + $scope.currentQuestion.id + ': ' + $scope.selectedAnswer);
        storeEvents.logEvent('Confirm answer', 5, $scope.currentQuestion.id);
        if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer1) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            storeEvents.logResult('Three wrong answers in a row. Jumping to component 6.');
            $window.location = '#/comp6';
          }
        }
        nextQuestion();

      } else if ($scope.currentQuestion.question == allQuestions[currentId - 1].question1) {
        answerQ1 = $scope.selectedAnswer;
        storeEvents.logEvent('Question A: Confirm answer', 5, $scope.currentQuestion.id);
        storeEvents.logResult('Component 5, Question ' + $scope.currentQuestion.id + ' a: ' + $scope.selectedAnswer);
        $scope.selectedAnswer = 0;
        $scope.currentQuestion.question = allQuestions[currentId - 1].question2;
      } else {
        storeEvents.logResult('Component 5, Question ' + $scope.currentQuestion.id + ' b: ' + $scope.selectedAnswer);
        storeEvents.logEvent('Question B: Confirm answer', 5, $scope.currentQuestion.id);
        if (answerQ1 == allQuestions[currentId - 1].correctAnswer1 && $scope.selectedAnswer == allQuestions[currentId - 1].correctAnswer2) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            alert("Abbruch");
          }
        }
        nextQuestion();
      }
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent('Select answer ' + ans, 5, $scope.currentQuestion.id);
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
    }

    //Load component from JSON
    $http.get("json/comp5.json").then(function(response) {
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

  .controller('ResultsCtrl', ['$scope', 'storeEvents', function($scope, storeEvents) {
    $scope.saveResults = function() {
      storeEvents.saveEvents();
    }

    $scope.saveSensor = function() {
      storeEvents.saveSensor();
    }

    $scope.showResults = function() {
      console.log(storeEvents.results.join('\n'));
    }
  }])

  .controller('Comp6Ctrl', ['$scope', '$http', '$window', 'storeEvents', function($scope, $http, $window, storeEvents) {
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
    }

    $scope.confirmQuestion = function() {
      if (typeof(allQuestions[currentId - 1].question2) === "undefined") {
        storeEvents.logResult('Component 6, Question ' + $scope.currentQuestion.id + ': ' + $scope.selectedAnswer);
        storeEvents.logEvent('Confirm answer', 6, $scope.currentQuestion.id);
        if ($scope.selectedAnswer == $scope.currentQuestion.correctAnswer1) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            storeEvents.logResult('Three wrong answers in a row. Test was stopped.');
            $window.location = '#/results';
          }
        }
        nextQuestion();

      } else if ($scope.currentQuestion.question == allQuestions[currentId - 1].question1) {
        answerQ1 = $scope.selectedAnswer;
        storeEvents.logEvent('Question A: Confirm answer', 6, $scope.currentQuestion.id);
        storeEvents.logResult('Component 6, Question ' + $scope.currentQuestion.id + ' a: ' + $scope.selectedAnswer);
        $scope.selectedAnswer = 0;
        $scope.currentQuestion.question = allQuestions[currentId - 1].question2;
      } else {
        storeEvents.logResult('Component 6, Question ' + $scope.currentQuestion.id + ' b: ' + $scope.selectedAnswer);
        storeEvents.logEvent('Question B: Confirm answer', 6, $scope.currentQuestion.id);
        if (answerQ1 == allQuestions[currentId - 1].correctAnswer1 && $scope.selectedAnswer == allQuestions[currentId - 1].correctAnswer2) {
          wrongAnswers = 0;
        } else {
          wrongAnswers++;
          if (wrongAnswers == 3) {
            alert("Abbruch");
          }
        }
        nextQuestion();
      }
    }

    $scope.selectAnswer = function(ans) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent('Select answer ' + ans, 5, $scope.currentQuestion.id);
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
    }

    //Load component from JSON
    $http.get("json/comp6.json").then(function(response) {
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

  .controller('ResultsCtrl', ['$scope', 'storeEvents', function($scope, storeEvents) {
    $scope.saveEvents = function() {
      storeEvents.saveEvents();
    }

    $scope.saveSensor = function() {
      storeEvents.saveSensor();
    }

    $scope.saveResults = function() {
      storeEvents.saveResults();
    }
  }])

  .controller('StartCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.normalClick = function() {
      window.location = '#/intro';
    }

    $scope.presentationClick = function() {
      $rootScope.presentationMode = true;
      window.location = '#/intro';
    }
  }])

;