var markers = [];
var marker;

var locations = [{
        title: 'Union Square',
        type: 'Entertainment',
        location: {
            lat: 37.787994,
            lng: -122.407437
        }
    },
    {
        title: 'Islamic Society of San Francisco',
        type: 'Mosque',
        location: {
            lat: 37.781474,
            lng: -122.411886
        }
    },
    {
        title: 'Chutney',
        type: 'Food',
        location: {
            lat: 37.786029,
            lng: -122.413293
        }
    },
    {
        title: 'Golden Gate Park',
        type: 'Entertainment',
        location: {
            lat: 37.768391,
            lng: -122.47543
        }
    },
    {
        title: 'AT&T Park',
        type: 'Entertainment',
        location: {
            lat: 37.778595,
            lng: -122.38927
        }
    }
];

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.7749,
            lng: -122.419
        },
        zoom: 12,
        disableDefaultUI: true
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            map: map
        });
        markers.push(marker);
        bounds.extend(marker.position);

        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

        viewModel.area()[i].marker = marker;

        map.fitBounds(bounds);

    } // ends the for loop


    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 30),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 30));
        return markerImage;
    }

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.setMarker = null;
            });
        }

        /*var clientID = 'GOSFGAOZKCSLMWADY1ORYJV2A4GUNNHAHBVWY500S1IM42CS';
        var clientSecret = '0AXAROY0WO5DJYVTZYN0UVJ3BE0KTPK54WSYPZPX0BY2UMHP';
        var url = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                var result = data.response.venue;
                console.log(result);
            },
            error: function(e) {
                alert("There was an error");
            }
        });*/

        function changeColor() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].color = highlightedIcon;
            }
        };
        
        infowindow.open(map, marker);
    }
}

// Alert the user if google maps isn't working
function googleError() {
    alert('There is an Error. Google Maps is not loading. Please try refreshing the page later');
}

// Knockout.js
var Neighborhood = function(data, marker) {
    var self = this;
    this.name = data.title;
    this.lat = data.location.lat;
    this.lng = data.location.lng;
    this.marker = marker;
    this.type = data.type;
    this.show = ko.observable('true');
}

var ViewModel = function() {
    var self = this;
    //this.locationTypes = ko.observableArray(["All", "Food and Drink", "Entertainment"]);
    self.area = ko.observableArray([]);
    this.inputSearch = ko.observable("");
    this.setVisible = ko.observable("");

    locations.forEach(function(placeItem) {
        self.area.push(new Neighborhood(placeItem));
    });

    //Credit: https://discussions.udacity.com/t/using-knockout-for-a-function/199182/2
    self.openUp = function(placeItem) {
       console.log('Works');
       google.maps.event.trigger(placeItem.marker, 'click');
    }

    //Credit: Live Help Expert 
    this.filterSearch = function(){
        infoWindow.close();
        var inputSearch = this.inputText();
        if (inputSearch.length === 0){
            this.showAll(true);
        } else{
            for(var i=0; i<area.length; i++){
                if(area[i].title.toLowerCase().indexOf(inputSearch.toLowerCase()) > -1){
                    area[i].show();
                    area[i].setVisible(true);
                } else{
                    area[i].show(false);
                    area[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    this.showAll = function(variable){
        for(var i=0; i<area.length; i++){
            area[i].show(variable);
            area[i].setVisible(variable);
        }
    };
}
    

viewModel = new ViewModel();

ko.applyBindings(viewModel);