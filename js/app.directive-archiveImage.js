function directiveArchiveImage(elasticsearch, cdn){
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

      var index = attrs.index;
      var type = attrs.type;

      $scope.selectedImage = "";

      $scope.title= attrs.title;

      var size = attrs.size || 'x-small';

      var query = "";
      try {
        query = JSON.parse(attrs.query);
      } catch (e) {
        return console.error('Could not parse query', e);
      }

      if (attrs.querytype !== "elasticsearch"){
        query = bodybuilder()
          .filter('term', query.field, query.value);
      }

      var elasticsearchQuery = {
        index : index,
        type : type,
        body : query,
      };

      elasticsearch.search(elasticsearchQuery, function (err, res){
        if (err) return console.error('Error selecting image', err);


        if (!res.hits) return console.error('No hits in body');
        var hit = res.hits.hits.pop();

        $scope.selectedImage = cdn.thumbnail(hit._source, size);

      });
    }
  };
}
