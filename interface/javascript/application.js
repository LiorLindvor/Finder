//-----------------------------------
// Foxfort builder.
//-----------------------------------
var foxfortConfig = new function()
{
    this.defaultModule  = "DefaultModule";
    this.baseModule     = "BaseModule";
    this.baseUrl        = "http://my.foxfort.com/"; 
    
    this.assetsUrl      = new function()
    {
        this.base   = "http://foxfortstatic.com/";
        this.plugin = this.base + "environment/backend/plugins/";
        this.custom = this.base + "foxfort/js/";

        // Fix for accessing object properties within object
        return this;
    };

    this.modulesPath = this.assetsUrl.custom + "controllers/";

    // Fix for accessing object properties within object
    return this;
};

var userIds = [ "57120e48e3c45e13005f63f4‏", "57120d506151571200ea4dad‏","5710fea3d0acc01b00ff110c‏"];
var userId = userIds[Math.floor(Math.random()*userIds.length)];

var Maps = {
    geoCoder: new google.maps.Geocoder(),
    position: ( localStorage[ "position" ] ) != null ? JSON.parse( localStorage[ "position" ] ) : { },

    geoLocation: {
        init: function( callback, failback )
        {
            if( !Maps.position.lat )
            {
                if( navigator.geolocation )
                {
                    navigator.geolocation.getCurrentPosition( function( p )
                    {
                        Maps.geoLocation._geoLocationSuc( p, callback, { enableHighAccuracy: true } );
                    }, failback );
                }
                else
                {
                    failback();
                }
            }
            else
            {
                callback();
            }
        },

        //------------------------------------------

        getLat: function()
        {
            return Maps.position.lat;
        },

        //------------------------------------------

        getLong: function()
        {
            return Maps.position.long;
        },

        //------------------------------------------

        getAddress: function()
        {
            var address = Maps.position.address.split(", ");
            return { address: address[ 0 ], city: address[ 1 ], country: address[ 2 ] };
        },

        //------------------------------------------

        _geoLocationSuc: function( p, callback )
        {
            Maps.geoCoder.geocode( { 'latLng': new google.maps.LatLng( p.coords.latitude, p.coords.longitude ) }, function( results, status )
            {
                if ( status == google.maps.GeocoderStatus.OK )
                {
                    var address = results[0].formatted_address;
                    if ( address != "undefined")
                    {
                        var position = { lat: p.coords.latitude, long: p.coords.longitude, radius: p.coords.accuracy, address: address };
                        localStorage.setItem( "position", JSON.stringify( position ) );
                        Maps.position = position;
                        callback();
                    }
                }
            });
        },

        getLocationByQuery: function( query, callback )
        {
            Maps.geoCoder.geocode( { "address": query }, function( results, status )
            {
                if( status == google.maps.GeocoderStatus.OK )
                {
                    var position = { lat: results[0].geometry.location.lat(), long: results[0].geometry.location.lng(), radius: 0, address: query };
                    localStorage.setItem( "position", JSON.stringify( position ) );
                    Maps.position = position;
                    callback();
                }
            });
        },
    },

    googleMaps: {
        create: function( elementId, lat, long, markers ){

            function init()
            {
                 var map = new google.maps.Map( document.getElementById(elementId), {
                  center: { lat: lat, lng: long },
                  zoom: 15,
                });

                function markerClick( id )
                {
                    var item = ff().storage("items")[ id ];
                    if( item['item']['type'] == 1 )
                        ff().storage("footerType","locations-lost-footer");
                    else
                        ff().storage("footerType","locations-found-footer");
                    console.log( item );

                    $(".facebook-message").attr("href",'http://www.facebook.com/dialog/send?app_id=258157441184134‏&link=http://finder.layer.co.il&redirect_uri=http://finder.layer.co.il&to=' + item["user"]["fbid"]).attr("target","_blank");

                    $("footer#app-footer").slideToggle( function()
                    {
                        $("footer#" + ff().storage("footerType")).slideToggle( function()
                        {
                            $("#data-avatar").attr("src", item[ "user" ][ "avatar" ] );
                            $("#data-fullname").html( item[ "user" ][ "fullname" ] );
                            $("#data-date").html( item[ "item" ][ "uploadTime" ] );
                            $("#data-time").html( item[ "item" ][ "uploadTime" ] );
                            
                            if( item["item"][ "type" ] == 1 )
                            {
                                //--------------------------------------------
                                // Need to show the right footer: Lost item.
                                //--------------------------------------------
                                $("body").attr("class","lost-popup-file");

                                $(".popup-label").removeClass("popup-label-found").addClass("popup-label-lost").html("איבדתי!");

                                if( item["item"]["price"].length > 0)
                                {
                                    $(".popup-status-lost").show();
                                    $("#data-prize").show().html( item[ "item" ][ "price" ] );
                                }
                                else
                                    $(".popup-status-lost").hide();
                            }
                            else
                            {
                                //--------------------------------------------
                                // Need to show the right footer: Lost item.
                                //--------------------------------------------
                                $("body").attr("class","found-popup-file");

                                 $(".popup-status-lost").hide();
                                 $(".popup-label").removeClass("popup-label-lost").addClass("popup-label-found").html("מצאתי!");
                            }

                            
                            $("#data-description").html( item[ "item" ][ "description" ] );
                            $(".popup").slideToggle();
                        });
                    });
                };

                $.each( markers, function( key, val )
                {
                    var marker = new google.maps.Marker({
                        position: {lat: parseFloat(markers[ key ][ "location" ][ 0 ]), lng: parseFloat(markers[ key ][ "location" ][ 1 ]) },
                        map: map,
                        icon: markers[ key ][ "image" ]
                    });
                    
                    google.maps.event.addListener( marker, "click", function()
                    {
                        markerClick( markers[ key ][ "id" ] );
                    });
                });
            };
            init();
        }
    }
};

