

search.factory('imageCache', factorySharedImages);
function factorySharedImages(){
    return {
      startUrl : "/",
      index : null,
      image :null,
      images : [],
      loaded : false
    };
}
