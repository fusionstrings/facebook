'use strict';

/*	Facebook API iniitialization	*/
window.fbAsyncInit = function() {
    FB.init({
        appId: 516796998433208,
        status: true,
        cookie: true,
        xfbml: true
    });

    /* Check if user is loggedin on page load */
    FB.Event.subscribe('auth.statusChange', checkLoginStatus);
};


/* Bootstrap Facebook JavaScript SDK */
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var spinner = document.getElementById('spinner');
var searchResultWrapper = document.getElementById('search-result');
var fbCustomLoginButton = document.getElementById('fb-custom-login-button');
var searchForm = document.getElementById('search-form');
var loginWarning = document.getElementById('login-warning');
spinner.style.display = 'none';
searchResultWrapper.style.display = 'none';
searchForm.style.display = 'none';

/*	submit the form without navigating away */
searchForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    find();
});

/* Log in user */
function authUser() {
    FB.login(checkLoginStatus);
}
/* Logout user */
function logoutUser() {
    FB.logout(checkLoginStatus);
}

/* Check user logged-in status */
var checkLoginStatus = function(response) {
    //console.log('response: ' + response.status);
    if (response && response.status == 'connected') {
        //console.log('User is authorized');

        fbCustomLoginButton.innerHTML = 'Logout'; // Change login button lable if user is logged in
        fbCustomLoginButton.setAttribute('onclick', 'logoutUser()'); // Change login button behaviour if user is logged in
        searchForm.style.display = ''; // Display search form if user is logged in
        loginWarning.style.display = 'none'; // Hide login required message if user is logged in
        fbCustomLoginButton.style.display = ''; // A hack to avoid flickr

        // Now Personalize the User Experience
        //console.log('response: ' + JSON.stringify(response));
    } else {
        searchForm.style.display = 'none'; // Hide search form if user is not logged in
        loginWarning.style.display = ''; // Show login required message if user is not logged in
        fbCustomLoginButton.innerHTML = 'Login'; // Change login button lable if user is not logged in
        fbCustomLoginButton.setAttribute('onclick', 'authUser()'); // Change login button behaviour if user is not logged in
        fbCustomLoginButton.style.display = ''; // A hack to avoid flickr
        //console.log('User is not authorized');
        //console.log('response: ' + response.status);
    }
}

/* Sort JSON object based on property */
var sortByName = function(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}
/* Initiate search on form submit */
var find = function() {
    var searchTerm = document.getElementById('searchtext').value;
    var searchParams = {
        "limit": 20,
        "type": "page",
        "q": searchTerm
    }
    //'limit=30&type=page&q=' + searchTerm;
    doSearch(searchParams);
}

/*Extract param values for pagination */
var getParams = function(url) {
    var queryString = {};
    var query = url.substring(0);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof queryString[pair[0]] === "undefined") {
            queryString[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof queryString[pair[0]] === "string") {
            var arr = [queryString[pair[0]], pair[1]];
            queryString[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            queryString[pair[0]].push(pair[1]);
        }
    }
    delete queryString.access_token;
    return queryString;
};

/* Execute search */
var doSearch = function(searchParams) {
    searchResultWrapper.innerHTML = '';
    spinner.style.display = '';
    //console.log("searchParams", searchParams);
    FB.api("/search", searchParams, function(response) {
        //console.log(response);
        response.data.sort(sortByName);
        buildDom(response);
    });
}

