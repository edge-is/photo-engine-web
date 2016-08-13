search.service('suggester', ['$http', serviceSuggester]);

function serviceSuggester($http){
  return function (query, filters, options){
    options = options || {};
    var apiURL = [config.api, '/search/suggest/phrase?'].join('');

    var url = options.url || apiURL;

    var uri = [url, 'filter=', filters, '&query=', query].join('');

    return $http.get(uri);
  };
}
