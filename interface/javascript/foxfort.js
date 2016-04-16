/**
 * Foxfort framework:
 *
 * Simple Module framework, based on Factory design pattrens.
 * - Module Registery
 * - Debuger
 * - Utils
 * - Config
 * - Global Constructor
 * - Allow default modules and extend modules.
 * - Multi enviroments and switch between enviroments
 *
 * @Date    03/01/2016 10:15
 * @Auther  Lior Lindvor
 * @Version 0.1
 **/
var foxfort = foxfort || {};

/**
 * Foxfort environment control
 * Allow you to create diffrent environment in your application.
 * With foxfort environment you can craete multi factories together 
 * 
 * build: (String) Environment Name, (Object) config
 * init : (String) Environment Name
 **/
foxfort.environment = ( function( )
{
    "use strict";
    return {
        build: function( environment, config )
        {
            environment = environment || "default";

            //----------------------------------
            // Creating new environment.
            //----------------------------------
            foxfort[environment]         = {};
            foxfort[environment].modules = {};
            foxfort[environment].storage = {};
            foxfort[environment].loader  = [];
            foxfort[environment].config  = foxfort.factory.utils.extender({
                defaultModule   : "",
                baseModule      : "",
                baseUrl         : "",
                assetsUrl       : "",
            }, config );

            //----------------------------------------------------------------------------------------------------------------
            // Setting up this environment as current environment. making all other environment objects as private to access
            //----------------------------------------------------------------------------------------------------------------
            this.init(environment);
        },

        init: function( environment )
        {
            foxfort.modules = foxfort[environment].modules;
            foxfort.storage = foxfort[environment].storage;
            foxfort.loader  = foxfort[environment].loader;
            foxfort.config  = foxfort[environment].config;
            return foxfort.factory;
        }
    }
} ( ) );

//----------------------------------------------------------------------------------------------------------------

/**
 * Foxfort debuger
 * Allow you to debug your app, printing a tree view of your application.
 * 
 * debuger : (Bool) call | true => "Return", null/false => printing into console.
 **/

foxfort.debuger = function( call )
{
    "use strict";
    var debuger = {
        _object : { },
        _builder: function()
        {
            this._object = foxfort;
        }
    }

    debuger._builder();

    if( call && call == true )
        return debuger._object;
    else
        console.log(debuger._object)
};

//----------------------------------------------------------------------------------------------------------------

/**
 * foxfort Factory Application
 * Load and create controllers&helpers inside the factory.
 *
 * create: make new section = module/controller inside the factory.
 * run   : run a section inside the factory.
 **/
