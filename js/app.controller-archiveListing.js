/**
 * Controller for Archive Listing
 */

function archiveListingController($scope, $http){
  var url = [config.api, '/aggregates/archive'].join('');
  $scope.items = [];

  $scope.onTypeaheadSubmit = function submitOnSearch(query){
    window.location = '/search.html?query=' + query;
  };

  $scope.query = "";

  $scope.queryObject = {};

  $scope.next = function (current){
      console.log(current);

      if (current === 'listPaper'){
        $scope.items = $scope.teams;
      }else if (current === 'listTeams'){
        $scope.items = $scope.teamArchives;
      }else if (current === 'teamArchives'){
        // display the archive
        //
        $scope.items = $scope.allPages;
      }
  }

  $scope.response = [];

  $scope.listPapers = [];

  $scope.paper = [];
  $scope.teams = [];

  $scope.teamArchives = [];

  $scope.allPages = [];

  // FIXME
  // Should get all uniq .. no hacking required..
  //
  //
  // First state is AvailableArchives -> Teams -> SelectTeam -> Select Paper
  $http.get('./temp-exif.json').success(function (response){
    $scope.response = response;

    var papers = getPapers(response);

    var teams = getTeams(response);

    var teamArchives = getTeamArchives(response);


    $scope.teamArchives = teamArchives;
    $scope.items = papers;
    $scope.teams = teams;

    $scope.allPages = getPages(response);
    console.log(allPages);
  });

  function getPages(arr){
    return arr.map(function (item){
      item.name = item.Description;
      return item;
    });
  }

  function getTeams(arr){
    var array = getUniqKeys(arr, 'UserDefined4');
    return array.map(function (name){
      return { name : name, type : 'listTeams' };
    });
  }
  function getTeamArchives(arr){
    var array = getUniqKeys(arr, 'Comment', ' ');
    return array.map(function (name){
      return { name : name, type : 'teamArchives' };
    });
  }
  //UserDefined4

  function getPapers(arr){

    var array = getUniqKeys(arr, 'Source');

    return array.map(function (name){
      return { name : name, type : 'listPaper' };
    })
  }

  function getUniqKeys(arr, keyname, split){
    var obj = {};

    split = split || ' ';

    arr.forEach(function (item){
      var key = selectKeys(item, keyname);

      if (Array.isArray(key)){
        key = key.join(split);
      }

      obj[key] = true;
    });

    return Object.keys(obj);
  }

  function selectKeys(object, keys){
    if (!Array.isArray(keys)){
      return object[keys];
    }
    var arr = [];
    return keys.map(function (key){
      return object[key];
    });



  }

}
