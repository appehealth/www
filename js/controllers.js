angular.module( 'App.controllers', [] )

  .controller( 'IntroCtrl', [ '$scope', '$window', 'storeEvents', function( $scope, $window, storeEvents ) {
    var part2 = false;
    $scope.introText = 'Hallo! Ich möchte gerne mit Dir zusammen eine Geschichte lesen. In dieser Geschichte geht es um zwei Jungen. Sie heißen Tim und Ali. In der Geschichte besuchen Tim und Ali zusammen mit Tims Eltern einen Zoo. Wenn wir die Geschichte lesen, werde ich Dich sehr oft fragen, wie Tim und Ali sich fühlen. Auf dem Bildschirm sind dann die Gesichter von Tim und Ali zu sehen. Du sollst immer auf das Gesicht tippen, das so aussieht, wie Tim oder Ali sich fühlen. Wenn Du ein Gesicht ausgesucht und angetippt hast, tippst Du einfach unten rechts auf „Weiter“ und die Geschichte geht weiter. Es ist nicht schlimm, wenn Du nicht immer genau weißt, was Du antippen sollst. Wenn Du Dir nicht ganz sicher bist, welches Gesicht Du auswählen sollst, tippst Du einfach auf das Gesicht, von dem Du denkst, dass es am besten passt. Danach tippst Du auf „Weiter“.'
    $scope.startStory = function() {
      storeEvents.logStart();
      $window.location = '#/introduction';
    }

    $scope.startComp1 = function() {
      if ( part2 ) {
        $window.location = '#/comp1'
      } else {
        part2 = true;
        $scope.introText = 'Wenn Du schon auf ein Gesicht getippt hast aber danach denkst, dass Du doch lieber ein anderes nehmen möchtest, kannst Du einfach auf das andere tippen und danach auf „Weiter“. Wenn Du noch nicht auf „Weiter“ getippt hast, kannst Du Dich so oft umentscheiden wie Du möchtest. Wenn Du auf einer Seite die Geschichte oder die Frage noch einmal hören möchtest, kannst du einfach auf „Wiederholung“ tippen. Dann lese ich Dir die Geschichte und die Frage noch einmal vor. Ich lese sie Dir so oft vor wie Du möchtest. Wenn Du dann trotzdem noch eine Frage hast, hole am besten einen Erwachsenen. So, jetzt kann es losgehen. Tippe auf „Start“, wenn Du mit der Geschichte anfangen möchtest. Wenn Du diese Einleitung noch einmal hören möchtest, tippe auf „Wiederholung“. Falls Du noch eine Frage hast, hole am besten einen Erwachsenen.'
      }
    }
  } ] )

  .controller( 'Comp1Ctrl', [ '$scope', '$http', '$window', 'storeEvents', function( $scope, $http, $window, storeEvents ) {
    var allQuestions = [];
    var numberOfQuestions = 0;
    var results = [];
    $scope.nextBool = false;

    $http.get( "json/comp1.json" ).then( function( response ) {
      allQuestions = response.data.questions;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[ 0 ];
    } );

    $scope.selectAnswer = function( ans ) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent( 'Select answer ' + ans, 1, $scope.currentQuestion.id );
    }

    $scope.nextQuestion = function() {
      results[ results.length ] = $scope.selectedAnswer;
      $scope.selectedAnswer = 0;
      storeEvents.logEvent( 'Confirm answer', 1, $scope.currentQuestion.id );
      if ( $scope.currentQuestion.id < numberOfQuestions ) {
        $scope.currentQuestion = allQuestions[ $scope.currentQuestion.id ];
      } else {
        storeEvents.logEvent( 'Start component 2' )
        $window.location = '#/comp2';
      }
    }
  } ] )

  .controller( 'Comp2Ctrl', [ '$scope', '$http', '$window', 'storeEvents', function( $scope, $http, $window, storeEvents ) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var results = [];
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    $scope.confirmQuestion = function() {

      results[ results.length ] = $scope.selectedAnswer;
      storeEvents.logEvent( 'Confirm answer', 2, $scope.currentQuestion.id )
      if ( $scope.selectedAnswer == $scope.currentQuestion.correctAnswer ) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if ( wrongAnswers == 3 ) {
          alert( "Abbruch" );
        }
      }

      $scope.selectedAnswer = 0;

      if ( $scope.currentQuestion.id < numberOfQuestions ) {
        $scope.currentQuestion = allQuestions[ $scope.currentQuestion.id ];
        $scope.showQuestionImg = true;
        if ( $scope.currentQuestion.id == nextStory ) {
          $scope.storyMode = true;
        } else $scope.showAnswers = false;
      } else $window.location = '#/comp3';

    }

    $scope.selectAnswer = function( ans ) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent( 'Select answer ' + ans, 2, $scope.currentQuestion.id );
    }

    $scope.continueStory = function() {
      if ( $scope.currentStory.id == story.lenth ) {
        nextStory = 0;
      } else {
        $scope.currentStory = story[ $scope.currentStory.id ];
        nextStory = $scope.currentStory.location;
      }
      $scope.displayMode = 'question';
    }

    //Load component from JSON
    $http.get( "json/comp2.json" ).then( function( response ) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[ 0 ];

      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        nextStory = story[ 0 ].location;
        if ( nextStory == 1 ) {
          $scope.displayMode = 'story';
        } else {
          $scope.displayMode = 'question';
        }
      }
    } );
    /////////////////////////

  } ] )

  .controller( 'Comp3Ctrl', [ '$scope', '$http', '$window', 'storeEvents', function( $scope, $http, $window, storeEvents ) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var results = [];
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;

    $scope.confirmQuestion = function() {

      results[ results.length ] = $scope.selectedAnswer;
      storeEvents.logEvent( 'Confirm answer', 3, $scope.currentQuestion.id )
      if ( $scope.selectedAnswer == $scope.currentQuestion.correctAnswer ) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if ( wrongAnswers == 3 ) {
          alert( "Abbruch" );
        }
      }

      $scope.selectedAnswer = 0;

      if ( $scope.currentQuestion.id < numberOfQuestions ) {
        $scope.currentQuestion = allQuestions[ $scope.currentQuestion.id ];
        $scope.showQuestionImg = true;
        if ( $scope.currentQuestion.id == nextStory ) {
          $scope.storyMode = true;
        } else $scope.showAnswers = false;
      } else $window.location = '#/comp4';

    }

    $scope.selectAnswer = function( ans ) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent( 'Select answer ' + ans, 3, $scope.currentQuestion.id );
    }

    $scope.continueStory = function() {
      if ( $scope.currentStory.id == story.lenth ) {
        nextStory = 0;
      } else {
        $scope.currentStory = story[ $scope.currentStory.id ];
        nextStory = $scope.currentStory.location;
      }
      $scope.displayMode = 'question';
    }

    //Load component from JSON
    $http.get( "json/comp3.json" ).then( function( response ) {
      allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = allQuestions.length;
      $scope.currentQuestion = allQuestions[ 0 ];

      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        nextStory = story[ 0 ].location;
        if ( nextStory == 1 ) {
          $scope.displayMode = 'story';
        } else {
          $scope.displayMode = 'question';
        }
      }
    } );
    /////////////////////////

  } ] )

  .controller( 'Comp4Ctrl', [ '$scope', '$http', 'storeEvents', function( $scope, $http, storeEvents ) {
    var allChoices = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var results = [];
    var showAnswers = false;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showChoiceImg = true;
    $scope.showQuestionImg = true;

    $scope.btnChoice = function( ch ) {
      storeEvents.logEvent( 'Select choice ' + ch, 4, $scope.currentChoice.id );
      if ( ch == 'A' ) $scope.currentQuestion = $scope.currentChoice.questionA;
      else $scope.currentQuestion = $scope.currentChoice.questionB;
      $scope.displayMode = 'question';
    }

    $scope.confirmQuestion = function() {
      results[ results.length ] = $scope.selectedAnswer;
      storeEvents.logEvent( 'Confirm answer', 4, $scope.currentChoice.id )
      if ( $scope.selectedAnswer == $scope.currentQuestion.correctAnswer ) {
        wrongAnswers = 0;
      } else {
        wrongAnswers++;
        if ( wrongAnswers == 3 ) {
          alert( "Abbruch" );
        }
      }

      $scope.selectedAnswer = 0;

      if ( $scope.currentChoice.id < numberOfQuestions ) {
        $scope.currentChoice = allChoices[ $scope.currentChoice.id ];
        $scope.showQuestionImg = true;
        if ( $scope.currentChoice.id == nextStory ) {
          $scope.displayMode = 'story';
        } else $scope.displayMode = 'choice';
      } else alert( "Ende" );
    }

    $scope.selectAnswer = function( ans ) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent( 'Select answer ' + ans, 4, $scope.currentChoice.id );
    }

    $scope.continueStory = function() {
      if ( $scope.currentStory.id == story.lenth ) {
        nextStory = 0;
      } else {
        $scope.currentStory = story[ $scope.currentStory.id ];
        nextStory = $scope.currentStory.location;
      }
      $scope.displayMode = 'choice';
    }

    //Load component from JSON
    $http.get( "json/comp4.json" ).then( function( response ) {
      allChoices = response.data.choices;
      story = response.data.story;
      numberOfQuestions = allChoices.length;
      $scope.currentChoice = allChoices[ 0 ];

      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        nextStory = story[ 0 ].location;
        if ( nextStory == 1 ) {
          $scope.displayMode = 'story';
        } else {
          $scope.displayMode = 'choice';
        }
      }
    } );
    /////////////////////////

  } ] )

  .controller( 'ResultsCtrl', [ '$scope', 'storeEvents', function( $scope, storeEvents ) {
    $scope.saveResults = function() {
      storeEvents.saveEvents();
    }

    $scope.saveSensor = function() {
      storeEvents.saveSensor();
    }
  } ] )

;