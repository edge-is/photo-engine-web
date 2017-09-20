function serviceCDN(){
  return {
    thumbnail : function (searchHit, size, cache){
      if (!searchHit) return "";
      size = size || 'medium';

      cache = cache || true;

      var thumbnails = searchHit._thumbnails;
      if (!thumbnails) {
        console.error('No thumbnails in object');
        return "";
      }



      var thumbnailPath = thumbnails[size];


      if (typeof thumbnailPath === 'object'){
        thumbnailPath = thumbnailPath.name;
      }

      var imageURI = [config.cdn.path, 'thumbnails', thumbnailPath];

      var uri = imageURI.join('/');

      if (cache) return uri;

      var now = new Date().getTime();

      var rand = ['?rand=', now] .join('');

      if (cache === false){
        return uri + rand;
      }

    }
  }
}
