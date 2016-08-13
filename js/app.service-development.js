

function developmentService($log, $cookies, ngNotify){
  return function (){

      if (!config.development) return;

      var cookieKey = 'developmentDismiss';

      var dismissed = $cookies.get(cookieKey);
      if (dismissed) return $log.info('DEVELOPMENT: Already dismissed');

      ngNotify.set('Þessi vefur er í vinnslu.', {
          html: true,
          sticky: true,
          button:true
      }, function dismissNotify(){
        $cookies.put(cookieKey, 'true');
      });
    }
}

search.service('notifyDevelopment', ['$log',  '$cookies', 'ngNotify', developmentService]);
