

search.run( ['$rootScope', '$location',applicationRun]);
search.service('photoApi',[ '$http','$q', 'utils', '$log', photoApiService]);
search.service('osm', ['map', serviceOSM]);
search.controller('image', [ '$scope', '$location', 'photoApi', 'cacheFactory', '$rootScope', 'osm','$window', imageController]);
search.controller('mainSearch', ['$scope','photoApi', '$location', '$anchorScroll', '$uibModal', '$rootScope', 'utils', mainSearchController]);
search.controller('archives', ['$scope', '$http',  archiveController]);
search.controller('imageModalController', [ '$scope','$location','$modalInstance','data','hotkeys','$rootScope','osm', imageModalController ]);
search.controller('index', ['$scope','$window', indexController]);
search.directive('notifyDevelopment', ['$log',  '$cookies', 'ngNotify', developmentDirective]);
search.directive('typeaheadSearch', ['photoApi', '$rootScope', typeaheadDirective]);
search.directive('randomArchiveImage', ['$http','$compile',  directiveRandomArchiveImage] );
search.directive('filterList', ['$http', 'utils', '$rootScope', 'photoApi', directiveFilterList]);
search.directive('inView', ['$window', directiveInView]);
search.directive('backgroundImage', [directiveBackgroundImage]);
search.directive('lazyimg', ['$timeout', directiveLazyImage]);


search.factory('cacheFactory', ['$cacheFactory', cacheFactory]);