/*Prepare DOM for search result */
var buildDom = function(searchResult) {
    var arrData = searchResult.data;
    if (arrData.length > 0) {
        searchResultWrapper.innerHTML = '';
        for (var i = 0, len = arrData.length; i < len; i++) {
            //console.log('(arrData[i])', (arrData[i]));
            getPicture(arrData[i].id);
            var page = document.createElement('article');
            page.setAttribute('id', 'page-' + arrData[i].id);
            page.setAttribute('class', 'col-md-6 media');
            var innerHtml = '<a class="pull-left" href="//facebook.com/' + arrData[i].id + '"><img class="media-object" id="page-picture-' + arrData[i].id + '" /></a>' +
                '<h4><a href="//facebook.com/' + arrData[i].id + '">' + arrData[i].name + '</a></h4>' +
                '<p><strong>' + arrData[i].category + '</strong></p>' +
                '<p><button class="btn btn-default btn-xs" type="button" onclick="getDetail(' + arrData[i].id + ', this)"><span class="glyphicon glyphicon-plus"></span> Know more</button></p>';
            page.innerHTML = innerHtml;
            searchResultWrapper.appendChild(page);
            spinner.style.display = 'none';
            searchResultWrapper.style.display = '';
        }
        if (searchResult.paging && searchResult.paging !== undefined) {
            searchResultWrapper.innerHTML +=
                '<div class="row">' +
                '<div class="col-md-12">' +
                '<ul class="pager">' +
                '<li class="previous"><a id="result-previous" href="#">&larr; Older</a></li>' +
                '<li class="next"><a id="result-next" href="#">Newer &rarr;</a></li>' +
                '</ul></div></div>';
            var resultNext = document.getElementById('result-next');
            var resultPrevious = document.getElementById('result-previous');

            if (searchResult.paging.next && searchResult.paging.next !== undefined) {
                resultNext.parentNode.style.display = ''
                var nextUrlParam = getParams(searchResult.paging.next.split("search?")[1]);
                //console.log("nextUrlParam", nextUrlParam);
                resultNext.addEventListener('click', function(evt) {
                    evt.preventDefault();
                    doSearch(nextUrlParam);
                }, false);
            } else {
                resultNext.parentNode.style.display = 'none'
            }
            if (searchResult.paging.previous && searchResult.paging.previous !== undefined) {
                resultPrevious.parentNode.style.display = ''
                var previousUrlParam = getParams(searchResult.paging.previous.split("search?")[1]);
                //console.log("previousUrlParam", previousUrlParam);
                resultPrevious.addEventListener('click', function(evt) {
                    evt.preventDefault();
                    doSearch(previousUrlParam);
                }, false);
            } else {
                resultPrevious.parentNode.style.display = 'none'
            }
        }
    } else {
        searchResultWrapper.innerHTML = '<strong>No matching results found...</strong>';
        spinner.style.display = 'none';
        searchResultWrapper.style.display = '';
    }
}

/* Get page display picture to display with initial reults, it's expensive but spices things up */
var getPicture = function(pageId) {
    FB.api(
        "/" + pageId + "/picture", {
            "redirect": false,
            "height": "100",
            "type": "normal",
            "width": "100"
        },
        function(response) {
            if (response && !response.error) {
                /* handle the result */

                var pagePicture = document.getElementById('page-picture-' + pageId);

                pagePicture.setAttribute('src', response.data.url);
            }
        }
    );
}

/* Fetch details of page on click of more button */
var getDetail = function(pageId, elem) {
    //console.log('pageId', pageId);
    FB.api("/" + pageId, {
        'access_token': ''
    }, function(response) {
        if (response && !response.error) {
            elem.style.display = 'none';
            /* handle the result */
            //console.log("details", response);
            var pageArticle = document.getElementById('page-' + pageId);
            var innerHtml = '';
            //Move the cover image top of the page detail node
            if (response.cover && response.cover !== undefined) {
                pageArticle.innerHTML = '<p><img src="' + response.cover.source + '" class="img-responsive" alt="' + response.name + '"></p>' + pageArticle.innerHTML;
            }
            if (response.about && response.about !== undefined) {
                innerHtml += '<p><strong> About: </strong>' + response.about + '</p>';
            }
            if (response.company_overview && response.company_overview !== undefined) {
                innerHtml += '<p><strong>Overview: </strong>' + response.company_overview + '</p>';
            }
            if (response.description && response.description !== undefined) {
                innerHtml += '<p><strong>Description: </strong>' + response.description + '</p>';
            }
            if (response.talking_about_count && response.talking_about_count !== undefined) {
                innerHtml += '<p><strong>People talking about: </strong>' + response.talking_about_count + '</p>';
            }
            if (response.band_members && response.band_members !== undefined) {
                innerHtml += '<p><strong>Band members: </strong>' + response.band_members + '</p>';
            }
            if (response.bio && response.bio !== undefined) {
                innerHtml += '<p><strong>Band bio: </strong>' + response.bio + '</p>';
            }
            if (response.current_location && response.current_location !== undefined) {
                innerHtml += '<p><strong>Location: </strong>' + response.current_location + '</p>';
            }
            if (response.link && response.link !== undefined) {
                innerHtml += '<p><strong>Facebook page: </strong><a href="' + response.link + '">' + response.link + '</a></p>';
            }
            if (response.website && response.website !== undefined) {
                var arrayOfWebsite = response.website.split(" ");
                innerHtml += '<p><strong>Website(s): </strong><br />';
                for (var i = arrayOfWebsite.length - 1; i >= 0; i--) {

                    innerHtml += '<a href="' + arrayOfWebsite[i] + '">' + arrayOfWebsite[i] + '</a><br />';
                };
                innerHtml += '</p>';
            }
            innerHtml += '<fb:like href="https://www.facebook.com/' + pageId + '" layout="standard" action="like" show_faces="false" share="false"></fb:like>';
            pageArticle.innerHTML += innerHtml;
            FB.XFBML.parse(pageArticle);
        }
    });
}