foxfort.factory = ( function (  )
{
    "use strict";

    return {
        /**
         * @parm name     (String)
         * @parm content  (foxfort factory object)
         * @parm type
         * make new section inside the factory -> New Controller/Module
         **/
        module: function( name, content, type )
        {
            if( ! foxfort.modules[ name ] )
                foxfort.modules[ name ] = { type: type || 0, content: content, status: false };
            return this;
        },

        //------------------------------------------------------

        /**
         * Require a module from js assets.
         * Will include only if not exist
         **/
        require: function( name )
        {
            if( ! foxfort.modules[ name ] )
                this.utils.include._require( name, function()
                {
                    return { run: this.run( name ) };
                } );
            else
                return { run: this.run( name ) };
        },

        //------------------------------------------------------
        
        /**
         * run a section inside the factory.
         **/
        run: function( name )
        {
            if( foxfort.modules[ name ] )
            {
                var objectToReturn = null;

                //--------------------------------------------
                // Is the object can run? or Already runed?
                //--------------------------------------------
                if( foxfort.modules[ name ].status === false || ( foxfort.modules[ name ].status === true && foxfort.modules[ name ].type === 1 ) )
                {
                    foxfort.modules[ name ].status = true;
                    foxfort.loader.push( name );
                    return foxfort.modules[ name ].content;
                }

                //-----------------------------
                // Return empty object
                //-----------------------------
                return foxfort.factory.utils.getEmptyObject( foxfort.modules[ name ].content );
            }
        },

        //-------------------------------------------------------

        /**
         * Static storage, Will be deleated at every run of the application factory.
         * Please, use localStorage if you want to save the storage.
         **/
        storage: function( key, value )
        {
            if( key == "clear" )
            {
                //-----------------------------------------
                // Change here for default storage args.
                //-----------------------------------------
                foxfort.storage = { };
            }
            else
            {
                if( ! value )
                    return foxfort.storage[ key ];
                else
                    foxfort.storage[ key ] = value;
            }
        },

        //-----------------------------------------------------

        /**
         * Factory helpers class.
         * All the functions that the factory using to run.
         * If callback is function -> will run it when loaded.
         **/
        utils: {
            ready : function( callback )
            {
                window.onload = callback;
            },
            route: {
            
            },
            include: {
                //------------------------------------
                // Include group or single script
                //------------------------------------
                script: function( path, type, base, callback )
                {
                    if( path instanceof Array )
                        for( var script = 0; script < path.length; script++ )
                            this._init( "script", base + path[ script ] + ".js", callback, type );
                    else
                        this._init( "script", path, type, base ); // type => attr, base => callback.
                },

                //------------------------------------
                // Include group or signle style.
                //------------------------------------
                style: function( path, type, base, callback )
                {
                    if( path instanceof Array )
                        for( var style = 0; style < path.length; style++ )
                            this._init( "link", base + path[ style ] + ".css", callback, type );
                    else
                        this._init( "link", path, type, base );// type => attr, base => callback.
                },

                //--------------------------------
                // Load Application module file
                //--------------------------------
                _require: function( module, callback )
                {
                    this._init( "script", foxfort.config.modulesPath + module + ".js", callback, "module" );
                },

                //--------------------------------
                // Base include function.
                //--------------------------------
                _init: function( type, path, callback, attr )
                {
                    var element  = document.createElement(type);

                    if( type == "link" )
                    {
                        element.rel  = "stylesheet";
                        element.type = "text/css";
                    }
                    else
                        element.type = "text/javascript";
                    
                    element.setAttribute("foxfort-require", ( attr == null ) ? "" : attr );

                    //-------------------------------------------
                    // Return callback when element done loading.
                    //-------------------------------------------
                    if( callback && typeof( callback ) == "function" )
                    {
                        //-------------------------
                        // Internet Explorer fix
                        //-------------------------
                        if( element.readyState )
                        {
                            element.onreadystatechange = function()
                            {
                                if( element.readyState == "loaded" || element.readyState == "complete" )
                                {
                                    element.onreadystatechange = null;
                                    callback();
                                }
                            };
                        }
                        //---------------
                        // Others
                        //---------------
                        else
                            element.onload = callback;
                    }

                    if( type == "script" )
                        element.src = path;
                    else
                        element.href = path;

                    document.getElementsByTagName( ( type == "script" ) ? "body" : "head" )[0].appendChild(element);
                }
            },

            extender: function( obj1, obj2 )
            {
                for (var p in obj2)
                {
                    try {
                      if ( obj2[p].constructor==Object )
                        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
                      else
                        obj1[p] = obj2[p];
                    } catch(e) {
                      obj1[p] = obj2[p];
                    }
                }

                return obj1;
            },

            getEmptyObject: function( obj )
            {
                for(var m in obj)
                    if(typeof obj[m] == "function")
                        obj[ m ] = function() {};

                return obj;
            },
        }
    }
}( ));

//----------------------------------------------------------------------------------------------------------------

/**
 * Foxfort constructor
 * Our function to access foxfort objects.
 **/
function ff( environment, config )
{
    config      = ( typeof environment === 'object' ) ? environment : config;
    environment = ( typeof environment === 'object' ) ? "default" : environment;

    if( environment )
        if( foxfort[ environment ] )
            foxfort.environment.init( environment );
        else
            foxfort.environment.build( environment, config );
    
    //-----------------------------------------------------------------------------------------------------------
    // Pass config as global varibale, you can pass more varibales to acsess as "exctend" of ff() Constructor.
    //-----------------------------------------------------------------------------------------------------------
    return foxfort.factory.utils.extender({ config: foxfort.config },foxfort.factory);
};