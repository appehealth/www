angular.module( 'ATEM-App.controllers', [] )

  .controller( 'StartCtrl', [ '$scope', '$rootScope', function( $scope, $rootScope ) {
    $scope.start = function( presentationMode ) {
      $rootScope.presentationMode = presentationMode;
      $rootScope.code = $scope.code_1 + $scope.code_2 + $scope.code_3 + $scope.code_4 + $scope.code_5;
      console.log( $rootScope.code );
      window.location = '#/intro';
    }
  } ] )

  .controller( 'IntroCtrl', [ '$scope', '$rootScope', 'fileService', 'audioService', 'compService', function( $scope, $rootScope, fileService, audioService, compService ) {
    var part2 = false;
    var img1, img2;
    var audio = [];
    var d = new Date();
    var y = d.getFullYear();
    var code = "";
    $scope.birthdayYears = [];
    for ( i = y - 30; i <= y; i++ ) {
      $scope.birthdayYears.push( i );
    }
    $scope.language = 'keine andere Sprache';
    $scope.day = 'Tag';
    $scope.month = 'Monat';
    $scope.year = 'Jahr';
    $scope.gender = 'undefined';
    $scope.buttonCaption = 'Weiter';
    $scope.isGerman = true;

    fileService.requestFS();
    compService.setRootScope( $rootScope );

    compService.loadJson( "intro" ).then( function( response ) {
      img1 = response.data.img1;
      img2 = response.data.img2;
      $scope.introImg = img1;
      audio = response.data.audio;
    } );

    $scope.repeatAudio = function() {
      if ( part2 )
        audioService.repeatAudio( audio[ 1 ] );
      else audioService.repeatAudio( audio[ 0 ] );
    }

    $scope.startStory = function() {
      window.location = '#/introduction';
      if ( $scope.isGerman )
        $scope.language = "Deutsch und " + $scope.language;
      console.log( $scope.language );
      fileService.logStart( parseInt( $scope.day ), $scope.monthID, $scope.year, $scope.gender, $scope.language, $rootScope.code );
      audioService.playAudio( audio[ 0 ] );
    }

    $scope.startComp1 = function() {
      if ( part2 ) {
        audioService.stopAudio();
        window.location = '#/comp1';
        //fileService.startSensor();
      } else {
        audioService.stopAudio();
        audioService.playAudio( audio[ 1 ] );
        part2 = true;
        $scope.introImg = img2;
        $scope.buttonCaption = 'Start';
        window.scrollTo( 0, 0 );
      }
    }
  } ] )

  .controller( 'Comp1Ctrl', [ '$scope', '$rootScope', 'audioService', 'compService', 'fileService', function( $scope, $rootScope, audioService, compService, fileService ) {
    var numberOfQuestions = 0;
    $scope.allQuestions = [];
    $rootScope.mistakes1_2 = 0;
    $rootScope.currentComp = 1;
    $scope.finished = false;
    compService.setScope( $scope );

    compService.loadJson( "comp1" ).then( function( response ) {
      $scope.allQuestions = response.data.questions;
      numberOfQuestions = $scope.allQuestions.length;
      $scope.currentQuestion = $scope.allQuestions[ 0 ];
      audioService.playAudio( $scope.currentQuestion.audio );
    } );

    $scope.selectAnswer = function( ans ) {
      compService.selectAnswer( ans );
    }

    $scope.repeatAudio = function() {
      audioService.repeatAudio( $scope.currentQuestion.audio[ 0 ] );
    }

    $scope.nextQuestion = function() {
      compService.nextQuestion();
    }

  } ] )

  .controller( 'Comp2Ctrl', [ '$scope', '$rootScope', 'audioService', 'compService', 'fileService', function( $scope, $rootScope, audioService, compService, fileService ) {
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    $scope.nextStory = 0;
    $scope.allQuestions = [];
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;
    $rootScope.currentComp = 2;
    compService.setScope( $scope );

    $scope.confirmQuestion = function() {
      compService.nextQuestion( $scope.nextStory );
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio( $scope.currentQuestion.audio[ 1 ] );
    }

    $scope.selectAnswer = function( ans ) {
      compService.selectAnswer( ans );
    }

    $scope.repeatAudio = function() {
      if ( $scope.displayMode == 'story' ) {
        audioService.repeatAudio( $scope.currentStory.audio );
      } else {
        audioService.repeatAudio( $scope.currentQuestion.audio[ 0 ] )
      }
    }

    $scope.continueStory = function() {
      audioService.stopAudio();
      $scope.displayMode = 'question';
      audioService.playAudio( $scope.currentQuestion.audio[ 0 ] );
      $scope.currentStory = story[ $scope.currentStory.id ];
      $scope.nextStory = $scope.currentStory.location;
      window.scrollTo( 0, 0 );
    }

    //Load component from JSON
    compService.loadJson( "comp2" ).then( function( response ) {
      $scope.allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = $scope.allQuestions.length;
      $scope.currentQuestion = $scope.allQuestions[ 0 ];

      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        $scope.nextStory = story[ 0 ].location;
        if ( $scope.nextStory <= 1 ) {
          $scope.displayMode = 'story';
          audioService.playAudio( $scope.currentStory.audio );
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.audio[ 0 ] );
        }
      }
      console.log( $scope.displayMode );
    } );
    /////////////////////////

  } ] )

  .controller( 'Comp3Ctrl', [ '$scope', '$rootScope', 'fileService', 'compService', 'audioService', function( $scope, $rootScope, fileService, compService, audioService ) {
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    var showAnswers = false;
    $scope.nextStory = 0;
    $scope.allChoices = [];
    $rootScope.mistakes3_6 = 0;
    $scope.selectedAnswer = 0;
    $scope.showChoiceImg = true;
    $scope.showQuestionImg = true;
    $rootScope.currentComp = 3;
    compService.setScope( $scope );

    $scope.btnChoice = function( ch ) {
      audioService.stopAudio();
      fileService.logEvent( 'Select choice ', ch, 3, $scope.currentChoice.id );
      if ( ch == 'A' ) $scope.currentQuestion = $scope.currentChoice.questionA;
      else $scope.currentQuestion = $scope.currentChoice.questionB;
      $scope.displayMode = 'question';
      audioService.playAudio( $scope.currentQuestion.audio[ 0 ] );
      window.scrollTo( 0, 0 );
    }

    $scope.repeatAudio = function() {
      switch ( $scope.displayMode ) {
        case 'story':
          audioService.repeatAudio( $scope.currentStory.audio );
          break;
        case 'question':
          audioService.repeatAudio( $scope.currentQuestion.audio[ 0 ] );
        case 'choice':
          audioService.repeatAudio( $scope.currentChoice.choiceAudio );
          break;
      }
    }

    $scope.confirmQuestion = function() {
      compService.nextQuestion( $scope.nextStory );
    }

    $scope.selectAnswer = function( ans ) {
      compService.selectAnswer( ans );
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio( $scope.currentQuestion.audio[ 1 ] );
    }

    $scope.continueStory = function() {
      audioService.stopAudio();

      if ( $scope.currentStory.id == story.length ) {
        window.location = '#/comp4';
      } else {
        if ( ( $scope.currentStory.location != story[ $scope.currentStory.id ].location ) && $scope.currentStory.location <= numberOfQuestions ) {
          $scope.displayMode = 'choice';
          audioService.playAudio( $scope.currentChoice.choiceAudio );
        } else {
          audioService.playAudio( story[ $scope.currentStory.id ].audio );
        }
        $scope.currentStory = story[ $scope.currentStory.id ];
        $scope.nextStory = $scope.currentStory.location;
      }

      window.scrollTo( 0, 0 );
    }

    compService.loadJson( "comp3" ).then( function( response ) {
      $scope.allChoices = response.data.choices;
      story = response.data.story;
      numberOfQuestions = $scope.allChoices.length;
      $scope.currentChoice = $scope.allChoices[ 0 ];

      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        $scope.nextStory = story[ 0 ].location;
        if ( $scope.nextStory == 1 ) {
          $scope.displayMode = 'story';
          audioService.playAudio( $scope.currentStory.audio );
        } else {
          $scope.displayMode = 'choice';
          audioService.playAudio( $scope.currentChoice.choiceAudio );
        }
      }
    } )

  } ] )

  .controller( 'Comp4Ctrl', [ '$scope', '$rootScope', 'fileService', 'compService', 'audioService', function( $scope, $rootScope, fileService, compService, audioService ) {
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    $scope.nextStory = 0;
    $scope.allQuestions = [];
    $rootScope.mistakes3_6 = 0;
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;
    $rootScope.currentComp = 4;
    compService.setScope( $scope );

    $scope.confirmQuestion = function() {
      compService.nextQuestion( $scope.nextStory );
    }

    $scope.selectAnswer = function( ans ) {
      compService.selectAnswer( ans );
    }

    $scope.repeatAudio = function() {
      if ( $scope.displayMode == 'story' ) {
        audioService.repeatAudio( $scope.currentStory.audio );
      } else {
        audioService.repeatAudio( $scope.currentQuestion.audio[ 0 ] )
      }
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio( $scope.currentQuestion.audio[ 1 ] );
    }

    $scope.continueStory = function() {
      audioService.stopAudio();
      if ( $scope.currentStory.id == story.length ) {
        window.location = '#/comp5';
      } else {
        if ( ( $scope.currentStory.location != story[ $scope.currentStory.id ].location ) && $scope.currentStory.location <= numberOfQuestions ) {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.audio[ 0 ] );
        }
        $scope.currentStory = story[ $scope.currentStory.id ];
        $scope.nextStory = $scope.currentStory.location;
      }

      window.scrollTo( 0, 0 );
    }

    //Load component from JSON
    compService.loadJson( "comp4" ).then( function( response ) {
      $scope.allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = $scope.allQuestions.length;
      $scope.currentQuestion = $scope.allQuestions[ 0 ];

      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        $scope.nextStory = story[ 0 ].location;
        if ( $scope.nextStory == 1 ) {
          $scope.displayMode = 'story';
          audioService.playAudio( $scope.currentStory.audio );
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.audio[ 0 ] );
        }
      }
    } )

  } ] )

  .controller( 'Comp5Ctrl', [ '$scope', '$rootScope', 'fileService', 'compService', 'audioService', function( $scope, $rootScope, fileService, compService, audioService ) {
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    $scope.nextStory = 0;
    var answerQ1 = 0;
    var currentId = 1;

    compService.setScope( $scope );
    $scope.allQuestions = [];
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;
    $rootScope.currentComp = 5;

    $scope.repeatAudio = function() {
      if ( $scope.displayMode == 'story' ) {
        audioService.repeatAudio( $scope.currentStory.audio );
      } else {
        audioService.repeatAudio( $scope.currentQuestion.audio[ 0 ] )
      }
    }

    $scope.confirmQuestion = function() {
      compService.nextQuestion( $scope.nextStory );
    }

    $scope.selectAnswer = function( ans ) {
      compService.selectAnswer( ans );
    }

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio( $scope.currentQuestion.question.audio[ 1 ] );
    }

    $scope.continueStory = function() {
      audioService.stopAudio();
      if ( $scope.currentStory.id == story.length ) {
        window.location = '#/comp6';
      } else {
        if ( ( $scope.currentStory.location != story[ $scope.currentStory.id ].location ) && $scope.currentStory.location <= numberOfQuestions ) {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.question.audio[ 0 ] );
        } else {
          audioService.playAudio( $scope.currentStory.audio )
        }
        $scope.currentStory = story[ $scope.currentStory.id ];
        $scope.nextStory = $scope.currentStory.location;
      }

      window.scrollTo( 0, 0 );
    }

    //Load component from JSON
    compService.loadJson( "comp5" ).then( function( response ) {
      $scope.allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = $scope.allQuestions.length;
      $scope.currentQuestion = $scope.allQuestions[ 0 ];
      $scope.currentQuestion.question = $scope.allQuestions[ 0 ].question1;
      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        $scope.nextStory = story[ 0 ].location;
        if ( $scope.nextStory == 1 ) {
          $scope.displayMode = 'story';
          audioService.playAudio( $scope.currentStory.audio );
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.question.audio[ 0 ] );
        }
      }
    } );
    /////////////////////////

  } ] )

  .controller( 'Comp6Ctrl', [ '$scope', '$rootScope', 'fileService', 'compService', 'audioService', function( $scope, $rootScope, fileService, compService, audioService ) {
    var story = [];
    var numberOfQuestions = 0;
    var wrongAnswers = 0;
    $scope.nextStory = 0;
    var answerQ1 = 0;
    var currentId = 1;

    compService.setScope( $scope );
    $scope.allQuestions = [];
    $scope.selectedAnswer = 0;
    $scope.showQuestionImg = true;
    $rootScope.currentComp = 6;

    $scope.showQuestion = function() {
      audioService.stopAudio();
      $scope.showQuestionImg = false;
      audioService.playAudio( $scope.currentQuestion.question.audio[ 1 ] );
    }

    $scope.confirmQuestion = function() {
      compService.nextQuestion( $scope.nextStory );
    }

    $scope.repeatAudio = function() {
      if ( $scope.displayMode == 'story' ) {
        audioService.repeatAudio( $scope.currentStory.audio );
      } else {
        audioService.repeatAudio( $scope.currentQuestion.audio[ 0 ] )
      }
    }

    $scope.selectAnswer = function( ans ) {
      compService.selectAnswer( ans );
    }

    $scope.continueStory = function() {
      audioService.stopAudio();
      if ( $scope.currentStory.id == story.length ) {
        window.location = '#/results';
      } else {
        if ( ( $scope.currentStory.location != numberOfQuestions + 1 ) && $scope.currentStory.location <= numberOfQuestions ) {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.question.audio[ 0 ] );
        }
        $scope.currentStory = story[ $scope.currentStory.id ];
        $scope.nextStory = $scope.currentStory.location;
      }

      window.scrollTo( 0, 0 );
    }

    //Load component from JSON
    compService.loadJson( "comp6" ).then( function( response ) {
      $scope.allQuestions = response.data.questions;
      story = response.data.story;
      numberOfQuestions = $scope.allQuestions.length;
      $scope.currentQuestion = $scope.allQuestions[ 0 ];
      $scope.currentQuestion.question = $scope.allQuestions[ 0 ].question1;
      if ( story.length > 0 ) {
        $scope.currentStory = story[ 0 ];
        $scope.nextStory = story[ 0 ].location;
        if ( $scope.nextStory == 1 ) {
          $scope.displayMode = 'story';
          audioService.playAudio( $scope.currentStory.audio );
        } else {
          $scope.displayMode = 'question';
          audioService.playAudio( $scope.currentQuestion.question.audio[ 0 ] );
        }
      }
    } );
    /////////////////////////

  } ] )

  .controller( 'ResultsCtrl', [ '$scope', 'fileService', 'audioService', function( $scope, fileService, audioService ) {
    audioService.playAudio( "audio/Outro.mp3" );
    fileService.finishTest();

    $scope.returnToTitle = function() {
      audioService.stopAudio();
      window.location = '#/';
    }
  } ] )

;