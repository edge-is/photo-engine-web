var search = angular.module('search', [
  'siyfion.sfTypeahead',
  'ui.bootstrap',
  'ngRoute',
  'nemLogging',
  'leaflet-directive',
  'cfp.hotkeys',
  'ui.select',
  'ngSanitize',
  'angularScroll'
]);

search.run( ['$rootScope', '$location', function ($rootScope, $location) {
  var allowModalsInControllers = ['imageLinked'];

  $rootScope.history = [];
  $rootScope.$on('$routeChangeSuccess', function(ev, data) {

    if (data.$$route){

      if (allowModalsInControllers.indexOf(data.$$route.controller) === -1){

        var d = {};
        d.modal = angular.element('.modal'),
        d.nodalBackdrop = angular.element('.modal-backdrop');
        for (var key in d){
          if (d[key].length > 0){
           d[key].remove();
          }
        }
      }
    }
    $rootScope.history.push($location.$$path);
  });
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
