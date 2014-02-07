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
var searchResult = document.getElementById('search-result');
var fbLoginButton = document.getElementById('fb-login-button');
var fbCustomLoginButton = document.getElementById('fb-custom-login-button');
var searchForm = document.getElementById('search-form');
var loginWarning = document.getElementById('login-warning');
spinner.style.display = 'none';
searchResult.style.display = 'none';
searchForm.style.display = 'none';

searchForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    find();
});

function authUser() {
    FB.login(checkLoginStatus);
}

function logoutUser() {
    FB.logout(checkLoginStatus);
}

var checkLoginStatus = function(response) {
    console.log('response: ' + response.status);
    if (response && response.status == 'connected') {
        console.log('User is authorized');

        fbCustomLoginButton.innerHTML = 'Logout';
        fbCustomLoginButton.setAttribute('onclick', 'logoutUser()');
        searchForm.style.display = '';
        loginWarning.style.display = 'none';
        fbCustomLoginButton.style.display = '';

        // Now Personalize the User Experience
        console.log('response: ' + JSON.stringify(response));
    } else {
        searchForm.style.display = 'none';
        loginWarning.style.display = '';
        fbCustomLoginButton.innerHTML = 'Login';
        fbCustomLoginButton.setAttribute('onclick', 'authUser()');
        fbCustomLoginButton.style.display = '';
        console.log('User is not authorized');
        console.log('response: ' + response.status);
    }
}


var sortByName = function(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}
var find = function() {
    spinner.style.display = '';

    searchResult.innerHTML = '';
    var searchterm = document.getElementById('searchtext').value;

    FB.api('/search', {
        'q': searchterm,
        'type': 'page',
        'limit': 30,
        'access_token': ''
    }, function(response) {
        console.log(response);
        response.data.sort(sortByName);
        buildDom(response);
    });
}

var buildDom = function(searchresult) {
    var arrData = searchresult.data;
    if (arrData.length > 0) {
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
            searchResult.appendChild(page);
            spinner.style.display = 'none';
            searchResult.style.display = '';
        }

        searchResult.innerHTML += '<ul class="pager">' +
            '<li class="previous disabled"><a href="#">&larr; Older</a></li>' +
            '<li class="next"><a href="#">Newer &rarr;</a></li>' +
            '</ul>';
    } else {
        searchResult.innerHTML = '<strong>No matching results found...</strong>';
        spinner.style.display = 'none';
        searchResult.style.display = '';
    }
}

var getPicture = function(pageId) {
    FB.api(
        "/" + pageId + "/picture", {
            "redirect": false,
            "height": "100",
            "type": "square",
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

var getDetail = function(pageId, elem) {
    console.log('pageId', pageId);
    FB.api("/" + pageId, {
        'access_token': ''
    }, function(response) {
        if (response && !response.error) {
            elem.style.display = 'none';
            /* handle the result */
            console.log("details", response);
            var pageArticle = document.getElementById('page-' + pageId);
            var innerHtml = '';
            if (response.cover && response.cover !== undefined) {
                pageArticle.innerHTML = '<p><img src="' + response.cover.source + '" class="img-responsive" alt="' + response.name + '"></p>' + pageArticle.innerHTML;
            }
            if (response.about && response.about !== undefined) {
                innerHtml += '<p>' + response.about + '</p>';
            }
            if (response.description && response.description !== undefined) {
                innerHtml += '<p>' + response.description + '</p>';
            }
            if (response.link && response.link !== undefined) {
                innerHtml += '<strong> Facebook page: </strong><a href="' + response.link + '">' + response.link + '</a>';
            }
            if (response.website && response.website !== undefined) {
                innerHtml += '<a href="' + response.website + '">' + response.website + '</a>';
            }
            innerHtml += '<fb:like href="https://www.facebook.com/' + pageId + '" layout="standard" action="like" show_faces="false" share="false"></fb:like>';
            pageArticle.innerHTML += innerHtml;
            FB.XFBML.parse(pageArticle);
        }
    });
}