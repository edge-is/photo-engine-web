
function serviceImage($http){
  return {
    getImageByID : function (id){
        var url = [config.api, '/image/', id].join('');
        return $http.get(url);
    }
  }
}
