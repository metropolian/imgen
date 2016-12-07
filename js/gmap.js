    var map;
    var geocoder;
    var current_pos;
    var current_marker;
      
    
    function create_maker(pos, options, on_click, on_changed) {
        var pinColor = options.color;
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
            new google.maps.Size(21, 34),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 34));
            
        var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 35));
            
        marker = new google.maps.Marker({
                        map: map,
                        draggable: options.draggable,
                        animation: google.maps.Animation.DROP,
                        position: pos,
                        label: {
                            color: 'white',
                            text: 'x'
                        },
                        icon: pinImage,
                        shadow: pinShadow
                    });
        if (on_click)
            marker.addListener('click', on_click);
        if (on_changed)
            marker.addListener('dragend', on_changed);
        return marker;            
    }
    
    function update_current_location(src) { 
        if (!current_marker) {
            current_marker = create_maker(src, 
                {text: 'S', color: 'f00', draggable: true}, 
                null, 
                null);
            current_marker.addListener('drag', update_current_location);
        }
        current_marker.setPosition(src);
        
        if (current_marker && current_dest_marker)
            update_direction(current_marker.getPosition(), current_dest_marker.getPosition());
    }
    
    var current_dest_marker;
    
    function update_destination(dest) {
        if (current_dest_marker == null) {
            current_dest_marker = create_maker(dest, 
                {text: 'D', color: '00f', draggable: true}, null, update_destination);
        }
        current_dest_marker.setPosition(dest);
        if (current_marker && current_dest_marker)
            update_direction(current_marker.getPosition(), current_dest_marker.getPosition());
    }
    
    
    var directions_display;
    var directions_service; 
    
    function update_direction(src, dest) {
        directions_service.route({
                origin: src,  
                destination: dest, 
                // Note that Javascript allows us to access the constant
                // using square brackets and a string value as its
                // "property."
                travelMode: google.maps.TravelMode.DRIVING
            }, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                console.log((response));
              directions_display.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
        });

    }
    
    function initial() {
        var dest = { lat: 13.896627, lng: 100.6087728 };
        geocoder = new google.maps.Geocoder;
        map = new google.maps.Map(document.getElementById('map'), {
            center: dest,
            zoom: 16
        });
        // Create the search box and link it to the UI element.
        var input = document.getElementById('from');        
        var searchBox = new google.maps.places.SearchBox(input);
        input.addEventListener('click', function (e) { this.select(); });
        
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length > 0) {
                console.log(places);
                update_current_location( places[0].geometry.location );
            }
        });
        //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });
        
        directions_display = new google.maps.DirectionsRenderer({
            markerOptions:{visible:false},
            polylineOptions:{strokeColor:'#88f',strokeOpacity: 1,strokeWeight: 10}
        });
        directions_service = new google.maps.DirectionsService;
        directions_display.setMap(map);
        
        //var trafficLayer = new google.maps.TrafficLayer();
        //trafficLayer.setMap(map);        
        
        map.addListener('click', function(e) { 
            update_current_location(e.latLng); 
            
            geocoder.geocode({'location': e.latLng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    input.value = results[0].formatted_address;
                    console.log(results);
                    //infowindow.setContent(results[1].formatted_address);
                    //infowindow.open(map, marker);
                 }
            });
        });
        
        


        setup_current_location();
        //update_current_location();
        update_destination(dest);
    }
    
    function setup_current_location() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition( function (pos) {
                //alert("Latitude: " + pos.coords.latitude + "\r\nLongitude: " + pos.coords.longitude);
                if (current_pos == null) {
                    current_pos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    map.panTo(current_pos);
                    map.setZoom(16);

                    update_current_location(current_pos);
                }
            },
            function() {
                // failed ... do nothing
                
            }, {
                enableHighAccuracy: true,
                maximumAge: 0                
            } ); 
        }
        
    }
    
