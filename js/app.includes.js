

search.run( ['$rootScope', '$location', '$log', applicationRun]);
search.service('photoApi',[ '$http','$q', 'utils', '$log', photoApiService]);
search.service('osm', ['map', serviceOSM]);
search.controller('image', [ '$scope', '$location', 'photoApi', 'cacheFactory', '$rootScope', 'osm','$window', imageController]);
search.controller('mainSearch', ['$scope','photoApi', '$location', '$anchorScroll', '$uibModal', '$rootScope', 'utils', '$timeout', '$log', mainSearchController]);
search.controller('archives', ['$scope', '$http',  archiveController]);
search.controller('archiveListing', ['$scope', 'elasticsearch', '$rootScope','$location',  archiveListingController]);

search.controller('tmpCarousel', ['$scope', '$http',  archiveImageCarousel]);

search.controller('imageModalController', [ '$scope','$location','$modalInstance','data','hotkeys','$rootScope','osm', imageModalController ]);
search.controller('index', ['$scope','$window', indexController]);
search.directive('notifyDevelopment', ['$log',  '$cookies', 'ngNotify', developmentDirective]);
search.directive('typeaheadSearch', ['photoApi', '$rootScope', typeaheadDirective]);
search.directive('randomArchiveImage', ['$http','$compile',  directiveRandomArchiveImage] );
search.directive('aggrigate', ['$http', 'utils', '$rootScope', 'photoApi', '$log','$location','$timeout', directiveAggrigates]);
search.directive('inView', ['$window', directiveInView]);
search.directive('backgroundImage', [directiveBackgroundImage]);
search.directive('lazyimg', ['$timeout', directiveLazyImage]);
search.directive('fullscreenImage', ['$timeout', directiveFullscreenImage]);

search.controller('displayArchive', ['$scope', 'elasticsearch', '$location', '$timeout','$rootScope', controllerDisplayArchive]);

search.service('elasticsearch', ['$http', serviceElasticsearch]);


search.factory('cacheFactory', ['$cacheFactory', cacheFactory]);
