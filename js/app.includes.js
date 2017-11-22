

search.run( ['$rootScope', '$location', '$log', 'utils', applicationRun]);
search.service('photoApi',[ '$http','$q', 'utils', '$log', photoApiService]);
search.service('osm', ['map', serviceOSM]);
search.service('elasticsearch', ['$http', '$rootScope', serviceElasticsearch]);

search.service('loadElasticQuery', [serviceLoadElasticQuery]);

search.factory('cacheFactory', ['$cacheFactory', cacheFactory]);
search.service('utils', serviceUtils);

search.service('cdn', serviceCDN);

search.service('createQuery', serviceCreateElasticQuery);

search.controller('image', [ '$scope', '$location', 'elasticsearch', 'cacheFactory', '$rootScope', 'osm','$window', imageController]);
search.controller('mainSearch', ['$scope','photoApi', '$location', '$anchorScroll', '$uibModal', '$rootScope', 'utils', '$timeout', '$log', mainSearchController]);
search.controller('archivesGroupping', ['$scope', 'elasticsearch','$rootScope','utils', archiveGrouppingController]);
search.controller('archiveListing', ['$scope', 'elasticsearch', '$rootScope','$location', 'utils',  archiveListingController]);

search.controller('searchImages', ['$scope', 'elasticsearch', '$rootScope', '$log', 'cdn', 'utils', '$location','$uibModal', '$window', 'createQuery', controllerSearchImages])

search.controller('tmpCarousel', ['$scope', '$http',  archiveImageCarousel]);

search.controller('imageModalController', [ '$scope','$location','$modalInstance','data','hotkeys','$rootScope','osm', imageModalController ]);
search.controller('index', ['$scope','$window', indexController]);
search.controller('displayArchive', ['$scope', 'elasticsearch', '$location', '$timeout','$rootScope', '$uibModal', 'utils', 'cdn', controllerDisplayArchive]);
search.controller('thumbnailsModal', ['$scope', '$modalInstance','data', controllerThumbnailsModal]);
search.controller('navbar', ['$scope',  controllerNavbar]);

search.directive('notifyDevelopment', ['$log',  '$cookies', 'ngNotify', developmentDirective]);
search.directive('navbarTypeaheadSearch', ['elasticsearch', '$rootScope', 'utils', navbarTypeaheadDirective]);
search.directive('randomArchiveImage', ['$http','$compile',  directiveRandomArchiveImage] );
search.directive('aggrigate', ['$http', 'utils', '$rootScope', 'photoApi', '$log','$location','$timeout', directiveAggrigates]);
search.directive('inView', ['$window', directiveInView]);
//search.directive('backgroundImage', ['cdn', directiveBackgroundImage]);
search.directive('lazyimg', ['$timeout', 'cdn', directiveLazyImage]);
search.directive('fullscreenImage', ['$timeout', directiveFullscreenImage]);
search.directive('poeTarget', [directiveTarget]);
search.directive('archiveImage', ['elasticsearch', 'cdn', 'createQuery', directiveArchiveImage]);
search.directive('cdnImage', ['cdn', cdnImage]);

search.directive('elasticsearch', ['elasticsearch', '$rootScope', directiveElasticsearch]);