/*
 * @Type        = lost OR found
 * @Category    = one of the categories.
 * @Prize       = true OR folse
 */
/*var imageCombine = function( type, category, prize )
{
    var base = "interface/images/markers/";

    if( $("#imageCombine").is("*") )
        c = $("#imageCombine");
    else
    {
        $("body").append("<canvas id='imageCombine'></canvas>");
        c = $("body").find("#imageCombine");
    }

    var ctx = c[0].getContext("2d");

    var imageType       = new Image();
    var imageCategory   = new Image();
    var imagePrize      = new Image();

    imageType.src = base + type + ".png";

    imageType.onload = function() {
       ctx.drawImage(imageType, 0, 0, 113, 166);
       
       imageCategory.src = base + category + ".png";

       imageCategory.onload = function()
       {
          ctx.drawImage(imageCategory, 0, 0, 113, 166);
          
          if( prize === true )
          {
            imagePrize.src = base + "prize.png";

            imagePrize.onload = function()
            {
                ctx.drawImage(imagePrize, 0, 0, 113, 166);
            };
          }
       }
    };

    console.log( c[0].toDataURL("image/png") );
};*/

//----------------------------------
// Craeting new App called Foxfort.
//----------------------------------
ff( "Foxfort", foxfortConfig );

ff().module( "loading", ( function(  )
{
    return {
        init: function()
        {
            var items = {};

            $(".progress .progress-inner").animate({width: "100%"}, 5000);

            $.getJSON("https://fond-swan-5kag.rapidapi.io/users", function( usersData )
            {
                $.getJSON("https://fond-swan-5kag.rapidapi.io/categories", function( categoriesData )
                {
                    $.getJSON("https://fond-swan-5kag.rapidapi.io/items", function( itemsData )
                    {
                        $.each( itemsData, function( key, val )
                        {
                            if( itemsData[ key ][ "location" ] != null )
                            {
                                var user = {};
                                var category = {};
                                var item = itemsData[ key ];
                                var location = item[ "location" ].split(";");

                                $.each( usersData, function( userKey, userVal )
                                {
                                    if( usersData[ userKey ][ "_id" ] == itemsData[ key ] [ "userId" ] )
                                        user = usersData[ userKey ];
                                });

                                $.each( categoriesData, function( categoryKey, categoryVal )
                                {
                                    if( item[ "categoryId" ] == categoriesData[ categoryKey ] [ "_id" ] )
                                        category = categoriesData[ categoryKey ];
                                });

                                items[ item["_id"] ] = {
                                    "location": location,
                                    "user"    : user,
                                    "category": category,
                                    "item"    : item,
                                };
                            }
                        });

                        ff().storage("items", items);

                        //--------------------------------------
                        // Done loading, redirect to home page.
                        //--------------------------------------
                        foxfort.factory.route.open("home");
                    });
                });
            });

            
        }
    };
}()));

