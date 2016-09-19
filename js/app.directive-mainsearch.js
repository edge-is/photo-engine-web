// search.directive('typeaheadsearch', typeaheadDirective);
//
// function typeaheadDirective(){
//   return {
//     restrict : 'ACE',
//     scope : {
//       enabled: "&MainSearchHidden"
//     },
//
//     transclude : true,
//     // template : function (elem, attrs, sc){
//     //   console.log(elem, attrs, sc);
//     //   if(attrs.enabled === "") return "";
//     //   return "HELLO";
//     //   return '<form class="navbar-main-search navbar-form" ng-hide="(MainSearchHidden)" role="search"><div class="form-group"><input type="text" ng-focus="false" id="mainsearch" sf-typeahead options="TypeaheadOptions" datasets="TypeaheadEngineData" ng-model="MainSearch" class="form-control nav-search typeahead" placeholder="Search"></div><button type="submit" class="btn btn-default submit-search" ng-click="submitMainSearch()">Search</button><a href="#/advancedsearch.html" type="submit" class="btn btn-default a-nograyscale hidden-xs" ng-click="openAdvancedSearch()">Advanced</a></form>';
//     // },
//     link : function (scope, elem, attrs){
//       console.log(elem, scope, attrs);
//       return 'HELLO';
//     }
//     //template : ,
//   }
//
// };
