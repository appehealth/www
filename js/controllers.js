angular.module( 'App.controllers', [] )

  .controller( 'IntroCtrl', [ '$scope', '$window', 'storeEvents', function( $scope, $window, storeEvents ) {
    $scope.startStory = function() {
      storeEvents.logStart();
      $window.location = '#/comp1';
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

  .controller( 'Comp2Ctrl', [ '$scope', '$http', 'storeEvents', function( $scope, $http, storeEvents ) {
    var allQuestions = [];
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var results = [];
    var showAnswers = false;
    var nextStory = 0;
    $scope.selectedAnswer = 0;
    $scope.showAnswers = false;
    $scope.storyMode = false;

    function nextQuestion() {

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
        if ( $scope.currentQuestion.id == nextStory ) {
          $scope.storyMode = true;
        } else $scope.showAnswers = false;
      } else alert( "Ende" );

    }

    function continueStory() {
      storeEvents.logEvent( 'Continue', 2, $scope.currentQuestion.id );
      if ( $scope.storyMode ) {
        $scope.storyMode = false;
        $scope.showAnswers = false;
        if ( $scope.currentStory.id < story.length )
          $scope.currentStory = story[ $scope.currentStory.id ];
        nextStory = $scope.currentStory.location;
      } else $scope.showAnswers = true;

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
        $scope.storyMode = true;
      }
    } );
    /////////////////////////

    $scope.btnContinue = function() {
      if ( $scope.showAnswers ) nextQuestion();
      else continueStory();
    }

    $scope.selectAnswer = function( ans ) {
      $scope.selectedAnswer = ans;
      storeEvents.logEvent( 'Select answer ' + ans, 2, $scope.currentQuestion.id );
    }

  } ] )

  .controller( 'ResultsCtrl', [ '$scope', 'storeEvents', function( $scope, storeEvents ) {
    $scope.showResults = function() {
      storeEvents.showEvents();
    }
  } ] )

;