/**
 * Controller for Archive Listing
 */

function archiveListingController($scope, $http, $rootScope){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.items = [];

  $scope.images = [];

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    window.location = '/search.html?query=' + query;
  };

  $scope.query = "";

  $scope.queryObject = {};
  $scope.lastField = "";

  $scope.order = [
    { field : "Source.raw" ,         name:false, value: false, filter : false },
    { field : "UserDefined4.raw" ,   name:false, value: false, filter : { field : "Source.raw"} },
    { field : "UserDefined12.raw" ,  name:false, value: false, filter : { field : "UserDefined4.raw"} },
    { field : "ReferenceNumber.raw", name:false, value: false, filter : { field : "UserDefined12.raw"} }
  ];

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

  $scope.setField = function (index){

    for (var i = (index + 1); i < $scope.order.length; i++){
      $scope.order[i].name = false;
    }

    $scope.getField(index);
  }

  $scope.setActive = function (index){
    var v = $scope.order[index +1 ];
    if (!v) return true;

    if (!v.name) return true;
    return false;

  }

  function getDir(order){
    var arr = order.filter(function (item){
      return (item.name);
    }).map(function (item){
      return item.name;
    });

    return arr.join('/');
  }

  $scope.next = function (value){

    var index = findIndex($scope.order, $scope.currentFieldObject);

    if (index === -1) return console.log('WOW');

    $scope.order[index].name = value;

    index++;

    var dir = getDir($scope.order);

    if (!$scope.order[index]){

      var location = '/displayarchive.html?f='+$scope.lastField+'&archive=' + value;

      return window.location = location + '&dir=' +dir;
    }

    $scope.order[index].value = value;

    $scope.lastField = value;


    $scope.getField(index);

  }

  $scope.currentFieldObject = false;



  $scope.getField = function(index){
    var obj = $scope.order[index];

    console.log(obj, index);

    var field = obj.field;

    $scope.currentFieldObject = obj;
    var url = [config.api, '/es/midlunarverkefni2/archives/_search'].join('');


    var aggr = bodybuilder()
            .agg('terms', field, {}, field);


    if (obj.filter){
      aggr.filter('term', obj.filter.field, obj.value);
    }

    aggr.build('v2');

    $http({
      url : url,
      data : aggr.build('v2'),
      method : 'POST'
    }).then(function (res){

      console.log('D', $scope.order);

      console.log(res);
      $scope.items = res.data.aggregations[field].buckets;

    });
  }



  $scope.getField(0);



}
