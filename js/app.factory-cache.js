/**
 * Cache factory, for saving results
 */

function cacheFactory($cacheFactory){
  return {
    get : function getCacheByKey(object){
      var now = new Date().getTime();
      var cache = $cacheFactory.get(object);

      if (cache.__ttl){
        if (__cache.ttl < now){
          return false;
        }
      }

      if (cache.__value) return cache.__value;

      delete cache.__ttl;

      return cache;
    },
    put : function putCacheByKey(value, ttl){
      ttl = ttl || false;
      var cacheObject = value;
      if (typeof value === 'string'){
        cacheObject = {
          __value : value
        }
      }
      var now = new Date().getTime();
      var expires = now + ttl;


      cacheObject.__ttl = expires;
      return $cacheFactory.put(cacheObject);

    }
  }
}
