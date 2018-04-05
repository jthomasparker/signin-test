function callApi(apiURL){
    return $.ajax({
         method: 'GET',
         url: apiURL,
         async: true,
         crossDomain: true,
         headers: {}
     });
 };



function getUrl(api){
    switch (api){
        case 'sg':
        var url = 'https://api.seatgeek.com/2/events?taxonomies.name=' + eventType;
            url += '&' + $.param({
                'per_page': 10,
                'page': page,
                'client_id': sgId,
                'client_secret': sgKey
            })
            if(!displayFavorites){
                url += '&' + $.param({
                    'q': sgQ,
                    'client_id': sgId,
                    'client_secret': sgKey,
                    'performers.slug': sgPerformer,
                    'lat': lat,
                    'lon': lon,
                // 'geoip': true,
                // 'range': '200mi'
                });
            } else {
                url += '&' + $.param({
                    'id': favorites,   
                })
            }
        return url;
        break;
    }
}