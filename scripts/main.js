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
var searchForm = document.getElementById('search-form');
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

var checkLoginStatus = function(response) {
    if (response && response.status == 'connected') {
        console.log('User is authorized');


        searchForm.style.display = '';

        // Now Personalize the User Experience
        console.log('response: ' + JSON.stringify(response));
    } else {
        console.log('User is not authorized');
        console.log('response: ' + response.status);
    }
}

var find = function() {
    spinner.style.display = '';

    searchResult.innerHTML = '';
    var searchterm = document.getElementById('searchtext').value;

    function sortByName(a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    }

    FB.api('/search', {
        'q': searchterm,
        'type': 'page',
        'limit': 25,
        'access_token': ''
    }, function(response) {
        console.log(response);
        response.data.sort(sortByName);

        //var jsonResult = document.createElement('pre');
        //jsonResult.innerHTML = JSON.stringify(response, undefined, 2);

        //spinner.style.display = 'none';
        //document.getElementById('form-container').appendChild(jsonResult);
        buildDom(response);
    });
}

var buildDom = function(searchresult) {
    var arrData = searchresult.data;
    if (arrData.length > 0) {
        for (var i = 0, len = arrData.length; i < len; i++) {
            //console.log('(arrData[i])', (arrData[i]));
            var page = document.createElement('article');
            var h2 = document.createElement('h2');
            var link = document.createElement('a');
            link.href = '//facebook.com/' + arrData[i].id;
            link.innerHTML = arrData[i].name;

            var moreButton = document.createElement('button');
            moreButton.setAttribute('class', 'btn btn-default');
            moreButton.setAttribute('type', 'button');
            moreButton.innerHTML = 'Know more';
            moreButton.setAttribute('onclick', 'getDetail(' + arrData[i].id + ')');

            h2.appendChild(link);
            page.appendChild(h2);
            page.appendChild(moreButton);
            page.setAttribute('id', 'page_' + arrData[i].id);
            searchResult.appendChild(page);

            spinner.style.display = 'none';
            searchResult.style.display = '';
        }
    } else {
        searchResult.innerHTML = '<strong>No matching results found...</strong>';

        spinner.style.display = 'none';

        searchResult.style.display = '';
    }
}

var getDetail = function(pageId) {
    console.log('pageId', pageId);
    FB.api("/" + pageId, {
        'access_token': ''
    }, function(response) {
        if (response && !response.error) {
            /* handle the result */
            console.log("details", response);
            var pageArticle = document.getElementById('page_' + pageId);
            if (response.about && response.about !== undefined) {
                var details = document.createElement('p');
                details.innerHTML = response.about;
                pageArticle.appendChild(details);
            }
            if (response.likes && response.likes !== undefined) {
                var likes = document.createElement('p');
                likes.innerHTML = '<h3>Likes: ' + response.likes + '</h3>';
                pageArticle.appendChild(likes);
            }
            pageArticle.innerHTML += '<fb:like href="https://www.facebook.com/' + pageId + '" layout="standard" action="like" show_faces="false" share="false"></fb:like>'
            FB.XFBML.parse(pageArticle);
            /*FB.api(
                "/me/likes/" + pageId, {
                    'access_token': ''
                }, function(response) {
                    if (response && !response.error) {
                        //handle the result
                        console.log("/me/likes", response, "isempt", response.data.length);
                        var fbLikeButton = document.createElement('button');
                        fbLikeButton.setAttribute('class', 'btn btn-default');
                        fbLikeButton.setAttribute('type', 'button');
                        pageArticle.appendChild(fbLikeButton);

                        if (response.data.length < 1) {
                            fbLikeButton.innerHTML = 'Like';
                            fbLikeButton.setAttribute('onclick', 'likeToggle(' + pageId + ')');

                        } else {
                            fbLikeButton.innerHTML = 'Unlike';
                            fbLikeButton.setAttribute('onclick', 'likeToggle(' + pageId + ', "DELETE")');

                        }
                    }
                }
            );*/

            FB.api({
                method: 'pages.isFan',
                page_id: pageId
            }, function(resp) {
                var fbLikeButton = document.createElement('div');
                fbLikeButton.setAttribute('class', 'fb-like');
                fbLikeButton.setAttribute('data-href', 'https://www.facebook.com/' + pageId);
                fbLikeButton.setAttribute('data-layout', 'standard');
                fbLikeButton.setAttribute('data-action', 'like');
                fbLikeButton.setAttribute('data-show-faces', 'false');
                fbLikeButton.setAttribute('data-share', 'false');
                pageArticle.appendChild(fbLikeButton);
                /*
                if (resp) {
                    console.log('You like the Application.');
                    fbLikeButton.innerHTML = 'Unlike';
                    fbLikeButton.setAttribute('onclick', 'likeToggle(' + pageId + ', "DELETE")');
                } else {
                    console.log("You don't like the Application.");
                    fbLikeButton.innerHTML = 'Like';
                    fbLikeButton.setAttribute('onclick', 'likeToggle(' + pageId + ')');
                }
                */
            });
        }
    });
}

var likeToggle = function(pageId) {
    FB.api(
        "/" + pageId + "/likes",
        "POST", {
            'access_token': ''
        }, function(response) {
            //if (response && !response.error) {
            /* handle the result */
            console.log("like result", response);
            //}
        }
    );
}