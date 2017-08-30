function directiveArchiveImage(elasticsearch){
  return {
    restrict : 'ACE',
    template : function (elem, attrs){
      return  [
        '<div class="carousel slide archives-carousel es-selected-image-carousel" data-ride="carousel">',
          '<div class="carousel-inner" role="listbox"><div class="item active">',
            '<img class="es-selected-image" ng-src="{{selectedImage}}">',
              '<div class="carousel-caption">',
              '<h5>{{title}}</h5>',
              '</div>',
            '</div>',
          '</div>',
        '</div>'].join('');
    },
    replace : true,
    link : function ($scope, element, attrs){

      // index: [ 'random', 'index:number'];
      //console.log('X', $scope, element, attrs);

      var index = attrs.index;
      var type = attrs.type;

      $scope.selectedImage = "";

      $scope.title= attrs.title;

      var size = attrs.size || 'x-small';

      var _query = "";

      try {
        _query = JSON.parse(attrs.query);
      } catch (e) {
        _query = {
          type : 'match'

        };
        _query = attrs.query;

        console.error('---- NEED TO FIX THIS....');
      }


      var query = bodybuilder()
                  .query(_query.type, _query.field, _query.value )
                  .filter('term', _query.field, _query.value);


      /*if (attrs.select === 'random'){

        var seed =  Math.floor(Math.random() * 100);

        var filter = {}
        filter[_query.field] = _query.value;

        query = {
            "size":1,
            "query": {
                "function_score": {
                    "functions": [
                        {
                            "random_score":  {
                                "seed": seed
                            }
                        }
                    ],
                    "score_mode": "sum",
                }
            },
            "filter" : {
              "term" : filter
            }
        };
      };*/

      elasticsearch.search({
        index : index,
        type : type,
        body : query,
      }, function (err, res){
        if (err) return console.error('Error selecting image', err);

        if (!res.hits) return console.error('No hits in body');
        var hit = res.hits.hits.pop();

        var thumb = hit._source._thumbnails[size];
        $scope.selectedImage = [config.cdn, 'thumbnails', thumb.name].join('/');
      });
    }
  };
}
