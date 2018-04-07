

var eventBriteToken = 'H3LGM754AS3WAX5USJYR'
var googleApiKey = 'AIzaSyAoSUvf9nkYuSYOhZbwtCjt1THHC9V0KGo'
var sgId = 'MTEwMzkzNDZ8MTUyMjM2NDA5NS41Mw'
var sgKey = '094349186bab82b92cda01baee0176b6a15cb2703a3b630c1108bc73ba7a66d3'
var weatherApiKey = 'cf2aa58036825fe3fb68e07d959d4291'
var qYoutube;
var qEventBrite;
var eventType = "concert"
var googleUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=' + qYoutube + '&type=video&videoEmbeddable=true&key=' + googleApiKey
var eventBriteurl = 'https://www.eventbriteapi.com/v3/events/search/?token=H3LGM754AS3WAX5USJYR&q=' + qEventBrite
var sgQ = "";
var page = 1;
var sgPerformer = "";
var lon = 0;
var lat = 0;
var favorites = [];
var displayFavorites = false;
var config = {
    apiKey: "AIzaSyC7rTCfLMZJrv9vy53vXZhJenvje0qwRQU",
    authDomain: "concert-cloud.firebaseapp.com",
    databaseURL: "https://concert-cloud.firebaseio.com",
    projectId: "concert-cloud",
    storageBucket: "concert-cloud.appspot.com",
    messagingSenderId: "36077992367"
  };
  firebase.initializeApp(config);
var db = firebase.database()
var ref = db.ref("/users/")
var currentUid = null;
var signedIn = false;
var signinRefused = false;
var userPhoto;


$(document).ready(function(){
    toggleDisplay()
signedIn = checkUserStatus()
ref.on('value', function(snapshot){
    if(signedIn){
        console.log(snapshot.val())
    }
})

$('#btn2').on('click', function(){
    page = 2;
    querySeatGeek()
})



//checkUser();
firebase.auth().onAuthStateChanged(function(user) {
    
   if(user){
        signedIn = true;
        currentUid = user.uid;
        console.log(user.displayName + " is signed in as " + currentUid)
        updateUser();
        toggleDisplay();
     
   } else {
       signedIn = false;
       signinRefused = false;
       currentUid = null;
       resetVariables();
       console.log(signedIn)
   }
   updateLoginBtn();
})

    // click event for performer button - loads youtube video
    $('body').on('click', '.performerBtn', function(){
        // get the text of the button (performer name used for youtube search)
        var performer = $(this).text();
        // get the event-id
        var eventId = $(this).attr('event-id')
        // use the event-id attr to select the videoDiv 
        var videoDiv = $('.video-output[event-id=' + eventId + ']')
        // set the youtube search to performer plus music
        qYoutube = performer + " official"
        // call youtube api with the div of where to display the video
        console.log(eventId)
        queryYoutube(videoDiv)
        
    })

    $('#btnSearch').on('click', function(){
      //  preventDefault();
        displayFavorites = false;
        
        toggleDisplay();
        resetVariables();

        var  searchInput = $('#search')
      // sgPerformer = searchInput.val();
            sgQ = searchInput.val();
            querySeatGeek();
        $(this).blur();
     
    })

    $('#search').on('focus', function(){
        $(this).val('');
    })

    $('#navFavorites').on('click', function(){
        displayFavorites = true;
        
        if((!signedIn)&&(!signinRefused)){
            $('#loginModal').modal();
        }
    
        toggleDisplay();
    })

    $('#navHome').on('click', function(){
        displayFavorites = false;
        toggleDisplay();
    })

    $('#btnLogin').on('click', function(){
        if(signedIn){
            firebase.auth().signOut();
        } else {
            $('#loginModal').modal();
        }
        
        updateLoginBtn();
    })

    $('body').on('click', '.btnFavorite', function(){
        var thisBtn = $(this)
        var eventId = $(this).attr("event-id")
        
        
        if(favorites.indexOf(eventId) < 0){
            favorites.push(eventId)
        } else {
            var idx = favorites.indexOf(eventId)
            favorites.splice(idx, 1)
        }
        if(displayFavorites){
            if(favorites.length > 0){
                querySeatGeek();
            } else {
            $('#results').empty();
            }
        }
        updateFavoriteBtn(thisBtn)
        if(signedIn){
            ref.child(currentUid).update({favorites: favorites})
        }
        if((!signedIn)&&(!signinRefused)){
            $('#loginModal').modal();
        }
    })

    $('.cancelLogin').on('click', function(){
        signinRefused = true;
    })

    $('body').on('click', function(){
        $(this).blur();
    })
 
})


function resetVariables(){
    var sgQ = "";
    var page = 1;
    var sgPerformer = "";
    var lon = 0;
    var lat = 0;

}