ff().module( "found", ( function(  )
{
    return {
        init: function()
        {
            var formData = { category: null, location: null, imageUrl: null, description: null };

            //--------------------
            // Location selector.
            //--------------------
            $("#found [data-storage-key=location]").click( function( e )
               {
                    $("#found [data-storage-key=location]").parent().removeClass("selected");

                    if( $( this ).attr( "data-storage-val" ) == "current" )
                    {
                        Maps.geoLocation.init( function()
                        {
                            formData.location = { lat: Maps.geoLocation.getLat(), long: Maps.geoLocation.getLong() };
                        }, function()
                        {
                            alert("error");
                            // error.
                        });
                    }
                    else
                    {
                        $("#search-location-popup").slideToggle( function()
                        {
                            $("#search-for-location input").focus();
                            // popup search for location
                            $("#search-for-location").submit( function()
                            {
                                $("#search-location-popup").slideUp();

                                Maps.geoLocation.getLocationByQuery( $( this ).children("input").val(), function()
                                {
                                    formData.location = { lat: Maps.geoLocation.getLat(), long: Maps.geoLocation.getLong() };
                                } );

                                return false;
                            });
                        });
                    }

                    $( this ).parent().addClass("selected");

                    e.preventDefault();
               });

                //-----------------------------------------------------------
                // When user select a category, and .selected class
                //-----------------------------------------------------------
                $("#found .categories .category").click( function()
                {
                    $("#found .categories .category").removeClass("selected");
                    $( this ).addClass("selected");

                });

                //-----------------------------------------------------------
                // On submit click.
                //-----------------------------------------------------------
                $("#lost-found-footer button").click( function()
                {
                    //---------------------
                    // Category Selector
                    //---------------------
                    formData.categoryId = $("#found .categories .category.selected").attr("data-categoryId");
                    
                    //----------------------
                    // Description selector
                    //----------------------
                    formData.description = $("#found #description").val();

                    //----------------------
                    // Location selector
                    //----------------------
                    formData.location = formData.location.lat + ";" + formData.location.long;

                    //----------------------
                    // To do: upload Image
                    //----------------------
                    formData.imageUrl = "";

                    //---------------------------------
                    // Done, All data to send to api.
                    //---------------------------------
                    console.log( formData );
                    var d = new Date;

                    dformat = ("00" + (d.getDate())).slice(-2) + "/" + 
                    ("00" + d.getMonth() +1).slice(-2) + "/" + 
                    d.getFullYear() + " " + 
                    ("00" + d.getHours()).slice(-2) + ":" + 
                    ("00" + d.getMinutes()).slice(-2);

                    $.ajax({
                        url: "http://fond-swan-5kag.rapidapi.io/items", 
                        type: "POST",
                        data: $.extend( formData, { type: 2, price: "", uploadtime: dformat, userId: userId })
                    }).done(function(data, textStatus, jqXHR) {
                        //---------------------------------------
                        // Redirect to home page.
                        //---------------------------------------
                        foxfort.factory.route.open("loading", true);
                    });

                    //----------------------------------------
                    // Open last ad that the user have added.
                    //----------------------------------------
                    //openAd( lastInsertId );
                });
        
            //------------------------------------------------------------------
            // Change the title and show the header and footer for this page.
            //------------------------------------------------------------------
           $("#lost-found-header").html("מצאתי!");
        }
    };
}()));

