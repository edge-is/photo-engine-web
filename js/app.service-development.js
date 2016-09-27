/**
 * Directive to notify development
 */

function developmentDirective($log, $cookies, ngNotify){
  return {
    restrict : 'E',
    link : function ($scope, element, attrs){
      if (!config.development) return;

      var cookieKey = 'developmentDismiss';

      var dismissed = $cookies.get(cookieKey);
      if (dismissed) return $log.info('DEVELOPMENT BANNER: Already dismissed');

      ngNotify.set('Þessi vefur er í vinnslu.', {
          html: true,
          sticky: true,
          button:true
      }, function dismissNotify(){
        $cookies.put(cookieKey, 'true');
      });

    }
  }
}
