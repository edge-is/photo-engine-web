/**
 * Controller for Archive Listing
 */

function archiveListingController($scope, $http){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.items = [];

  $scope.images = [];

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    window.location = '/search.html?query=' + query;
  };

  $scope.query = "";

  $scope.queryObject = {};
  $scope.lastField = "";

  function findIndex(arr, obj){

    var key = Object.keys(obj).pop();

    var index = false;


    arr.forEach(function (item, i){
      if (item[key] === obj[key]) {
        index = i;
      }
    });

    return index;
  }

  $scope.next = function (value){

    var index = findIndex($scope.order, $scope.currentFieldObject);

    if (index === -1) return console.log('WOW');

    index++;

    var field = $scope.order[index];

    if (!field){
      return window.location = '/displayarchive.html?f='+$scope.lastField+'&archive=' + value;
    }

    $scope.lastField = value;



    field.filter.value = value;

    $scope.getField(field);

  }

  $scope.currentFieldObject = false;

  $scope.order = [
    { field : "Source.raw" ,          filter : false },
    { field : "UserDefined4.raw" ,    filter : { field : "Source.raw", value : "" } },
    { field : "UserDefined12.raw" ,   filter : { field : "UserDefined4.raw", value : "" } },
    { field : "ReferenceNumber.raw",  filter : { field : "UserDefined12.raw", value : "" } }
  ];


  $scope.getField = function(obj){
    console.log(obj);
    var field = obj.field;


    $scope.currentFieldObject = obj;
    var url = [config.api, '/es/midlunarverkefni2/archives/_search'].join('');


    var aggr = bodybuilder()
            .agg('terms', field, {}, field);


    if (obj.filter){
      aggr.filter('term', obj.filter.field, obj.filter.value);
    }

    aggr.build('v2');

    $http({
      url : url,
      data : aggr.build('v2'),
      method : 'POST'
    }).then(function (res){

      console.log(res);
      $scope.items = res.data.aggregations[field].buckets;

    });
  }



  $scope.getField($scope.order[0]);



}
