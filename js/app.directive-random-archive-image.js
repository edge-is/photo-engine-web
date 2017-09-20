
function directiveRandomArchiveImage($http, $compile){
  return {
    restrict : 'ACE',
    template : function (elem, attrs){
      return '<div class="carousel slide archives-carousel random-image-carousel" data-ride="carousel"><div class="carousel-inner" role="listbox"><div class="item active"><img class="archives-random-image" ng-src="{{selectedImage}}"><div class="carousel-caption"><h5>{{archive_name}}</h5></div></div></div></div>';
    },
    replace : true,
    link : function ($scope, element, attrs){
      /*$scope.availableImages=[];
      $scope.archive_name = attrs.archiveName;
      $scope.image_name = "";
      var url = [config.api, '/random/archives?archive_id=', attrs.archive  ].join('')
      $http.get(url).success(function (response){
        $scope.availableImages = response.data.hits;
        var selected = response.data.hits.pop();
        if (!selected){
          var container = $(element).closest('.random-archive-images-container');
          return container.addClass('hidden');
        }

        $scope.image_name = selected._id;
        $scope.selectedArchiveImage = selected._source.cdn1.small;
        $scope.selectedImage = $scope.selectedArchiveImage;
        $compile(element)($scope);
      });*/

      console.log($scope, element, attrs)
    },
  }
}
