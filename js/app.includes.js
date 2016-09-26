

search.service('photoApi',[ '$http','$q', 'utils', photoApiService]);
search.controller('image', [ '$scope', '$location', 'photoApi', 'cacheFactory', '$rootScope', 'osm', imageController]);
search.controller('mainSearch', ['$scope','photoApi', '$location', '$anchorScroll', '$uibModal', '$rootScope', 'utils', mainSearchController]);

search.directive('typeaheadSearch', ['suggester', '$rootScope', typeaheadDirective]);

search.factory('cacheFactory', ['$cacheFactory', cacheFactory]);

search.service('osm', ['map', serviceOSM]);
