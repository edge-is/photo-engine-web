var search = angular.module('search', [
  'siyfion.sfTypeahead',
  'ui.bootstrap',
  // 'ngRoute',
  'nemLogging',
  'leaflet-directive',
  'cfp.hotkeys',
  'ui.select',
  'ngSanitize',
  'angularScroll',
  'ngNotify',
  'ngCookies'
]);

search.run( ['$rootScope', '$location', function ($rootScope, $location) {
  var allowModalsInControllers = ['imageLinked'];

  $rootScope.history = [];

  $rootScope.oldPath = $location.$$path;
  $rootScope.$on('$locationChangeStart', function (event, data){
    $rootScope.oldPath = $location.$$path;
  });

  $rootScope.$on('$locationChangeSuccess', function(e, data) {
    var newPath = $location.$$path;

    var back = fromHistory(data);
    if (back){
      $rootScope.$emit('historyBack', back);
    }

    var myLastLocation = $rootScope.history[$rootScope.history.length -1];

    console.log($rootScope.modalOpen, newPath, myLastLocation);
    if ($rootScope.modalOpen){

      if (!myLastLocation) return;
      if (newPath !== myLastLocation.path){
        // close modal instance

        $rootScope.modalInstance.close();
      }

    }

    $rootScope.history.push({
      url : $location.$$url,
      path : $location.$$path,
      absUrl : $location.$$absUrl,
      params : $location.search()
    });


    function fromHistory(absURL){
      var found = false;
      var last = $rootScope.history[$rootScope.history.length - 2 ];
      if (!last) return false;
      if (last.absUrl === absURL) return last;
      return false;
    }
    // if (p ==)
    //window.location = state;

    // $route.reload();
    //window.location.reload();
    //$location.reload();
    // if (data.$$route){
    //   if (allowModalsInControllers.indexOf(data.$$route.controller) === -1){
    //     if($rootScope.modalInstance) {
    //       $rootScope.modalInstance.close();
    //     }
    //   }
    // }
    // $rootScope.history.push($location.$$path);
  });

  // $routeProvider.$on('$locationChangeSuccess', function (a,b,c){
  //   console.log('AF', a,b,c);
  // })


}]);

function parseJSON(string){
  try {
    return JSON.parse(string);
  } catch (e) {
    return false;
  }
}

var settings = {
  search: {
    fields : {
      "BitsPerSample": {
        "type": "long"
      },
      "CaptionWriter": {
        "type": "string"
      },
      "Category": {
        "type": "string"
      },
      "City": {
        "type": "string"
      },
      "ColorComponents": {
        "type": "long"
      },
      "ColorMode": {
        "type": "string"
      },
      "Comment": {
        "type": "string"
      },
      "Country": {
        "type": "string"
      },
      "Credit": {
        "type": "string"
      },
      "DateCreated": {
        "type": "date"
      },
      "Description": {
        "type": "string"
      },
      "Directory": {
        "type": "string"
      },
      "ExifImageHeight": {
        "type": "long"
      },
      "ExifImageWidth": {
        "type": "long"
      },
      "FileName": {
        "type": "string"
      },
      "FileType": {
        "type": "string"
      },
      "ImageHeight": {
        "type": "long"
      },
      "ImageWidth": {
        "type": "long"
      },
      "Instructions": {
        "type": "string"
      },
      "Keywords": {
        "type": "string"
      },
      "LocalCaption": {
        "type": "string"
      },
      "MIMEType": {
        "type": "string"
      },
      "ObjectName": {
        "type": "string"
      },
      "Orientation": {
        "type": "string"
      },
      "PhotometricInterpretation": {
        "type": "string"
      },
      "ProfileFileSignature": {
        "type": "string"
      },
      "ReleaseDate": {
        "type": "date"
      },
      "Rights": {
        "type": "string"
      },
      "Source": {
        "type": "string"
      },
      "SourceFile": {
        "type": "string"
      },
      "SpecialInstructions": {
        "type": "string"
      },
      "State": {
        "type": "string"
      },
      "Subject": {
        "type": "array"
      },
      "SupplementalCategories": {
        "type": "array"
      },
      "Title": {
        "type": "string"
      },
      "XResolution": {
        "type": "long"
      },
      "YResolution": {
        "type": "long"
      },
      "safn": {
        "type": "string"
      }
    }
  }
};