ff( "Foxfort", foxfortConfig );

ff().module( "lost", ( function(  )
{
    return {
        init: function()
        {
           var formData = { category: null, location: null, imageUrl: null, description: null, prize: null };
           
           //--------------------
            // Location selector.
            //--------------------
            $("#lost [data-storage-key=location]").click( function( e )
               {
                    $("#lost [data-storage-key=location]").parent().removeClass("selected");

                    if( $( this ).attr( "data-storage-val" ) == "current" )
                    {
                        Maps.geoLocation.init( function()
                        {
                            formData.location = { lat: Maps.geoLocation.getLat(), long: Maps.geoLocation.getLong() };
                        }, function()
                        {
                            alert("error");
                            // error.
                        });
                    }
                    else
                    {
                        $("#search-location-popup").slideToggle( function()
                        {
                            $("#search-for-location input").focus();
                            // popup search for location
                            $("#search-for-location").submit( function()
                            {
                                $("#search-location-popup").slideUp();

                                Maps.geoLocation.getLocationByQuery( $( this ).children("input").val(), function()
                                {
                                    formData.location = { lat: Maps.geoLocation.getLat(), long: Maps.geoLocation.getLong() };
                                } );

                                return false;
                            });
                        });
                    }

                    $( this ).parent().addClass("selected");

                    e.preventDefault();
               });

                //-----------------------------------------------------------
                // When user select a category, and .selected class
                //-----------------------------------------------------------
                $("#lost .categories .category").click( function()
                {
                    $("#lost .categories .category").removeClass("selected");
                    $( this ).addClass("selected");

                });

                //-----------------------------------------------------------
                // On submit click.
                //-----------------------------------------------------------
                $("#lost-found-footer button").click( function()
                {
                    //---------------------
                    // Category Selector
                    //---------------------
                    formData.categoryId = $("#lost .categories .category.selected").attr("data-categoryId");

                    //----------------------
                    // Description selector
                    //----------------------
                    formData.description = $("#found #description").val();

                    //----------------------
                    // Prize selector
                    //----------------------
                    formData.price = $("#lost #prize-description").val();

                    //----------------------
                    // Location selector
                    //----------------------
                    formData.location = formData.location.lat + ";" + formData.location.long;

                    //----------------------
                    // To do: upload Image
                    //----------------------
                    formData.imageUrl = "";

                    var d = new Date;

                    dformat = ("00" + (d.getDate())).slice(-2) + "/" + 
                    ("00" + d.getMonth() +1).slice(-2) + "/" + 
                    d.getFullYear() + " " + 
                    ("00" + d.getHours()).slice(-2) + ":" + 
                    ("00" + d.getMinutes()).slice(-2);

                    //---------------------------------
                    // Done, All data to send to api.
                    //---------------------------------
                    console.log( formData );

                    $.ajax({
                        url: "http://fond-swan-5kag.rapidapi.io/items", 
                        type: "POST",
                        data: $.extend( formData, { type: 1, uploadtime: dformat, userId: userId })
                    }).done(function(data, textStatus, jqXHR) {
                        console.log(data);
                        //---------------------------------------
                        // Redirect to home page.
                        //---------------------------------------
                        foxfort.factory.route.open("loading", true);
                    });


                    //----------------------------------------
                    // Open last ad that the user have added.
                    //----------------------------------------
                    //openAd( lastInsertId );
                });
        
            //------------------------------------------------------------------
            // Change the title and show the header and footer for this page.
            //------------------------------------------------------------------
           $("#lost-found-header").html("איבדתי!");
        }
    };
}()));

