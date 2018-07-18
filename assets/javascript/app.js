var googApiKey = "AIzaSyCx7yMbCH5ACvx_95q_Rqr_nkx9hbSVppQ";
var map;
var pos;
var hpos;
var hadd;
var tweetsInfo;
var dist = [];
var recent = [];
var add = true;

$("form").hide()

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 12
    });


    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        if (add) {
            navigator.geolocation.getCurrentPosition(function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                var cb = new Codebird;
                cb.setConsumerKey("ayQmqxFELX2wk3TQroPflQk1T", "LddGI4JMJqgyAcSH5NNwrAYlmmCyW28QPGC93Bwih08ttvgDKi");

                var params = {
                    geocode: " " + pos.lat + "," + pos.lng + ",1mi ",
                    count: 100
                };
                cb.__call(
                    "search_tweets",
                    params,
                    function (reply) {

                        var i = 0;
                        tweetsInfo = reply.statuses;

                        reply.statuses.forEach(loc => {

                            if (!loc.coordinates || !loc.entities.urls[0]) {

                            }
                            else {
                                lpos = {
                                    lat: parseFloat(loc.coordinates.coordinates[1]),
                                    lng: parseFloat(loc.coordinates.coordinates[0])
                                };

                                dist.push({
                                    "index": i,
                                    "distance": parseInt(getDistance(pos, lpos))
                                });

                                recent.push({
                                    "index": i,
                                    "distance": parseInt(getDistance(pos, lpos))
                                });

                                addMarker(lpos, loc,parseInt(getDistance(pos, lpos)));
                            }
                            i++;
                        });

                        for (var i = 0; i < (dist.length - 1); i++) {
                            if (dist[i].distance > dist[i + 1].distance) {
                                var copy = dist[i + 1];
                                dist[i + 1] = dist[i];
                                dist[i] = copy;
                                i = -1;
                            }
                        }
                        rowSort(tweetsInfo, recent);
                    }
                );
            }, function () {
                handleLocationError(true, map.getCenter());
            });
        } else {
            map.setCenter(pos);

            var cb = new Codebird;
            cb.setConsumerKey("ayQmqxFELX2wk3TQroPflQk1T", "LddGI4JMJqgyAcSH5NNwrAYlmmCyW28QPGC93Bwih08ttvgDKi");

            var params = {
                geocode: " " + pos.lat + "," + pos.lng + ",1mi ",
                count: 100
            };
            cb.__call(
                "search_tweets",
                params,
                function (reply) {
                    var i = 0;
                    tweetsInfo = reply.statuses;

                    reply.statuses.forEach(loc => {
                        if (!loc.coordinates || !loc.entities.urls[0]) {

                        }
                        else {

                            lpos = {
                                lat: parseFloat(loc.coordinates.coordinates[1]),
                                lng: parseFloat(loc.coordinates.coordinates[0])
                            };

                            dist.push({
                                "index": i,
                                "distance": parseInt(getDistance(pos, lpos))
                            });

                            recent.push({
                                "index": i,
                                "distance": parseInt(getDistance(pos, lpos))
                            });
                            addMarker(lpos, loc,parseInt(getDistance(pos, lpos)));
                        }
                        i++;
                    });

                    for (var i = 0; i < (dist.length - 1); i++) {
                        if (dist[i].distance > dist[i + 1].distance) {
                            var copy = dist[i + 1];
                            dist[i + 1] = dist[i];
                            dist[i] = copy;
                            i = -1;
                        }
                    }
                    rowSort(tweetsInfo, recent);
                }
            );
        }
    } else {
        // Browser doesn't support Geolocationz
        handleLocationError(false, map.getCenter());
    }
}

$("#recent").click(function () {
    rowSort(tweetsInfo, recent);
});

$("#sortDist").click(function () {
    rowSort(tweetsInfo, dist);
});

$("#inputAdd").click(function () {
    $("form").show();
});

$("#currentLoco").click(function () {
    $("form").hide();
    add = true;
    dist = [];
    recent = [];
    $('#tableBody').empty();
    initMap();
});

$("#submit").click(function (event) {
    event.preventDefault();
    add = false;
    dist = [];
    recent = [];
    $('#tableBody').empty();
    var address = $("#address").val();
    getLL(address);
});

function rowSort(info, sortTable) {
    $("#tableBody").empty();
    var j = 0;

    for (var i = 0; i < sortTable.length; i++) {

        if (info[sortTable[i].index].entities.urls.length === 0) {

        }
        else {
            var row = $("<tr>");
            row.append("<td>" + info[sortTable[i].index].user.screen_name);
            row.append("<td>" + info[sortTable[i].index].user.name);
            row.append("<td>" + sortTable[i].distance);
            row.append("<td>" + info[sortTable[i].index].text);
            row.append('<td> <a target="_blank" href=' + info[sortTable[i].index].entities.urls[0].url + '> <button type="button" class="btn btn-primary">View Tweet</button>');
            $("tbody").append(row);
            j++;
        }
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function getLL(address) {
    var queryURL = encodeURI('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyCx7yMbCH5ACvx_95q_Rqr_nkx9hbSVppQ');
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        pos = {
            lat: response.results[0].geometry.location.lat,
            lng: response.results[0].geometry.location.lng
        };
        initMap();
    });
}

function addMarker(coords, info, dist) {

    var content = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h3 id="firstHeading">' + info.user.screen_name + '</h3>' +
        '<h4 id="firstHeading">' + info.user.name + '</h4>' +
        '<div id="bodyContent">' +
        '<a target="_blank" href=' + info.entities.urls[0].url + '><p>' + info.text + '</p></a>' +
        '<h6 id="firstHeading">' + dist + ' meters</h6>' +
        '</div>' +
        '</div>';

    new google.maps.Marker({
        position: coords,
        map: map
    });

    var infowindow = new google.maps.InfoWindow({
        content: content
    });

    var marker = new google.maps.Marker({
        position: coords,
        map: map,
    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });
}

function getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}

function rad(x) {
    return x * Math.PI / 180;
};