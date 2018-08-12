angular.module( 'ATEM-App', [ 'ngRoute', 'ATEM-App.services', 'ATEM-App.controllers' ] )
  .config( function( $routeProvider ) {
    $routeProvider
      .when( '/', {
        controller: 'IntroCtrl',
        templateUrl: 'views/intro.html'
      } )

      .when( '/comp1', {
        controller: 'Comp1Ctrl',
        templateUrl: 'views/comp1.html'
      } )

      .when( '/comp2', {
        controller: 'Comp2Ctrl',
        templateUrl: 'views/comp2_3.html'
      } )

      .when( '/comp3', {
        controller: 'Comp3Ctrl',
        templateUrl: 'views/comp2_3.html'
      } )

      .when( '/comp4', {
        controller: 'Comp4Ctrl',
        templateUrl: 'views/comp4.html'
      } )

      .when( '/comp5', {
        controller: 'Comp5Ctrl',
        templateUrl: 'views/comp5_6.html'
      } )

      .when( '/comp6', {
        controller: 'Comp6Ctrl',
        templateUrl: 'views/comp5_6.html'
      } )

      .when( '/results', {
        controller: 'ResultsCtrl',
        templateUrl: 'views/results.html'
      } )

      .when( '/introduction', {
        controller: 'IntroCtrl',
        templateUrl: 'views/introduction.html'
      } )

      .otherwise( {
        redirectTo: '/'
      } );
  } );