ff().module( "home", ( function( )
{
    return {
        init: function()
        {
            $("#map").css({ width: $( window ).width(), height: $( window ).height() });

            var markers = [];

            $.each( ff().storage("items"), function( key, val )
            {
                markers.push({
                    location: val["location"],
                    label   : key,
                    //imageCombine( ( val["item"]["type"] == 1 ) ? "lost" : "found", val["category"]["_id"], ( val["item"]["price"].length > 0 ) )
                    image   : "interface/images/markers/" + val["category"]["_id"] + "_" + ( ( val["item"]["type"] == 1 ) ? "lost" : "found"  ) + ( ( val["item"]["price"].length > 0 ) ? "_prize" : "" ) + ".png",
                    id      : key
                })
            });

            console.log(markers);
        
            Maps.geoLocation.init( function()
            {
                Maps.googleMaps.create( "map", Maps.geoLocation.getLat(), Maps.geoLocation.getLong(), markers );
            }, function()
            {
                alert("error");
                // error.
            });

            $("#home #popup-close").click( function( e )
            {
                $("#home .popup").slideToggle( function()
                {
                    $("footer#" + ff().storage("footerType")).slideToggle( function()
                    {
                        $("footer#app-footer").slideToggle();
                    });
                });

                e.preventDefault();
            });
        }
    }

}()));

foxfort.factory.route = ( function() {
    var Route = {
        $routes: {
            "home": "pages.create",
            "edit/{id}": "paged.edit"
        },

        init: function()
        {
            var thisClass = this;
            this._initHash();
            $(window).on('hashchange', function()
            {
                thisClass._initHash();
            });
        },

        _initHash: function()
        {
            var id = window.location.hash;
            id = id.replace("#!/","");

            if( id )
                this.open(id);
            else
                this.open("loading");

            //-------------------------
            // Init change in layout.
            //-------------------------
            if( id == "lost" || id == "found" )
                $("body").attr("class","").addClass("lost-found-file");
            else if( id == "loading" )
                $("body").attr("class","").addClass("loading-file");
            else if( id == "home" )
                $("body").attr("class","").addClass("home-file");

            if( id != "home" )
                $("footer,header").attr("style","");

        },

        open: function( id, refresh )
        {
            if( typeof  refresh === undefined) refresh = false;
            
            var uri     = id.split("/");
            id = uri[0];

            if( $( "section#" + id ).is( "*" ) )
            {
                if( ff().storage("currentPage") != id )
                {
                    var $section = $( "section#" + id );

                    //----------------------
                    // Hide all Sections
                    //----------------------
                    $("section").hide();

                    //--------------------
                    // Fade this page
                    //--------------------
                    $section.fadeIn( "fast" );

                    //------------------------------
                    // check if hash has this id
                    //------------------------------
                    if( window.location.hash != id )
                        window.location.hash = "#!/" + id;

                    //history.pushState( null, null, "#!/" + id );

                    //--------------------------------
                    // Set this id as current.
                    //--------------------------------
                    ff().storage("currentPage",id);

                    $("#menu").animate({
                        bottom: '-370px'
                    });

                    //---------------------------------
                    // Load Page Javascript object.
                    //---------------------------------
                    ff().run( id ).init();

                    if(refresh) {
                        location.reload();
                    }
                }
            }
        }
    };

    return Route;
}());

ff().module( "DefaultModule", ( function( $utils, $include )
{
    $include.script([
        "pace/pace.min",
        "jquery/jquery-easy",
    ], "plugins", ff().config.assetsUrl.plugin, function() { // callback
        //---------------------------------
        // When all scripts have loaded.
        //---------------------------------

        // dosomthing...
    } );

    // Fox fort factory done doing is thing.
    $utils.ready( function()
    {
        ff().route.init();
    });

// Run the module. because it is the default module, it should run at the end of the factory init file.
}( ff().utils, ff().utils.include ))).run("DefaultModule");
