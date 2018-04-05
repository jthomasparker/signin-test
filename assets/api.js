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
        case 'sgEventSearch':
            var url = 'https://api.seatgeek.com/2/events?taxonomies.name=' + eventType;
            url += '&' + $.param({
                'per_page': 10,
                'page': page,
                'client_id': sgId,
                'client_secret': sgKey
            });
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
                    });
                };
            return url;
            break;

        case 'weather':
            var url = "https://api.openweathermap.org/data/2.5/forecast?APPID=" + weatherApiKey;
            url += '&' + $.param({
                'units': 'imperial',
               // 'zip': venueZip
            })
            return url;
            break;
        
        case 'youtube':
            var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
            url += '&' + $.param({
                'maxResults': 5,
                'q': qYoutube,
                'part': 'snippet',
                'type': 'video',
                'videoCategoryId': 10,
                'videoEmbeddable': true,
                'videoSyndicated': true,
                'key': googleApiKey
            })
            return url;
            break;
           
        default:
            break;
    }
}