// searches seatgeek api
function querySeatGeek(){
    $('#results').empty();

    var searchUrl = getUrl('sgEventSearch')
        console.log(searchUrl)
    
    callApi(searchUrl).done(function(response){
       
        // get the resulting events
        var results = response.events 
        console.log(results)

        // loop through the results
        for(i = 0; i < results.length; i++){
            
            // create the main panel for results
            var resultPanel = $('<div class="panel panel-default resultPanel">')
            var panelHeading = $('<div class="panel-heading">').appendTo(resultPanel);
            // favorite button
            var btnFavorite = $('<button class="btnFavorite">').appendTo(panelHeading);
            var panelTitle = $('<h1>').appendTo(panelHeading);
            
            var panelBody = $('<div class="panel-body">').appendTo(resultPanel);

            // create the sub row to divide main panel
            var row = $('<div class="row">').appendTo(panelBody);
            // columns of main panel - size can be adjusted just by changing the bootstrap classes
            var leftCol = $('<div class="col-xs-12 col-md-6">').appendTo(row);
            var middleCol = $('<div class="col-xs-12 col-md-6">').appendTo(row);
            var rightCol = $('<div class="col-xs-0">').appendTo(row);

            // create the sub-panels
            // venuePanel contains venue info
            var venuePanel = $('<div class="panel panel-default">').appendTo(leftCol);
            var venueBody = $('<div class="panel-body">')
                            .html("<h3>Where:</h3>")
                            .appendTo(venuePanel);
            var venueDiv = $('<div>').appendTo(venueBody);
            // event panel is for event info like performers
            var eventPanel = $('<div class="panel panel-default">').appendTo(middleCol);
            var eventBody = $('<div class="panel-body">').appendTo(eventPanel);
            var eventDiv = $('<div>').appendTo(eventBody);
            // div for performers
            var performersDiv = $('<div>')
                                .html("<h3>Who:</h3>")
                                .appendTo(eventDiv);
            // div for event date and forecast
            var whenDiv = $('<div>').html("<h3>When:</h3>");
            // div for youtube video display
            var videoDiv = $('<div class="video-output">');
            
                            
            // assign the event results to variables
            var eventId = results[i].id;
            var eventUrl = results[i].url;
            var eventScore = results[i].score;
            var venueName = '<h4>' + results[i].venue.name + '</h4>';
            var venueStreet = results[i].venue.address;
            var venueCity = results[i].venue.city;
            var venueState = results[i].venue.state;
            var venueCityandState = venueCity + ", " + venueState;
            var venueZip = results[i].venue.postal_code;
            var venueLocation = results[i].venue.location;
            var title = results[i].title;
            var date = moment(results[i].datetime_local).format("MM/DD/YYYY");
            var dateTime = moment(results[i].datetime_local);
            
            var formattedDateTime = moment(results[i].datetime_local).format("dddd, MMMM Do YYYY, [at] h:mm a");
            var formattedAddress = venueStreet + "<br>" + venueCityandState + "<br>" + venueZip;
            
            // get the performers
                for(j = 0; j < results[i].performers.length; j++){
                    var performer = results[i].performers[j].name;
                    // create a btn-link for each performer, set its text to the performer name
                    var performerBtn = $('<button class="btn btn-link performerBtn">')
                                        .text(performer)
                                        .attr("event-id", eventId)
                                        .appendTo(performersDiv);    
                };

            // Set the title of the result panel
            panelTitle.html(date + " - " + title);
            // append the formatted date/time to whenDiv
            whenDiv.append(formattedDateTime);
            //TODO: get venue rating from yelp?
            // append all the venue stuff plus the whenDiv to the venue panel
            venueDiv.append(venueName, formattedAddress, whenDiv);
            // append the videoDiv to the performersDiv (output video will display below performers)
            performersDiv.append(videoDiv);
            
            // assign ids to divs for later use
            resultPanel.attr('event-id', eventId);
            performersDiv.attr('event-id', eventId);
            whenDiv.attr('event-id', eventId);
            videoDiv.attr('event-id', eventId);
            btnFavorite.attr({'id': 'b' + eventId,
                            'event-id': eventId})
                           
            // update the star based on whether or not it has been favorited
            updateFavoriteBtn(btnFavorite)
            

            // get the weather if the event date is within the next 5 days (the openweather api limit)
            var fiveDaysAway = moment().add(5, 'd')
                if(moment(dateTime).isBetween(moment(), fiveDaysAway)){
                   /* var weatherUrl = getUrl('weather')
                    callApi(weatherUrl).done(function(response){
                        var results = response.list
                        var forecast = getForecast(results, dateTime)
                        whenDiv.html(forecast) */

                    queryWeather(whenDiv, venueZip, dateTime);
                   // });
                }

            // append it all to the results div
            $('#results').append(resultPanel);
        };
    });
};




// searches youtube for a video with the performer, output it to videoDiv
function queryYoutube(videoDiv){
   
    var url = getUrl('youtube');
    callApi(url).done(function(response){
        // get the results
        var results = response.items;
        // get the video id from the results for the url
        var videoId = results[0].id.videoId;
        // set the embed url with the video id
        var videoUrl  = 'https://www.youtube.com/embed/' + videoId;
        // create the video panel to contain the video
        var videoPanel = $('<div class="panel panel-default">');
        var videoBody = $('<div class="panel-body">').appendTo(videoPanel);
        var iframeDiv = $('<div class="embed-responsive embed-responsive-16by9">');
        var videoEmbed = $('<iframe class="embed-responsive-item" allowfullscreen>')
                            .attr({src: videoUrl})
                            .appendTo(iframeDiv);
        videoBody.html(iframeDiv);
        videoDiv.html(videoPanel); 
    });
};



