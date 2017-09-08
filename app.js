var markers = [];
var marker;

var locations = [{
        title: 'Union Square',
        type: 'Entertainment',
        location: {
            lat: 37.787994,
            lng: -122.407437
        },
        foursquareID: '40bbc700f964a520b1001fe3'
    },
    {
        title: 'Tiled Steps',
        type: 'Entertainment',
        location: {
            lat: 37.756271,
            lng: -122.473175
        },
        foursquareID: '4b6f45c8f964a5207ae82ce3'
    },
    {
        title: 'Twin Peaks',
        type: 'Entertainment',
        location: {
            lat: 37.754407,
            lng: -122.447684
        },
        foursquareID: '4c29567f9fb5d13aa2139b57'
    },
    {
        title: 'Golden Gate Park',
        type: 'Entertainment',
        location: {
            lat: 37.768391,
            lng: -122.47543
        },
        foursquareID: '445e36bff964a520fb321fe3'
    },
    {
        title: 'Pier 39',
        type: 'Entertainment',
        location: {
            lat: 37.808382,
            lng: -122.41042
        },
        foursquareID: '409d7480f964a520f2f21ee3'
    }
];

function initMap() {
    viewModel = new ViewModel();
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
        var foursquareID = locations[i].foursquareID;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            map: map,
            foursquareID: foursquareID
        });
        marker.addListener('click', toggleBounce);
        markers.push(marker);
        bounds.extend(marker.position);

        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });

        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

        function toggleBounce() {
            var marker = this;
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ 
                    marker.setAnimation(null);
                }, 1400);
            }
        }
   
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
                marker.setAnimation= null;
            });
        }
        var lat = marker.position.lat();
        var lng = marker.position.lng();
        var foursquareID = marker.foursquareID;

        var clientID = 'GOSFGAOZKCSLMWADY1ORYJV2A4GUNNHAHBVWY500S1IM42CS';
        var clientSecret = '0AXAROY0WO5DJYVTZYN0UVJ3BE0KTPK54WSYPZPX0BY2UMHP';
        //var url = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

        var url = 'https://api.foursquare.com/v2/venues/' + foursquareID + '?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118';
        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                var results = data.response.venues[0];
                //console.log(data);
                self.description = results.description;
            },
            error: function(e) {
                alert("There was an error");
            }
        });
        
        infowindow.open(map, marker);
    }
      ko.applyBindings(viewModel);
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
    this.setVisible = ko.observable();
}

var ViewModel = function() {
    var self = this;
    //this.locationTypes = ko.observableArray(["All", "Food and Drink", "Entertainment"]);
    self.area = ko.observableArray([]);
    this.inputSearch = ko.observable("");

    locations.forEach(function(placeItem) {
        self.area.push(new Neighborhood(placeItem));
    });

    //Credit: https://discussions.udacity.com/t/using-knockout-for-a-function/199182/2
    self.openUp = function(placeItem) {
       console.log('Works');
       google.maps.event.trigger(placeItem.marker, 'click');
    }
    
    //Credit: Live Help Expert 
    this.filterSearch = ko.computed(function(){
     
        if (self.inputSearch().length === 0){ 
            for(var i=0; i<self.area().length; i++){ 
                if (self.area()[i].marker){ 
                    self.area()[i].marker.setVisible(true);
                }
                self.area()[i].show(true);
            } 
            return self.area();
        } else { 
            for(var i=0; i<self.area().length; i++){ 
                if(self.area()[i].name.toLowerCase().indexOf(self.inputSearch().toLowerCase()) > -1){
                     self.area()[i].show(); 
                     self.area()[i].marker.setVisible(true);
                 } else { 
                    self.area()[i].show(false); 
                    self.area()[i].marker.setVisible(false); }
                 } 
            var search = self.inputSearch(); 
            return ko.utils.arrayFilter(self.area(), function (loc){ 
                var result = loc.name.toLowerCase().indexOf(search) >= 0; 
                return result; 
            });
        } 
    }, self);
}
    