// gets the weather forecast for a zip code and dateTime, appends the whenDiv
function queryWeather(whenDiv, venueZip, dateTime){
    // get the url
    var url = getUrl('weather');
    url += '&zip=' + venueZip;
    // make the call
    callApi(url).done(function(response) {
        var results = response.list;
        //loop through the results
        for(var i = 0; i < results.length; i++){
            // get the forecast range
            var forecastStartTime = moment(results[i].dt_txt);
            var forecastEndTime;
                if(i + 1 < results.length){
                forecastEndTime = moment(results[i + 1].dt_txt);
                } else {
                    forecastEndTime = moment(results[i].dt_txt);
                };
            // get the forecast if dateTime falls within the range
            if((moment(dateTime).isBetween(forecastStartTime, forecastEndTime, 'minute', [])) || (moment(dateTime).isSame(forecastStartTime, forecastEndTime, 'minute'))) {
                var lowTemp = Math.round(results[i].main.temp_min)
                var highTemp = Math.round(results[i].main.temp_max)
                var humidity = results[i].main.humidity
                var rain = results[i].rain
                var forecast = results[i].weather[0].description
                var weather = $("<div>").html('<h4>Forecast</h4>' + 'Temp: ' + lowTemp + ' - ' + highTemp + '&#176 (F)<br>' + forecast)
                whenDiv.append(weather)
            };
        };
    });
}


// updates the favorite (star) button
function updateFavoriteBtn(thisBtn){
    // start with an empty button
    thisBtn.empty();
    var eventId = $(thisBtn).attr("event-id");
    var favStar = $('<span class="glyphicon">');

    // if it's not in favorites[], empty star otherwise filled star
    if(favorites.indexOf(eventId) < 0){
        favStar.removeClass("glyphicon-star").addClass("glyphicon-star-empty");
    } else {
        favStar.removeClass("glyphicon-star-empty").addClass("glyphicon-star");
    };

    // add the updated star to the button
    $(thisBtn).append(favStar);
};



function checkUserStatus(){
    var user = firebase.auth().currentUser;
    if(user){
        currentUid = user.uid;
        return true;
    } else {
        return false;
    }
}



// syncs the currentUser with the db, creates a user if it doesn't already exist
function updateUser(){
    // get the current user's data
    var userData = firebase.auth().currentUser;
    // update the db with the user data (except favorites)
    ref.child(currentUid).update({
        name: userData.displayName,
        email: userData.email,
        emailverified: userData.emailVerified,
        photoUrl: userData.photoURL,
        providerId: userData.providerData[0].providerId,
        providerUid: userData.providerData[0].uid,
    }).then(function(){
        // retrieve the newly updated user to see if they had any favorites stored
        ref.child(currentUid).once('value', function(snapshot){
            userPhoto = snapshot.val().photoUrl
            // if the user had favorites stored, combine the local favorites array with the db favorites
            if(snapshot.val().favorites){
                var dbFavorites = snapshot.val().favorites;
                favorites = combineArrays(favorites.concat(dbFavorites));
            };
            // update the db favorites with the favorites array
            ref.child(currentUid).update({favorites: favorites});
        });
    }); 
};





// combines 2 arrays and removes duplicates
function combineArrays(array){
    var arr = array.concat();
    for(var i = 0; i < arr.length; i++){
        for (var j = i+1; j < arr.length; j++){
            if(arr[i] === arr[j]){
                arr.splice(j--, 1)
            }
        }
        if(arr[i] === ""){
            arr.splice(i, 1)
        }
    }
    return arr
}



// updates the "login/out" button based on user status
function updateLoginBtn(){
    if(signedIn){
        $('#btnLogin').html("Sign Out")
        if(firebase.auth().currentUser.providerId === "google.com"){
        var userPhoto = firebase.auth().currentUser.photoURL;
        $('#profilePic').html('<img src="' + userPhoto +'" class="img-circle img-responsive" width="40" height="auto">')
        }

    } else {
        $('#btnLogin').html("Sign In")
        $('#profilePic').empty();
    }
}



// toggles the page between displaying favorites or home
function toggleDisplay(){
    if(displayFavorites){
        $('#navFavorites').addClass("active");
        $('#navHome').removeClass("active");
        $('#results').empty();
        $('#signin').empty();
            if(favorites.length > 0){
                querySeatGeek();
            };
            if(!signedIn){
                var message = '<h3><center><a href="#" data-toggle="modal" data-target="#loginModal">Sign In</a> to Save Your Favorites!</center></h3>';
                var signInPanel = $('<div class="panel panel-default">').appendTo('#signin');
                var signInBody = $('<div class="panel-body">').html(message).appendTo(signInPanel);
            };
             
    } else {
        $('#navFavorites').removeClass("active");
        $('#navHome').addClass("active");
        $('#signin').empty();
            if(sgQ.length === 0){
                $('#results').empty;
            } else{
            querySeatGeek();
            };
    };
};









