(function(can, window, undefined){
// # CanJS v#{VERSION}
// (c) 2012 Bitovi  
// MIT license  
// [http://canjs.us/](http://canjs.us/)
;


	// jquery.js
	// ---------
	// _jQuery node list._
	$.extend( can, jQuery, {
		trigger: function( obj, event, args ) {
			obj.trigger ?
				obj.trigger( event, args ) :
				$.event.trigger( event, args, obj, true );
		},
		addEvent: function(ev, cb){
			$([this]).bind(ev, cb)
			return this;
		},
		removeEvent: function(ev, cb){
			$([this]).unbind(ev, cb)
			return this;
		},
		// jquery caches fragments, we always needs a new one
		buildFragment : function(result, element){
			var ret = $.buildFragment([result],[element]);
			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment
		},
		$: jQuery
	});

	// Wrap binding functions.
	$.each(['bind','unbind','undelegate','delegate'],function(i,func){
		can[func] = function(){
			var t = this[func] ? this : $([this])
			t[func].apply(t, arguments)
			return this;
		}
	})

	// Wrap modifier functions.
	$.each(["append","filter","addClass","remove","data","get"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1))
		}
	})

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function( elems ) {
		$.each( elems, function( i, elem ) {
			can.trigger(elem,"destroyed",[],false)
		});
		oldClean(elems);
	};
;

	can.each = function (elements, callback, context) {
		var i = 0,
		    key;
		if (elements) {
			if (typeof elements.length == 'number' && elements.pop) {
				elements.attr && elements.attr('length');
				for (var len = elements.length; i < len; i++) {
					if (callback.call(context || elements[i], elements[i], i, elements) === false) {
						break;
					}
				}
			} else {
				for (key in elements) {
					if (callback.call(context || elements[i], elements[key], key, elements) === false) {
						break;
					}
				}
			}
		}
		return elements;
	}
;


	// ##string.js
	// _Miscellaneous string utility functions._  
	
	// Several of the methods in this plugin use code adapated from Prototype
	// Prototype JavaScript framework, version 1.6.0.1.
	// ?? 2005-2007 Sam Stephenson
	var undHash     = /_|-/,
		colons      = /==/,
		words       = /([A-Z]+)([A-Z][a-z])/g,
		lowUp       = /([a-z\d])([A-Z])/g,
		dash        = /([a-z\d])([A-Z])/g,
		replacer    = /\{([^\}]+)\}/g,
		quote       = /"/g,
		singleQuote = /'/g,

		// Returns the `prop` property from `obj`.
		// If `add` is true and `prop` doesn't exist in `obj`, create it as an 
		// empty object.
		getNext = function( obj, prop, add ) {
			return prop in obj ?
				obj[ prop ] : 
				( add && ( obj[ prop ] = {} ));
		},

		// Returns `true` if the object can have properties (no `null`s).
		isContainer = function( current ) {
			return /^f|^o/.test( typeof current );
		};

		can.extend(can, {
			// Escapes strings for HTML.
			/**
			 * @function can.esc
			 * @parent can.util
			 *
			 * `can.esc(string)` escapes a string for insertion into html.
			 * 
			 *     can.esc( "<foo>&<bar>" ) //-> "&lt;foo&lt;&amp;&lt;bar&lt;"
			 */
			esc : function( content ) {
				return ( "" + content )
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(quote, '&#34;')
					.replace(singleQuote, "&#39;");
			},
			
			/**
			 * @function can.getObject
			 * @parent can.util
			 * Gets an object from a string.  It can also modify objects on the
			 * 'object path' by removing or adding properties.
			 * 
			 *     Foo = {Bar: {Zar: {"Ted"}}}
		 	 *     can.getObject("Foo.Bar.Zar") //-> "Ted"
			 * 
			 * @param {String} name the name of the object to look for
			 * @param {Array} [roots] an array of root objects to look for the 
			 *   name.  If roots is not provided, the window is used.
			 * @param {Boolean} [add] true to add missing objects to 
			 *  the path. false to remove found properties. undefined to 
			 *  not modify the root object
			 * @return {Object} The object.
			 */
			getObject : function( name, roots, add ) {
			
				// The parts of the name we are looking up  
				// `['App','Models','Recipe']`
				var parts = name ? name.split('.') : [],
					length =  parts.length,
					current,
					r = 0,
					ret, i;
				
				// Make sure roots is an `array`.
				roots = can.isArray(roots) ? roots : [roots || window];
				
				if ( ! length ) {
					return roots[0];
				}

				// For each root, mark it as current.
				while( current = roots[r++] ) {

					// Walk current to the 2nd to last object or until there 
					// is not a container.
					for (i =0; i < length - 1 && isContainer( current ); i++ ) {
						current = getNext( current, parts[i], add );
					}

					// If we can get a property from the 2nd to last object...
					if( isContainer(current) ) {
						
						// Get (and possibly set) the property.
						ret = getNext(current, parts[i], add); 
						
						// If there is a value, we exit.
						if ( ret !== undefined ) {
							// If `add` is `false`, delete the property
							if ( add === false ) {
								delete current[parts[i]];
							}
							return ret;
							
						}
					}
				}
			},
			// Capitalizes a string.
			/**
			 * @function can.capitalize
			 * @parent can.util
			 * `can.capitalize(string)` capitalizes the first letter of the string passed.
			 *
			 *		can.capitalize('candy is fun!'); //-> Returns: 'Candy is fun!'
			 *
			 * @param {String} s the string.
			 * @return {String} a string with the first character capitalized.
			 */
			capitalize: function( s, cache ) {
				// Used to make newId.
				return s.charAt(0).toUpperCase() + s.slice(1);
			},
			
			// Underscores a string.
			/**
			 * @function can.underscore
			 * @parent can.util
			 * 
			 * Underscores a string.
			 * 
			 *     can.underscore("OneTwo") //-> "one_two"
			 * 
			 * @param {String} s
			 * @return {String} the underscored string
			 */
			underscore: function( s ) {
				return s
					.replace(colons, '/')
					.replace(words, '$1_$2')
					.replace(lowUp, '$1_$2')
					.replace(dash, '_')
					.toLowerCase();
			},
			// Micro-templating.
			/**
			 * @function can.sub
			 * @parent can.util
			 * 
			 * Returns a string with {param} replaced values from data.
			 * 
			 *     can.sub("foo {bar}",{bar: "far"})
			 *     //-> "foo far"
			 *     
			 * @param {String} s The string to replace
			 * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
			 * objects can be used.
			 * @param {Boolean} [remove] if a match is found, remove the property from the object
			 */
			sub: function( str, data, remove ) {

				var obs = [];

				obs.push( str.replace( replacer, function( whole, inside ) {

					// Convert inside to type.
					var ob = can.getObject( inside, data, remove );
					
					// If a container, push into objs (which will return objects found).
					if ( isContainer( ob ) ) {
						obs.push( ob );
						return "";
					} else {
						return "" + ob;
					}
				}));
				
				return obs.length <= 1 ? obs[0] : obs;
			},

			// These regex's are used throughout the rest of can, so let's make
			// them available.
			replacer : replacer,
			undHash : undHash
		});
;


	// ## construct.js
	// `can.Construct`  
	// _This is a modified version of
	// [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
	// It provides class level inheritance and callbacks._
	
	// A private flag used to initialize a new class instance without
	// initializing it's bindings.
	var initializing = 0;

	/** 
	 * @add can.Construct 
	 */
	can.Construct = function() {
		if (arguments.length) {
			return can.Construct.extend.apply(can.Construct, arguments);
		}
	};

	/**
	 * @static
	 */
	can.extend(can.Construct, {
		/**
		 * @function newInstance
		 * Creates a new instance of the constructor function.  This method is useful for creating new instances
		 * with arbitrary parameters.  Typically you want to simply use the __new__ operator instead.
		 * 
		 * ## Example
		 * 
		 * The following creates a `Person` Construct and then creates a new instance of person, but
		 * by using `apply` on newInstance to pass arbitrary parameters.
		 * 
		 *     var Person = can.Construct({
		 *       init : function(first, middle, last) {
		 *         this.first = first;
		 *         this.middle = middle;
		 *         this.last = last;
		 *       }
		 *     });
		 * 
		 *     var args = ["Justin","Barry","Meyer"],
		 *         justin = new Person.newInstance.apply(null, args);
		 * 
		 * @param {Object} [args] arguments that get passed to [can.Construct::setup] and [can.Construct::init]. Note
		 * that if [can.Construct::setup] returns an array, those arguments will be passed to [can.Construct::init]
		 * instead.
		 * @return {class} instance of the class
		 */
		newInstance: function() {
			// Get a raw instance object (`init` is not called).
			var inst = this.instance(),
				arg = arguments,
				args;
				
			// Call `setup` if there is a `setup`
			if ( inst.setup ) {
				args = inst.setup.apply(inst, arguments);
			}

			// Call `init` if there is an `init`  
			// If `setup` returned `args`, use those as the arguments
			if ( inst.init ) {
				inst.init.apply(inst, args || arguments);
			}

			return inst;
		},
		// Overwrites an object with methods. Used in the `super` plugin.
		// `newProps` - New properties to add.  
		// `oldProps` - Where the old properties might be (used with `super`).  
		// `addTo` - What we are adding to.
		_inherit: function( newProps, oldProps, addTo ) {
			can.extend(addTo || newProps, newProps || {})
		},
		// used for overwriting a single property.
		// this should be used for patching other objects
		// the super plugin overwrites this
		_overwrite : function(what, oldProps, propName, val){
			what[propName] = val;
		},
		// Set `defaults` as the merger of the parent `defaults` and this 
		// object's `defaults`. If you overwrite this method, make sure to
		// include option merging logic.
		/**
		 * Setup is called immediately after a constructor function is created and 
		 * set to inherit from its base constructor.  It is called with a base constructor and
		 * the params used to extend the base constructor. It is useful for setting up additional inheritance work.
		 * 
		 * ## Example
		 * 
		 * The following creates a `Base` class that when extended, adds a reference to the base
		 * class.
		 * 
		 * 
		 *     Base = can.Construct({
		 *       setup : function(base, fullName, staticProps, protoProps){
		 * 	       this.base = base;
		 *         // call base functionality
		 *         can.Construct.setup.apply(this, arguments)
		 *       }
		 *     },{});
		 * 
		 *     Base.base //-> can.Construct
		 *     
		 *     Inherting = Base({});
		 * 
		 *     Inheriting.base //-> Base
		 * 
		 * ## Base Functionality
		 * 
		 * Setup deeply extends the static `defaults` property of the base constructor with 
		 * properties of the inheriting constructor.  For example:
		 * 
		 *     MyBase = can.Construct({
		 *       defaults : {
		 *         foo: 'bar'
		 *       }
		 *     },{})
		 * 
		 *     Inheriting = MyBase({
		 *       defaults : {
		 *         newProp : 'newVal'
		 *       }
		 *     },{}
		 *     
		 *     Inheriting.defaults // -> {foo: 'bar', 'newProp': 'newVal'}
		 * 
		 * @param {Object} base the base constructor that is being inherited from
		 * @param {String} [fullName] the name of the new constructor
		 * @param {Object} [staticProps] the static properties of the new constructor
		 * @param {Object} [protoProps] the prototype properties of the new constructor
		 */
		setup: function( base, fullName ) {
			this.defaults = can.extend(true,{}, base.defaults, this.defaults);
		},
		// Create's a new `class` instance without initializing by setting the
		// `initializing` flag.
		instance: function() {

			// Prevents running `init`.
			initializing = 1;

			var inst = new this();

			// Allow running `init`.
			initializing = 0;

			return inst;
		},
		// Extends classes.
		/**
		 * @hide
		 * Extends a class with new static and prototype functions.  There are a variety of ways
		 * to use extend:
		 * 
		 *     // with className, static and prototype functions
		 *     can.Construct('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     can.Construct('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     can.Construct('Task')
		 * 
		 * You no longer have to use <code>.extend</code>.  Instead, you can pass those options directly to
		 * can.Construct (and any inheriting classes):
		 * 
		 *     // with className, static and prototype functions
		 *     can.Construct('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     can.Construct('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     can.Construct('Task')
		 * 
		 * @param {String} [fullName]  the classes name (used for classes w/ introspection)
		 * @param {Object} [klass]  the new classes static/class functions
		 * @param {Object} [proto]  the new classes prototype functions
		 * 
		 * @return {can.Construct} returns the new class
		 */
		extend: function( fullName, klass, proto ) {
			// Figure out what was passed and normalize it.
			if ( typeof fullName != 'string' ) {
				proto = klass;
				klass = fullName;
				fullName = null;
			}

			if ( ! proto ) {
				proto = klass;
				klass = null;
			}
			proto = proto || {};

			var _super_class = this,
				_super = this.prototype,
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor).
			prototype = this.instance();
			
			// Copy the properties over onto the new prototype.
			can.Construct._inherit(proto, _super, prototype);

			// The dummy class constructor.
			function Constructor() {
				// All construction is actually done in the init method.
				if ( ! initializing ) {
					return this.constructor !== Constructor && arguments.length ?
						// We are being called without `new` or we are extending.
						arguments.callee.extend.apply(arguments.callee, arguments) :
						// We are being called with `new`.
						this.constructor.newInstance.apply(this.constructor, arguments);
				}
			}

			// Copy old stuff onto class (can probably be merged w/ inherit)
			for ( name in _super_class ) {
				if ( _super_class.hasOwnProperty(name) ) {
					Constructor[name] = _super_class[name];
				}
			}

			// Copy new static properties on class.
			can.Construct._inherit(klass, _super_class, Constructor);

			// Setup namespaces.
			if ( fullName ) {

				var parts = fullName.split('.'),
					shortName = parts.pop(),
					current = can.getObject(parts.join('.'), window, true),
					namespace = current,
					_fullName = can.underscore(fullName.replace(/\./g, "_")),
					_shortName = can.underscore(shortName);

				//@steal-remove-start
				if(current[shortName]){
					
				}
				//@steal-remove-end
				
				current[shortName] = Constructor;
			}

			// Set things that shouldn't be overwritten.
			can.extend(Constructor, {
				constructor: Constructor,
				prototype: prototype,
				/**
				 * @attribute namespace 
				 * The namespace keyword is used to declare a scope. This enables you to organize
				 * code and provides a way to create globally unique types.
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.namespace //-> MyOrg
				 * 
				 */
				namespace: namespace,
				/**
				 * @attribute shortName
				 * If you pass a name when creating a Construct, the `shortName` property will be set to the
				 * actual name without the namespace:
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.shortName //-> 'MyConstructor'
				 *     MyOrg.MyConstructor.fullName //->  'MyOrg.MyConstructor'
				 * 
				 */
				shortName: shortName,
				_shortName : _shortName,
				/**
				 * @attribute fullName 
				 * If you pass a name when creating a Construct, the `fullName` property will be set to
				 * the actual name including the full namespace:
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.shortName //-> 'MyConstructor'
				 *     MyOrg.MyConstructor.fullName //->  'MyOrg.MyConstructor'
				 * 
				 */
				fullName: fullName,
				_fullName: _fullName
			});

			// Make sure our prototype looks nice.
			Constructor.prototype.constructor = Constructor;

			
			// Call the class `setup` and `init`
			var t = [_super_class].concat(can.makeArray(arguments)),
				args = Constructor.setup.apply(Constructor, t );
			
			if ( Constructor.init ) {
				Constructor.init.apply(Constructor, args || t );
			}

			/**
			 * @prototype
			 */
			return Constructor;
			/** 
			 * @function setup
			 * 
			 * If a prototype `setup` method is provided, it is called when a new 
			 * instance is created.  It is passed the same arguments that
			 * were passed to the Constructor constructor 
			 * function (`new Constructor( arguments ... )`).  If `setup` returns an
			 * array, those arguments are passed to [can.Construct::init] instead
			 * of the original arguments.
			 * 
			 * Typically, you should only provide [can.Construct::init] methods to 
			 * handle initilization code. Use `setup` for:
			 * 
			 *   - initialization code that you want to run before inheriting constructor's 
			 *     init method is called.
			 *   - initialization code that should run without inheriting constructors having to 
			 *     call base methods (ex: `MyBase.prototype.init.call(this, arg1)`).
			 *   - passing modified/normalized arguments to `init`.
			 * 
			 * ## Examples
			 * 
			 * The following is similar to code in [can.Control]'s setup method that
			 * converts the first argument to a jQuery collection and extends the 
			 * second argument with the constructor's [can.Construct.defaults defaults]:
			 * 
			 *     can.Construct("can.Control",{
			 *       setup: function( htmlElement, rawOptions ) {
			 *         // set this.element
			 *         this.element = $(htmlElement);
			 * 
			 *         // set this.options
			 *         this.options = can.extend( {}, 
			 * 	                               this.constructor.defaults, 
			 * 	                               rawOptions );
			 * 
			 *         // pass the wrapped element and extended options
			 *         return [this.element, this.options] 
			 *       }
			 *     })
			 * 
			 * ## Base Functionality
			 * 
			 * Setup is not defined on can.Construct itself, so calling super in inherting classes
			 * will break.  Don't do the following:
			 * 
			 *     Thing = can.Construct({
			 *       setup : function(){
			 *         this._super(); // breaks!
			 *       }
			 *     })
			 * 
			 * @return {Array|undefined} If an array is return, [can.Construct.prototype.init] is 
			 * called with those arguments; otherwise, the original arguments are used.
			 */
			//  
			/** 
			 * @function init
			 * 
			 * If a prototype `init` method is provided, it gets called after [can.Construct::setup] when a new instance
			 * is created. The `init` method is where your constructor code should go. Typically,
			 * you will find it saving the arguments passed to the constructor function for later use. 
			 * 
			 * ## Examples
			 * 
			 * The following creates a Person constructor with a first and last name property:
			 * 
			 *     var Person = can.Construct({
			 *       init : function(first, last){
			 *         this.first = first;
			 *         this.last = last;
			 *       }
			 *     })
			 * 
			 *     var justin = new Person("Justin","Meyer");
			 *     justin.first //-> "Justin"
			 *     justin.last  //-> "Meyer"
			 * 
			 * The following extends person to create a Programmer constructor
			 * 
			 *     var Programmer = Person({
			 *       init : function(first, last, lang){
			 *         // call base functionality
			 *         Person.prototype.init.call(this, first, last);
			 * 
			 *         // save the lang
			 *         this.lang = lang
			 *       },
			 *       greet : function(){
			 *         return "I am " + this.first + " " + this.last + ". " +
			 *                "I write " + this.lang + ".";
			 *       }
			 *     })
			 * 
			 *     var brian = new Programmer("Brian","Moschel","ECMAScript")
			 *     brian.greet() //-> "I am Brian Moschel.\
			 *                   //    I write ECMAScript."
			 * 
			 * ## Notes
			 * 
			 * [can.Construct::setup] is able to modify the arguments passed to init.
			 * 
			 * It doesn't matter what init returns because the `new` keyword always
			 * returns the new object.
			 */
			//  
			/**
			 * @attribute constructor
			 * 
			 * A reference to the constructor function that created the instance. It allows you to access
			 * the constructor function's static properties from an instance.
			 * 
			 * ## Example
			 * 
			 * Incrementing a static counter, that counts how many instances have been created:
			 * 
			 *     Counter = can.Construct({
			 * 	     count : 0
			 *     },{
			 *       init : function(){
			 *         this.constructor.count++;
			 *       }
			 *     })
			 * 
			 *     new Counter();
			 *     Counter.count //-> 1; 
			 * 
			 */
		}

	});

;

	// ## observe.js  
	// `can.Observe`  
	// _Provides the observable pattern for JavaScript Objects._  
	//  
	// Returns `true` if something is an object with properties of its own.
	var canMakeObserve = function( obj ) {
			return obj && typeof obj === 'object' && !(obj instanceof Date);
		},

		// Removes all listeners.
		unhookup = function(items, namespace){
			return can.each(items, function(item){
				if(item && item.unbind){
					item.unbind("change" + namespace);
				}
			});
		},
		// Listens to changes on `val` and "bubbles" the event up.  
		// `val` - The object to listen for changes on.  
		// `prop` - The property name is at on.  
		// `parent` - The parent object of prop.  
		hookupBubble = function( val, prop, parent ) {
			// If it's an `array` make a list, otherwise a val.
			if (val instanceof Observe){
				// We have an `observe` already...
				// Make sure it is not listening to this already
				unhookup([val], parent._namespace);
			} else if ( can.isArray(val) ) {
				val = new Observe.List(val);
			} else {
				val = new Observe(val);
			}
			
			// Listen to all changes and `batchTrigger` upwards.
			val.bind("change" + parent._namespace, function( ev, attr ) {
				// `batchTrigger` the type on this...
				var args = can.makeArray(arguments),
					ev = args.shift();
					args[0] = prop === "*" ? 
						parent.indexOf(val)+"." + args[0] :
						prop +  "." + args[0];
				// track objects dispatched on this observe		
				ev.triggeredNS = ev.triggeredNS || {};
				// if it has already been dispatched exit
				if (ev.triggeredNS[parent._namespace]) {
					return;
				}
				ev.triggeredNS[parent._namespace] = true;
						
				can.trigger(parent, ev, args);
				can.trigger(parent,args[0],args);
			});

			return val;
		},
		
		// An `id` to track events for a given observe.
		observeId = 0,
		// A reference to an `array` of events that will be dispatched.
		collecting = undefined,
		// Call to start collecting events (`Observe` sends all events at
		// once).
		collect = function() {
			if (!collecting ) {
				collecting = [];
				return true;
			}
		},
		// Creates an event on item, but will not send immediately 
		// if collecting events.  
		// `item` - The item the event should happen on.  
		// `event` - The event name, ex: `change`.  
		// `args` - Tn array of arguments.
		batchTrigger = function( item, event, args ) {
			// Don't send events if initalizing.
			if ( ! item._init) {
				if (!collecting ) {
					return can.trigger(item, event, args);
				} else {
					collecting.push([
					item,
					{
						type: event,
						batchNum : batchNum
					}, 
					args ] );
				}
			}
		},
		// Which batch of events this is for -- might not want to send multiple
		// messages on the same batch.  This is mostly for event delegation.
		batchNum = 1,
		// Sends all pending events.
		sendCollection = function() {
			var items = collecting.slice(0);
			collecting = undefined;
			batchNum++;
			can.each(items, function( item ) {
				can.trigger.apply(can, item)
			})
			
		},
		// A helper used to serialize an `Observe` or `Observe.List`.  
		// `observe` - The observable.  
		// `how` - To serialize with `attr` or `serialize`.  
		// `where` - To put properties, in an `{}` or `[]`.
		serialize = function( observe, how, where ) {
			// Go through each property.
			observe.each(function( val, name ) {
				// If the value is an `object`, and has an `attrs` or `serialize` function.
				where[name] = canMakeObserve(val) && can.isFunction( val[how] ) ?
				// Call `attrs` or `serialize` to get the original data back.
				val[how]() :
				// Otherwise return the value.
				val
			})
			return where;
		},
		$method = function( name ) {
			return function() {
				return can[name].apply(this, arguments );
			}
		},
		bind = $method('addEvent'),
		unbind = $method('removeEvent'),
		attrParts = function(attr){
			return can.isArray(attr) ? attr : (""+attr).split(".")
		};
	/**
	 * @add can.Observe
	 */
	var Observe = can.Construct('can.Observe', {
		// keep so it can be overwritten
		setup : function(){
			can.Construct.setup.apply(this, arguments)
		},
		bind : bind,
		unbind: unbind,
		id: "id"
	},
	/**
	 * @prototype
	 */
	{
		setup: function( obj ) {
			// `_data` is where we keep the properties.
			this._data = {};
			// The namespace this `object` uses to listen to events.
			this._namespace = ".observe" + (++observeId);
			// Sets all `attrs`.
			this._init = 1;
			this.attr(obj);
			delete this._init;
		},
		/**
		 * Get or set an attribute or attributes on the observe.
		 * 
		 *     o = new can.Observe({});
		 *     
		 *     // sets a user property
		 *     o.attr( 'user', { name: 'hank' } );
		 *     
		 *     // read the user's name
		 *     o.attr( 'user.name' ) //-> 'hank'
		 * 
		 *     // merge multiple properties
		 *     o.attr({
		 *        grade: 'A'
		 *     });
		 * 
		 *     // get properties
		 *     o.attr()           //-> {user: {name: 'hank'}, grade: "A"}
		 * 
		 *     // set multiple properties and remove absent attrs
		 *     o.attr( { foo: 'bar' }, true );
		 * 
		 *     o.attr()           //-> {foo: 'bar'}
		 * 
		 * ## Setting Properties
		 * 
		 * `attr( PROPERTY, VALUE )` sets the observable's PROPERTY to VALUE.  For example:
		 * 
		 *     o = new can.Observe({});
		 *     o.attr( 'user', 'Justin' );
		 * 
		 * This call to attr fires two events on __o__ immediately after the value is set, the first is a "change" event that can be 
		 * listened to like:
		 * 
		 *     o.bind( 'change', function( ev, attr, how, newVal, oldVal ) {} );
		 * 
		 * where:
		 * 
		 *  - ev - the "change" event
		 *  - attr - the name of the attribute changed: `"user"`
		 *  - how - how the attribute was changed: `"add"` because the property was set for the first time
		 *  - newVal - the new value of the property: `"Justin"`
		 *  - oldVal - the old value of the property: `undefined`
		 * 
		 * "change" events are the generic event that gets fired on all changes to an 
		 * observe's properties. The second event shares the name of the property being changed
		 * and can be bound to like:
		 * 
		 *     o.bind( 'name', function( ev, newVal, oldVal ) {} );
		 * 
		 * where:
		 * 
		 *   - ev - the "name" event
		 *   - newVal - the new value of the name property: `'Justin'`
		 *   - oldVal - the old value of the name property: `undefined`
		 * 
		 * `attr( PROPERTY, VALUE )` allows setting of deep properties like:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Just' } } });
		 *      o.attr( 'person.name.first', 'Justin' );
		 * 
		 *  All property names should be seperated with a __"."__.
		 * 
		 * `attr( PROPERTIES )` sets multiple properties at once and removes
		 * properties not in `PROPERTIES`.  For example:
		 * 
		 *     o = new can.Observe({ first: 'Just', middle: 'B' });
		 *     o.attr({
		 *       first: 'Justin',
		 *       last: 'Meyer'
		 *     });
		 * 
		 * This results in an object that looks like:
		 * 
		 *     { first: 'Justin', last: 'Meyer' }
		 * 
		 * Notice that the `middle` property is removed.  This results in
		 * 3 change events (and the corresponding property-named events) that
		 * are triggered after all properties have been set:
		 * 
		 * <table>
		 *   <tr><th>attr</th><th>how</th><th>newVal</th><th>oldVal</th></tr>
		 *   <tr>
		 * 	   <td>"first"</td><td>"set"</td><td>"Justin"</td><td>"Just"</td>
		 *   </tr>
		 *   <tr>
		 * 	   <td>"last"</td><td>"add"</td><td>"Meyer"</td><td>undefined</td>
		 *   </tr>
		 *   <tr>
		 * 	   <td>"middle"</td><td>"remove"</td><td>undefined</td><td>"B"</td>
		 *   </tr>
		 * </table>
		 * 
		 * `attr( PROPERTIES , true )` merges properties into existing 
		 * properties. For example:
		 * 
		 *     o = new can.Observe({ first: 'Just', middle: 'B' });
		 *     o.attr({
		 *       first: 'Justin',
		 *       last: 'Meyer'
		 *     })
		 * 
		 * This results in an object that looks like:
		 * 
		 *     { first: 'Justin', middle: 'B', last: 'Meyer' }
		 * 
		 * and results in 2 change events (and the corresponding 
		 * property-named events):
		 * 
		 * <table>
		 *   <tr><th>attr</th><th>how</th><th>newVal</th><th>oldVal</th></tr>
		 *   <tr>
		 * 	   <td>"first"</td><td>"set"</td><td>"Justin"</td><td>"Just"</td>
		 *   </tr>
		 *   <tr>
		 * 	   <td>"last"</td><td>"add"</td><td>"Meyer"</td><td>undefined</td>
		 *   </tr>
		 * </table>
		 * 
		 * Use [can.Observe::removeAttr removeAttr] to remove an attribute.
		 * 
		 * ## Reading Properties
		 * 
		 * `attr( PROPERTY )` returns a property value.  For example:
		 * 
		 *     o = new can.Observe({ first: 'Justin' });
		 *     o.attr( 'first' ) //-> "Justin"
		 * 
		 * You can also read properties that don't conflict with Observe's inherited
		 * methods direclty like:
		 * 
		 *     o.first //-> "Justin"
		 * 
		 * `attr( PROPERTY )` can read nested properties like:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Justin' } } });
		 *      o.attr( 'person.name.first' ) //-> "Justin"
		 * 
		 * If `attr( PROPERTY )` returns an object or an array, it returns
		 * the Observe wrapped object or array. For example:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Justin' } } });
		 *      o.attr( 'person' ).attr( 'name.first' ) //-> "Justin"
		 * 
		 * 
		 * `attr()` returns all properties in the observe, for example:
		 * 
		 *     o = new can.Observe({ first: 'Justin' });
		 *     o.attr() //-> { first: "Justin" }
		 * 
		 * If the observe has nested objects, `attr()` returns the 
		 * data as plain JS objects, not as observes.  Example:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Justin' } } });
		 *      o.attr() //-> { person: { name: { first: 'Justin' } } }
		 * 
		 * @param {String} attr the attribute to read or write.
		 * 
		 *     o.attr( 'name' ) //-> reads the name
		 *     o.attr( 'name', 'Justin' ) //-> writes the name
		 *     
		 * You can read or write deep property names.  For example:
		 * 
		 *     o.attr( 'person', { name: 'Justin' } );
		 *     o.attr( 'person.name' ) //-> 'Justin'
		 * 
		 * @param {Object} [val] if provided, sets the value.
		 * @return {Object} the observable or the attribute property.
		 * 
		 * If you are reading, the property value is returned:
		 * 
		 *     o.attr( 'name' ) //-> Justin
		 *     
		 * If you are writing, the observe is returned for chaining:
		 * 
		 *     o.attr( 'name', 'Brian' ).attr( 'name' ) //-> Brian
		 */
		attr: function( attr, val ) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a `number` or a `string`.
			if ( !~ "ns".indexOf((typeof attr).charAt(0))) {
				return this._attrs(attr, val)
			} else if ( val === undefined ) {// If we are getting a value.
				// Let people know we are reading.
				Observe.__reading && Observe.__reading(this, attr)
				return this._get(attr)
			} else {
				// Otherwise we are setting.
				this._set(attr, val);
				return this;
			}
		},
		/**
		 * Iterates through each attribute, calling handler 
		 * with each attribute name and value.
		 * 
		 *     new Observe({ foo: 'bar' })
		 *       .each( function( value, name ) {
		 *         equals( name, 'foo' );
		 *         equals( value,'bar' );
		 *       });
		 * 
		 * @param {function} handler( attrName, value ) A function that will get 
		 * called back with the name and value of each attribute on the observe.
		 * 
		 * Returning `false` breaks the looping. The following will never
		 * log 3:
		 * 
		 *     new Observe({ a: 1, b: 2, c: 3 })
		 *       .each( function( value, name ) {
		 *         console.log(value);
		 *         if ( name == 2 ) {
		 *           return false;
		 *         }
		 *       });
		 * 
		 * @return {can.Observe} the original observable.
		 */
		each: function() {
			return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
		},
		/**
		 * Removes a property by name from an observe.
		 * 
		 *     o =  new can.Observe({ foo: 'bar' });
		 *     o.removeAttr('foo'); //-> 'bar'
		 * 
		 * This creates a `'remove'` change event. Learn more about events
		 * in [can.Observe.prototype.bind bind] and [can.Observe.prototype.delegate delegate].
		 * 
		 * @param {String} attr the attribute name to remove.
		 * @return {Object} the value that was removed.
		 */
		removeAttr: function( attr ) {
			// Convert the `attr` into parts (if nested).
			var parts = attrParts(attr),
				// The actual property to remove.
				prop = parts.shift(),
				// The current value.
				current = this._data[prop];

			// If we have more parts, call `removeAttr` on that part.
			if ( parts.length ) {
				return current.removeAttr(parts)
			} else {
				// Otherwise, `delete`.
				delete this._data[prop];
				// Create the event.
				if (!(prop in this.constructor.prototype)) {
					delete this[prop]
				}
				batchTrigger(this, "change", [prop, "remove", undefined, current]);
				batchTrigger(this, prop, [undefined, current]);
				return current;
			}
		},
		// Reads a property from the `object`.
		_get: function( attr ) {
			var parts = attrParts(attr),
				current = this.__get(parts.shift());
			return parts.length ? current ? current._get(parts) : undefined : current;
		},
		// Reads a property directly if an `attr` is provided, otherwise
		// returns the "real" data object itself.
		__get: function( attr ) {
			return attr ? this._data[attr] : this._data;
		},
		// Sets `attr` prop as value on this object where.
		// `attr` - Is a string of properties or an array  of property values.
		// `value` - The raw value to set.
		_set: function( attr, value ) {
			// Convert `attr` to attr parts (if it isn't already).
			var parts = attrParts(attr),
				// The immediate prop we are setting.
				prop = parts.shift(),
				// The current value.
				current = this.__get(prop);

			// If we have an `object` and remaining parts.
			if ( canMakeObserve(current) && parts.length ) {
				// That `object` should set it (this might need to call attr).
				current._set(parts, value)
			} else if (!parts.length ) {
				// We're in "real" set territory.
				if(this.__convert){
					value = this.__convert(prop, value)
				}
				this.__set(prop, value, current)
				
			} else {
				throw "can.Observe: Object does not exist"
			}
		},
		__set : function(prop, value, current){
		
			// Otherwise, we are setting it on this `object`.
			// TODO: Check if value is object and transform
			// are we changing the value.
			if ( value !== current ) {

				// Check if we are adding this for the first time --
				// if we are, we need to create an `add` event.
				var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

				// Set the value on data.
				this.___set(prop,

				// If we are getting an object.
				canMakeObserve(value) ?

				// Hook it up to send event.
				hookupBubble(value, prop, this) :
				// Value is normal.
				value);

				// `batchTrigger` the change event.
				batchTrigger(this, "change", [prop, changeType, value, current]);
				batchTrigger(this, prop, [value, current]);
				// If we can stop listening to our old value, do it.
				current && unhookup([current], this._namespace);
			}

		},
		// Directly sets a property on this `object`.
		___set: function( prop, val ) {
			this._data[prop] = val;
			// Add property directly for easy writing.
			// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
			if (!(prop in this.constructor.prototype)) {
				this[prop] = val
			}
		},
		/**
		 * @function bind
		 * `bind( eventType, handler )` Listens to changes on a can.Observe.
		 * 
		 * When attributes of an observe change, two types of events are produced
		 * 
		 *   - "change" events - a generic event so you can listen to any property changes
		 *   - ATTR_NAME events - bind to specific attribute changes
		 * 
		 * Example:
		 * 
		 *     o = new can.Observe({ name: 'Payal' });
		 *     o.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
		 *       
		 *     }).bind( 'name', function( ev, newVal, oldVal ) {
		 *     	
		 *     });
		 *     
		 *     o.attr( 'name', 'Justin' ); 
		 * 
		 * ## Change Events
		 * 
		 * A `'change'` event is triggered on the observe.  These events come
		 * in three flavors:
		 * 
		 *   - `add` - a attribute is added
		 *   - `set` - an existing attribute's value is changed
		 *   - `remove` - an attribute is removed
		 * 
		 * The change event is fired with:
		 * 
		 *  - the attribute changed
		 *  - how it was changed
		 *  - the newValue of the attribute
		 *  - the oldValue of the attribute
		 * 
		 * Example:
		 * 
		 *     o = new can.Observe({ name: 'Payal' });
		 *     o.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
		 *       // ev    -> {type: 'change'}
		 *       // attr  -> "name"
		 *       // how   -> "add"
		 *       // newVal-> "Justin"
		 *       // oldVal-> "Payal"
		 *     });
		 *     
		 *     o.attr( 'name', 'Justin' );
		 * 
		 * ## ATTR_NAME events
		 * 
		 * When a attribute value is changed, an event with the name of the attribute
		 * is triggered on the observable with the new value and old value as 
		 * parameters. For example:
		 * 
		 *     o = new can.Observe({ name: 'Payal' });
		 *     o.bind( 'name', function( ev, newVal, oldVal ) {
		 *       // ev    -> {type : "name"}
		 *       // newVal-> "Justin"
		 *       // oldVal-> "Payal"
		 *     });
		 *     
		 *     o.attr( 'name', 'Justin' );
		 * 
		 * 
		 * @param {String} eventType the event name.  Currently,
		 * only `'change'`  and `ATTR_NAME` events are supported. 
		 * 
		 * @param {Function} handler(event, attr, how, newVal, oldVal) A 
		 * callback function where
		 * 
		 *   - event - the event
		 *   - attr - the name of the attribute changed
		 *   - how - how the attribute was changed (add, set, remove)
		 *   - newVal - the new value of the attribute
		 *   - oldVal - the old value of the attribute
		 * 
		 * @return {can.Observe} the observe for chaining.
		 */
		bind: bind,
		/**
		 * @function unbind
		 * Unbinds an event listener.  This works similar to jQuery's unbind.  This means you can 
		 * use namespaces or unbind all event handlers for a given event:
		 * 
		 *     // unbind a specific event handler
		 *     o.unbind( 'change', handler );
		 *     
		 *     // unbind all change event handlers bound with the
		 *     // foo namespace
		 *     o.unbind( 'change.foo' );
		 *     
		 *     // unbind all change event handlers
		 *     o.unbind( 'change' );
		 * 
		 * @param {String} eventType - the type of event with
		 * any optional namespaces. 
		 * 
		 * @param {Function} [handler] - The original handler function passed
		 * to [can.Observe.prototype.bind bind].
		 * 
		 * @return {can.Observe} the original observe for chaining.
		 */
		unbind: unbind,
		/**
		 * @hide
		 * Get the serialized Object form of the observe.  Serialized
		 * data is typically used to send back to a server.
		 * 
		 *     o.serialize() //-> { name: 'Justin' }
		 *     
		 * Serialize currently returns the same data 
		 * as [can.Observe.prototype.attrs].  However, in future
		 * versions, serialize will be able to return serialized
		 * data similar to [can.Model].  The following will work:
		 * 
		 *     new Observe({time: new Date()})
		 *       .serialize() //-> { time: 1319666613663 }
		 * 
		 * @return {Object} a JavaScript Object that can be 
		 * serialized with `JSON.stringify` or other methods. 
		 * 
		 */
		serialize: function() {
			return serialize(this, 'serialize', {});
		},
		/**
		 * @hide
		 * Set multiple properties on the observable
		 * @param {Object} props
		 * @param {Boolean} remove true if you should remove properties that are not in props
		 */
		_attrs: function( props, remove ) {
			if ( props === undefined ) {
				return serialize(this, 'attr', {})
			}

			props = can.extend(true, {}, props);
			var prop, 
				collectingStarted = collect(),
				self = this,
				newVal;
			
			this.each(function(curVal, prop){
				newVal = props[prop];

				// If we are merging...
				if ( newVal === undefined ) {
					remove && self.removeAttr(prop);
					return;
				}
				if ( canMakeObserve(curVal) && canMakeObserve(newVal) ) {
					curVal.attr(newVal, remove)
				} else if ( curVal != newVal ) {
					self._set(prop, newVal)
				} else {

				}
				delete props[prop];
			})
			// Add remaining props.
			for ( var prop in props ) {
				newVal = props[prop];
				this._set(prop, newVal)
			}
			if ( collectingStarted ) {
				sendCollection();
			}
			return this;
		}
	});
	// Helpers for `observable` lists.
	/**
	 * @class can.Observe.List
	 * @inherits can.Observe
	 * @parent canjs
	 * 
	 * `new can.Observe.List([items])` provides the observable pattern for JavaScript arrays.  It lets you:
	 * 
	 *   - change the structure of an array
	 *   - listen to changes in the array
	 * 
	 * ## Creating an observe list
	 * 
	 * To create an observable list, use `new can.Observe.List( ARRAY )` like:
	 * 
	 *     var hobbies = new can.Observe.List(
	 * 		 			['programming', 'basketball', 'nose picking'])
	 * 
	 * can.Observe.List inherits from [can.Observe], including it's 
	 * [can.Observe.prototype.bind bind], [can.Observe.prototype.each each], and [can.Observe.prototype.unbind unbind] 
	 * methods.
	 * 
	 * can.Observe.List is inherited by [can.Model.List].
	 * 
	 * ## Getting and Setting Properties
	 * 
	 * Similar to an array, use the index operator to access items of a list:
	 * 
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list[1] //-> "b"
	 * 
	 * Or, use the `attr( PROPERTY )` method like:
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list.attr(1)  //-> "b"
	 *
	 * __WARNING:__ while using the index operator with [] is possible, 
	 * it should be noted that changing properties of objects that way
	 * will not call bound events to the observed list that would let
	 * it know that an object in the list has changed. In almost every
	 * case you will use [can.Model.static.findAll findAll].
	 * 
	 * Using the 'attr' method lets Observe know you accessed the 
	 * property. This is used by [can.EJS] for live-binding.
	 * 
	 * Get back a js Array with `attr()`:
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list.attr()  //-> ["a","b"]
	 * 
	 * Change the structure of the array with:
	 * 
	 *    - [can.Observe.List::attr attr]
	 *    - [can.Observe.List::pop pop]
	 *    - [can.Observe.List::push push]
	 *    - [can.Observe.List::shift shift]
	 *    - [can.Observe.List::unshift unshift]
	 *    - [can.Observe.List::splice splice]
	 * 
	 * ## Events
	 * 
	 * When an item is added, removed, or updated in a list, it triggers
	 * events that can be [can.Observe::bind bind]ed to for changes.
	 * 
	 * There are 5 types of events: add, remove, set, length, and change.
	 * 
	 * ### add events
	 * 
	 * Add events are fired when items are added to the list. Listen 
	 * to them like:
	 * 
	 *     list.bind("add", handler(ev, newVals, index) )
	 * 
	 * where:
	 * 
	 *  - `newVals` - the values added to the list
	 *  - `index` - where the items were added
	 * 
	 * ### remove events
	 * 
	 * Removes events are fired when items are removed from the list. Listen 
	 * to them like:
	 * 
	 *     list.bind("remove", handler(ev, oldVals, index) )
	 * 
	 * where:
	 * 
	 *   - `oldVals` - the values removed from the list
	 *   - `index` - where the items were removed
	 * 
	 * ### set events
	 * 
	 * Set events happen when an item in the list is updated. Listen to 
	 * these events with:
	 * 
	 *     list.bind("set", handler(ev, newVal, index) )
	 * 
	 * where:
	 * 
	 *   - `newVal` - the new value at index
	 *   - `index` - where the items were removed
	 * 
	 * ### length events
	 * 
	 * Anytime the length is changed a length attribute event is
	 * fired.
	 * 
	 *     list.bind("length", handler(ev, length) )
	 * 
	 * where:
	 * 
	 * - `length` - the new length of the array.
	 * 
	 * ### change events
	 * 
	 * Change events are fired when any type of change 
	 * happens on the array.  They get called with:
	 * 
	 *     .bind("change", handler(ev, attr, how, newVal, oldVal) )
	 * 
	 * Where:
	 * 
	 *   - `attr` - the index of the item changed
	 *   - `how` - how the item was changed (add, remove, set)
	 *   - `newVal` - For set, a single item. For add events, an array 
	 *     of items. For remove event, undefined.
	 *   - `oldVal` - the old values at `attr`.
	 * 
	 * @constructor Creates a new observable list from an array
	 * 
	 * @param {Array} [items...] the array of items to create the list with
	 */
	var splice = [].splice,
		list = Observe('can.Observe.List',
	/**
	 * @prototype
	 */
	{
		setup: function( instances, options ) {
			this.length = 0;
			this._namespace = ".observe" + (++observeId);
			this._init = 1;
			this.bind('change',can.proxy(this._changes,this));
			this.push.apply(this, can.makeArray(instances || []));
			can.extend(this, options);
			delete this._init;
		},
		_changes : function(ev, attr, how, newVal, oldVal){
			// `batchTrigger` direct add and remove events...
			if ( !~ attr.indexOf('.')){
				
				if( how === 'add' ) {
					batchTrigger(this, how, [newVal,+attr]);
					batchTrigger(this,'length',[this.length]);
				} else if( how === 'remove' ) {
					batchTrigger(this, how, [oldVal, +attr]);
					batchTrigger(this,'length',[this.length]);
				} else {
					batchTrigger(this,how,[newVal, +attr])
				}
				
			}
		},
		__get : function(attr){
			return attr ? this[attr] : this;
		},
		___set : function(attr, val){
			this[attr] = val;
			if(+attr >= this.length){
				this.length = (+attr+1)
			}
		},
		// Returns the serialized form of this list.
		/**
		 * @hide
		 * Returns the serialized form of this list.
		 */
		serialize: function() {
			return serialize(this, 'serialize', []);
		},
		/**
		 * Iterates through each item of the list, calling handler 
		 * with each index and value.
		 * 
		 *     new Observe.List(['a'])
		 *       .each(function( value , index ){
		 *         equals(index, 1)
		 *         equals(value,'a')
		 *       })
		 * 
		 * @param {function} handler(value,index) A function that will get 
		 * called back with the index and value of each item on the list.
		 * 
		 * Returning `false` breaks the looping.  The following will never
		 * log 'c':
		 * 
		 *     new Observe(['a','b','c'])
		 *       .each(function(value, index){
		 *         console.log(value)
		 *         if(index == 1){
		 *           return false;
		 *         }
		 *       })
		 * 
		 * @return {can.Observe.List} the original observable.
		 */
		//  
		/**
		 * `splice(index, [ howMany, elements... ] )` remove or add items 
		 * from a specific point in the list.
		 * 
		 * ### Example
		 * 
		 * The following creates a list of numbers and replaces 2 and 3 with
		 * "a", and "b".
		 * 
		 *     var list = new can.Observe.List([0,1,2,3]);
		 *     
		 *     list.splice(1,2, "a", "b"); // results in [0,"a","b",3]
		 *     
		 * This creates 2 change events.  The first event is the removal of 
		 * numbers one and two where it's callback is 
		 * `bind('change', function( ev, attr, how, newVals, oldVals, where ) )`
		 * and it's values are:
		 * 
		 *   - attr - "1" - indicates where the remove event took place
		 *   - how - "remove"
		 *   - newVals - undefined
		 *   - oldVals - [1,2] -the array of removed values
		 *   - where - 1 - the location of where these items were removed
		 * 
		 * The second change event is the addition of the "a", and "b" values where 
		 * the callback values will be:
		 * 
		 *   - attr - "1" - indicates where the add event took place
		 *   - how - "added"
		 *   - newVals - ["a","b"]
		 *   - oldVals - [1, 2] - the array of removed values
		 *   - where - 1 - the location of where these items were added
		 * 
		 * @param {Number} index where to start removing or adding items
		 * @param {Object} [howMany=0] the number of items to remove
		 * @param {Object} [elements...] items to add to the array
		 */
		splice: function( index, howMany ) {
			var args = can.makeArray(arguments),
				i;

			for ( i = 2; i < args.length; i++ ) {
				var val = args[i];
				if ( canMakeObserve(val) ) {
					args[i] = hookupBubble(val, "*", this)
				}
			}
			if ( howMany === undefined ) {
				howMany = args[1] = this.length - index;
			}
			var removed = splice.apply(this, args);
			if ( howMany > 0 ) {
				batchTrigger(this, "change", [""+index, "remove", undefined, removed]);
				unhookup(removed, this._namespace);
			}
			if ( args.length > 2 ) {
				batchTrigger(this, "change", [""+index, "add", args.slice(2), removed]);
			}
			return removed;
		},
		/**
		 * @function attr
		 * Gets or sets an item or items in the observe list.  Examples:
		 * 
		 *     list = new can.Observe.List(["a","b","c"]);
		 *      
		 *     // sets an array item
		 *     list.attr(3,'d')
		 *     
		 *     // read an array's item
		 *     list.attr(3) //-> 'd'
		 * 
		 *     // merge array's properties
		 *     list.attr( ["b","BOO"] )
		 * 
		 *     // get properties
		 *     o.attr()           //-> ["b","BOO","c","d"]
		 *     
		 *     // set array
		 *     o.attr(["item"])
		 *     o.attr() //-> ["item"]
		 * 
		 * ## Setting Properties
		 * 
		 * `attr( array , true )` updates the list to look like array.  For example:
		 * 
		 *     list = new can.Observe.List(["a","b","c"])
		 *     list.attr(["foo"], true)
		 *     
		 *     list.attr() //-> ["foo"]
		 * 
		 * 
		 * When the array is changed, it produces events that detail the changes
		 * in the list. They are listed in the
		 * order they are produced for the above example:
		 * 
		 *   1. `.bind( "change", handler(ev, attr, how, newVal, oldVal) )` where:
		 *       
		 *      - ev = {type: "change"}
		 *      - attr = "0"
		 *      - how = "set"
		 *      - newVal = "foo"
		 *      - oldVal = "a"
		 * 
		 *   2. `.bind( "set", handler(ev, newVal, index) )` where:
		 *       
		 *      - ev = {type: "set"}
		 *      - newVal = "foo"
		 *      - index = 0
		 * 
		 *   3. `.bind( "change", handler(ev, attr, how, newVal, oldVal) )` where:
		 *       
		 *      - ev = {type: "change"}
		 *      - attr = "1"
		 *      - how = "remove"
		 *      - newVal = undefined
		 *      - oldVal = ["b","c"]
		 * 
		 *   4. `.bind( "remove", handler(ev, newVal, index) )` where:
		 *       
		 *      - ev = {type: "remove"}
		 *      - newVal = undefined
		 *      - index = 1
		 * 
		 *   5. `.bind( "length", handler(ev, length) )` where:
		 *       
		 *      - ev = {type: "length"}
		 *      - length = 1
		 * 
		 * In general, it is possible to listen to events and reproduce the
		 * changes in a facsimile of the list.  This is useful for implementing 
		 * high-performance widgets that need to reflect the contents of the list without
		 * redrawing the entire list.  Here's an example of how that would look:
		 * 
		 *     list.bind("set", function(ev, newVal, index){
		 * 	     // update the item at index with newVal
		 *     }).bind("remove", function(ev, oldVals, index){
		 * 	     // remove oldVals.length items at index
		 *     }).bind("add", function(ev, newVals, index){
		 *       // insert newVals at index
		 *     })
		 * 
		 * `attr( array )` merges items into the beginning of the array.  For example:
		 * 
		 *     list = new can.Observe.List(["a","b"])
		 *     list.attr(["foo"])
		 *     
		 *     list.attr() //-> ["foo","b"]
		 * 
		 * `attr( INDEX, VALUE )` sets or updates an item at `INDEX`.  Example:
		 * 
		 *     list.attr(0, "ITEM")
		 * 
		 * ## Reading Properties
		 * 
		 * `attr()` returns the lists content as an array.  For example:
		 * 
		 *      list = new can.Observe.List(["a", {foo: "bar"}])
		 *      list.attr()  //-> ["a", {foo: "bar"}]
		 * 
		 * `attr( INDEX )` reads a property at `INDEX` like:
		 * 
		 *      list = new can.Observe.List(["a", {foo: "bar"}])
		 *      list.attr(0)  //-> "a",
		 * 
		 * @param {Array|Number} props
		 * @param {Boolean|Object} {optional:remove} 
		 * @return {list|Array} returns the props on a read or the observe
		 * list on a write.
		 */
		_attrs: function( props, remove ) {
			if ( props === undefined ) {
				return serialize(this, 'attr', []);
			}

			// Create a copy.
			props = props.slice(0);

			var len = Math.min(props.length, this.length),
				collectingStarted = collect(),
				prop;

			for ( var prop = 0; prop < len; prop++ ) {
				var curVal = this[prop],
					newVal = props[prop];

				if ( canMakeObserve(curVal) && canMakeObserve(newVal) ) {
					curVal.attr(newVal, remove)
				} else if ( curVal != newVal ) {
					this._set(prop, newVal)
				} else {

				}
			}
			if ( props.length > this.length ) {
				// Add in the remaining props.
				this.push(props.slice(this.length))
			} else if ( props.length < this.length && remove ) {
				this.splice(props.length)
			}

			if ( collectingStarted ) {
				sendCollection()
			}
		}
	}),


		// Converts to an `array` of arguments.
		getArgs = function( args ) {
			return args[0] && can.isArray(args[0]) ?
				args[0] :
				can.makeArray(args);
		};
	// Create `push`, `pop`, `shift`, and `unshift`
	can.each({
		/**
		 * @function push
		 * Add items to the end of the list.
		 * 
		 *     var list = new can.Observe.List([]);
		 *     
		 *     list.attr() // -> []
		 *     
		 *     list.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed,
		 *     			   // for multiple items, "*" is used 
		 *         how,       // "add"
		 *         newVals,   // an array of new values pushed
		 *         oldVals,   // undefined
		 *         where      // the location where these items were added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     list.push('0','1','2'); 
		 *     list.attr() // -> ['0', '1', '2']
		 * 
		 * @return {Number} the number of items in the array
		 */
		push: "length",
		/**
		 * @function unshift
		 * Add items to the start of the list.  This is very similar to
		 * [can.Observe.List::push can.Observe.prototype.List].  Example:
		 * 
		 *     var list = new can.Observe.List(["a","b"]);
		 *     list.unshift(1,2,3) //-> 5
		 *     .attr() //-> [1,2,3,"a","b"]
		 * 
		 * @param {Object} [items...] items to add to the start of the list.
		 * @return {Number} the length of the array.
		 */
		unshift: 0
	},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.
	function( where, name ) {
		list.prototype[name] = function() {
			// Get the items being added.
			var args = getArgs(arguments),
				// Where we are going to add items.
				len = where ? this.length : 0;

			// Go through and convert anything to an `observe` that needs to be converted.
			for ( var i = 0; i < args.length; i++ ) {
				var val = args[i];
				if ( canMakeObserve(val) ) {
					args[i] = hookupBubble(val, "*", this)
				}
			}
			
			// Call the original method.
			var res = [][name].apply(this, args);
			
			if ( !this.comparator || !args.length ) {
				batchTrigger(this, "change", [""+len, "add", args, undefined])
			}
						
			return res;
		}
	});

	can.each({
		/**
		 * @function pop
		 * 
		 * Removes an item from the end of the list. Example:
		 * 
		 *     var list = new can.Observe.List([0,1,2]);
		 *     list.pop() //-> 2;
		 *     list.attr() //-> [0,1]
		 * 
		 * This produces a change event like
		 * 
		 *     list.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, 
		 *     			   // for multiple items, "*" is used 
		 *         how,       // "remove"
		 *         newVals,   // undefined
		 *         oldVals,   // 2
		 *         where      // the location where these items were added
		 *         ) {
		 *     
		 *     })
		 * 
		 * @return {Object} the element at the end of the list or undefined if the
		 * list is empty.
		 */
		pop: "length",
		/**
		 * @function shift
		 * Removes an item from the start of the list.  This is very similar to
		 * [can.Observe.List::pop]. Example:
		 * 
		 *     var list = new can.Observe.List([0,1,2]);
		 *     list.shift() //-> 0;
		 *     list.attr() //-> [1,2]
		 * 
		 * @return {Object} the element at the start of the list
		 */
		shift: 0
	},
	// Creates a `remove` type method
	function( where, name ) {
		list.prototype[name] = function() {
			
			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;


			var res = [][name].apply(this, args)

			// Create a change where the args are
			// `*` - Change on potentially multiple properties.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			// `len` - Where these items were removed.
			batchTrigger(this, "change", [""+len, "remove", undefined, [res]])

			if ( res && res.unbind ) {
				res.unbind("change" + this._namespace)
			}
			return res;
		}
	});
	
	list.prototype.
	/**
	 * @function indexOf
	 * Returns the position of the item in the array.  Returns -1 if the
	 * item is not in the array.  Examples:
	 * 
	 *     list = new can.Observe.List(["a","b","c"]);
	 *     list.indexOf("b") //-> 1
	 *     list.indexOf("f") //-> -1
	 * 
	 * @param {Object} item the item to look for
	 * @return {Number} the index of the object in the array or -1.
	 */
	indexOf = [].indexOf || function(item){
		return can.inArray(item, this)
	};
;


	// ## control.js
	// `can.Control`  
	// _Controller_
	
	// Binds an element, returns a function that unbinds.
	var bind = function( el, ev, callback ) {

		can.bind.call( el, ev, callback )

		return function() {
			can.unbind.call(el, ev, callback);
		};
	},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
    paramReplacer = /\{([^\}]+)\}/g,
		special = can.getObject("$.event.special") || {},

		// Binds an element, returns a function that unbinds.
		delegate = function( el, selector, ev, callback ) {
			can.delegate.call(el, selector, ev, callback)
			return function() {
				can.undelegate.call(el, selector, ev, callback);
			};
		},
		
		// Calls bind or unbind depending if there is a selector.
		binder = function( el, ev, callback, selector ) {
			return selector ?
				delegate( el, can.trim( selector ), ev, callback ) : 
				bind( el, ev, callback );
		},
		
		// Moves `this` to the first argument, wraps it with `jQuery` if it's an element
		shifter = function shifter(context, name) {
			var method = typeof name == "string" ? context[name] : name;
			if(!isFunction(method)){
				method = context[method];
			}
			return function() {
				context.called = name;
    			return method.apply(context, [this.nodeName ? can.$(this) : this].concat( slice.call(arguments, 0)));
			};
		},
		basicProcessor;
	
	/**
	 * @add can.Control
	 */
	can.Construct("can.Control",
	/** 
	 * @Static
	 */
	{
		// Setup pre-processes which methods are event listeners.
		/**
		 * @hide
		 * 
		 * Setup pre-process which methods are event listeners.
		 * 
		 */
		setup: function() {

			// Allow contollers to inherit "defaults" from super-classes as it 
			// done in `can.Construct`
			can.Construct.setup.apply( this, arguments );

			// If you didn't provide a name, or are `control`, don't do anything.
			if ( this !== can.Control ) {

				// Cache the underscored names.
				var control = this,
					funcName;

				// Calculate and cache actions.
				control.actions = {};
				for ( funcName in control.prototype ) {
					if ( control._isAction(funcName) ) {
						control.actions[funcName] = control._action(funcName);
					}
				}
			}
		},
		// Return `true` if is an action.
		/**
		 * @hide
		 * @param {String} methodName a prototype function
		 * @return {Boolean} truthy if an action or not
		 */
		_isAction: function( methodName ) {
			
			var val = this.prototype[methodName],
				type = typeof val;
			// if not the constructor
			return (methodName !== 'constructor') &&
				// and is a function or links to a function
				( type == "function" || (type == "string" &&  isFunction(this.prototype[val] ) ) ) &&
				// and is in special, a processor, or has a funny character
			    !! ( special[methodName] || processors[methodName] || /[^\w]/.test(methodName) );
		},
		// Takes a method name and the options passed to a control
		// and tries to return the data necessary to pass to a processor
		// (something that binds things).
		/**
		 * @hide
		 * Takes a method name and the options passed to a control
		 * and tries to return the data necessary to pass to a processor
		 * (something that binds things).
		 * 
		 * For performance reasons, this called twice.  First, it is called when 
		 * the Control class is created.  If the methodName is templated
		 * like: "{window} foo", it returns null.  If it is not templated
		 * it returns event binding data.
		 * 
		 * The resulting data is added to this.actions.
		 * 
		 * When a control instance is created, _action is called again, but only
		 * on templated actions.  
		 * 
		 * @param {Object} methodName the method that will be bound
		 * @param {Object} [options] first param merged with class default options
		 * @return {Object} null or the processor and pre-split parts.  
		 * The processor is what does the binding/subscribing.
		 */
		_action: function( methodName, options ) {
			
			// If we don't have options (a `control` instance), we'll run this 
			// later.  
      		paramReplacer.lastIndex = 0;
			if ( options || ! paramReplacer.test( methodName )) {
				// If we have options, run sub to replace templates `{}` with a
				// value from the options or the window
				var convertedName = options ? can.sub(methodName, [options, window]) : methodName,
					
					// If a `{}` resolves to an object, `convertedName` will be
					// an array
					arr = can.isArray(convertedName),
					
					// Get the parts of the function  
					// `[convertedName, delegatePart, eventPart]`  
					// `/^(?:(.*?)\s)?([\w\.\:>]+)$/` - Breaker `RegExp`.
					parts = (arr ? convertedName[1] : convertedName).match(/^(?:(.*?)\s)?([\w\.\:>]+)$/);

					var event = parts[2],
					processor = processors[event] || basicProcessor;
				return {
					processor: processor,
					parts: parts,
					delegate : arr ? convertedName[0] : undefined
				};
			}
		},
		// An object of `{eventName : function}` pairs that Control uses to 
		// hook up events auto-magically.
		/**
		 * @attribute processors
		 * An object of `{eventName : function}` pairs that Control uses to hook up events
		 * auto-magically.  A processor function looks like:
		 * 
		 *     can.Control.processors.
		 *       myprocessor = function( el, event, selector, cb, control ) {
		 *          //el - the control's element
		 *          //event - the event (myprocessor)
		 *          //selector - the left of the selector
		 *          //cb - the function to call
		 *          //control - the binding control
		 *       };
		 * 
		 * This would bind anything like: "foo~3242 myprocessor".
		 * 
		 * The processor must return a function that when called, 
		 * unbinds the event handler.
		 * 
		 * Control already has processors for the following events:
		 * 
		 *   - change 
		 *   - click 
		 *   - contextmenu 
		 *   - dblclick 
		 *   - focusin
		 *   - focusout
		 *   - keydown 
		 *   - keyup 
		 *   - keypress 
		 *   - mousedown 
		 *   - mouseenter
		 *   - mouseleave
		 *   - mousemove 
		 *   - mouseout 
		 *   - mouseover 
		 *   - mouseup 
		 *   - reset 
		 *   - resize 
		 *   - scroll 
		 *   - select 
		 *   - submit  
		 * 
		 * Listen to events on the document or window 
		 * with templated event handlers:
		 * 
		 *     Sized = can.Control({
		 *       "{window} resize": function(){
		 *         this.element.width( this.element.parent().width() / 2 );
		 *       }
		 *     });
		 *     
		 *     new Sized( $( '#foo' ) );
		 */
		processors: {},
		// A object of name-value pairs that act as default values for a 
		// control instance
		/**
		 * @attribute defaults
		 * A object of name-value pairs that act as default values for a control's 
		 * [can.Control::options this.options].
		 * 
		 *     Message = can.Control({
		 *       defaults: {
		 *         message: "Hello World"
		 *       }
		 *     }, {
		 *       init: function(){
		 *         this.element.text( this.options.message );
		 *       }
		 *     });
		 *     
		 *     new Message( "#el1" ); //writes "Hello World"
		 *     new Message( "#el12", { message: "hi" } ); //writes hi
		 *     
		 * In [can.Control::setup] the options passed to the control
		 * are merged with defaults.  This is not a deep merge.
		 */
		defaults: {}
	},
	/** 
	 * @Prototype
	 */
	{
		// Sets `this.element`, saves the control in `data, binds event
		// handlers.
		/**
		 * Setup is where most of control's magic happens.  It does the following:
		 * 
		 * ### Sets this.element
		 * 
		 * The first parameter passed to new Control( el, options ) is expected to be 
		 * an element.  This gets converted to a Wrapped NodeList element and set as
		 * [can.Control.prototype.element this.element].
		 * 
		 * ### Adds the control's name to the element's className.
		 * 
		 * Control adds it's plugin name to the element's className for easier 
		 * debugging.  For example, if your Control is named "Foo.Bar", it adds
		 * "foo_bar" to the className.
		 * 
		 * ### Saves the control in $.data
		 * 
		 * A reference to the control instance is saved in $.data.  You can find 
		 * instances of "Foo.Bar" like: 
		 * 
		 *     $( '#el' ).data( 'controls' )[ 'foo_bar' ]
		 *
		 * ### Merges Options
		 * Merges the default options with optional user-supplied ones.
		 * Additionally, default values are exposed in the static [can.Control.static.defaults defaults] 
		 * so that users can change them.
		 * 
		 * ### Binds event handlers
		 * 
		 * Setup does the event binding described in [can.control.listening Listening To Events].
		 * 
		 * @param {HTMLElement} element the element this instance operates on.
		 * @param {Object} [options] option values for the control.  These get added to
		 * this.options and merged with [can.Control.static.defaults defaults].
		 * @return {Array} return an array if you wan to change what init is called with. By
		 * default it is called with the element and options passed to the control.
		 */
		setup: function( element, options ) {

			var cls = this.constructor,
				pluginname = cls.pluginName || cls._fullName,
				arr;

			// Want the raw element here.
			this.element = can.$(element)

			if ( pluginname && pluginname !== 'can_control') {
				// Set element and `className` on element.
				this.element.addClass(pluginname);
			}
			
			(arr = can.data(this.element,"controls")) || can.data(this.element,"controls",arr = []);
			arr.push(this);
			
			// Option merging.
			/**
			 * @attribute options
			 * 
			 * Options are used to configure an control.  They are
			 * the 2nd argument
			 * passed to a control (or the first argument passed to the 
			 * [can.Control.plugin control's jQuery plugin]).
			 * 
			 * For example:
			 * 
			 *     can.Control('Hello')
			 *     
			 *     var h1 = new Hello( $( '#content1' ), { message: 'World' } );
			 *     equal( h1.options.message , "World" );
			 *     
			 *     var h2 = $( '#content2' ).hello({ message: 'There' })
			 *                              .control();
			 *     equal( h2.options.message , "There" );
			 * 
			 * Options are merged with [can.Control.static.defaults defaults] in
			 * [can.Control.prototype.setup setup].
			 * 
			 * For example:
			 * 
			 *     Tabs = can.Control({
			 *        defaults: {
			 *          activeClass: "ui-active-state"
			 *        }
			 *     }, {
			 *        init: function(){
			 *          this.element.addClass( this.options.activeClass );
			 *        }
			 *     });
			 *     
			 *     new Tabs( $( "#tabs1" ) ); // adds 'ui-active-state'
			 *     new Tabs( $( "#tabs2" ), { activeClass : 'active' } ); // adds 'active'
			 *     
			 * Options are typically updated by calling 
			 * [can.Control.prototype.update update];
			 *
			 */
			this.options = extend({}, cls.defaults, options);

			// Bind all event handlers.
			this.on();

			// Get's passed into `init`.
			/**
			 * @attribute element
			 * 
			 * The control instance's HTMLElement (or window) wrapped by the 
			 * util library for ease of use. It is set by the first
			 * parameter to `new can.Construct( element, options )` 
			 * in [can.Control::setup].  Control listens on `this.element`
			 * for events.
			 * 
			 * ### Quick Example
			 * 
			 * The following `HelloWorld` control sets the control`s text to "Hello World":
			 * 
			 *     HelloWorld = can.Control({
			 *       init: function(){
			 * 	       this.element.text( 'Hello World' );
			 *       }
			 *     });
			 *     
			 *     // create the controller on the element
			 *     new HelloWorld( document.getElementById( '#helloworld' ) );
			 * 
			 * ## Wrapped NodeList
			 * 
			 * `this.element` is a wrapped NodeList of one HTMLELement (or window).  This
			 * is for convience in libraries like jQuery where all methods operate only on a
			 * NodeList.  To get the raw HTMLElement, write:
			 * 
			 *     this.element[0] //-> HTMLElement
			 * 
			 * The following details the NodeList used by each library with 
			 * an example of updating it's text:
			 * 
			 * __jQuery__ `jQuery( HTMLElement )`
			 * 
			 *     this.element.text("Hello World")
			 * 
			 * __Zepto__ `Zepto( HTMLElement )`
			 * 
			 *     this.element.text("Hello World")
			 * 
			 * __Dojo__ `new dojo.NodeList( HTMLElement )`
			 * 
			 *     // TODO
			 * 
			 * __Mootools__ `$$( HTMLElement )`
			 * 
			 *    this.element.empty().appendText("Hello World")
			 * 
			 * __YUI__ 
			 * 
			 *    // TODO
			 * 
			 * 
			 * ## Changing `this.element`
			 * 
			 * Sometimes you don't want what's passed to `new can.Control`
			 * to be this.element.  You can change this by overwriting
			 * setup or by unbinding, setting this.element, and rebinding.
			 * 
			 * ### Overwriting Setup
			 * 
			 * The following Combobox overwrites setup to wrap a
			 * select element with a div.  That div is used 
			 * as `this.element`. Notice how `destroy` sets back the
			 * original element.
			 * 
			 *     Combobox = can.Control({
			 *       setup: function( el, options ) {
			 *          this.oldElement = $( el );
			 *          var newEl = $( '<div/>' );
			 *          this.oldElement.wrap( newEl );
			 *          can.Controll.prototype.setup.call( this, newEl, options );
			 *       },
			 *       init: function() {
			 *          this.element //-> the div
			 *       },
			 *       ".option click": function() {
			 *         // event handler bound on the div
			 *       },
			 *       destroy: function() {
			 *          var div = this.element; //save reference
			 *          can.Control.prototype.destroy.call( this );
			 *          div.replaceWith( this.oldElement );
			 *       }
			 *     });
			 * 
			 * ### unbining, setting, and rebinding.
			 * 
			 * You could also change this.element by calling
			 * [can.Control::off], setting this.element, and 
			 * then calling [can.Control::on] like:
			 * 
			 *     move: function( newElement ) {
			 *        this.off();
			 *        this.element = $( newElement );
			 *        this.on();
			 *     }
			 */
			return [this.element, this.options];
		},
		/**
		 * `this.on( [element, selector, eventName, handler] )` is used to rebind 
		 * all event handlers when [can.Control::options this.options] has changed.  It
		 * can also be used to bind or delegate from other elements or objects.
		 * 
		 * ## Rebinding
		 * 
		 * By using templated event handlers, a control can listen to objects outside
		 * `this.element`.  This is extremely common in MVC programming.  For example,
		 * the following control might listen to a task model's `completed` property and
		 * toggle a strike className like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed": function(){
		 * 	       this.update();
		 *       },
		 *       update: function(){
		 *         if ( this.options.task.completed ) {
		 * 	         this.element.addClass( 'strike' );
		 * 	       } else {
		 *           this.element.removeClass( 'strike' );
		 *         }
		 *       }
		 *     });
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({ completed: 'true' }) 
		 *     });
		 * 
		 * To update the taskstriker's task, add a task method that updates
		 * this.options and calls rebind like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed": function(){
		 * 	       this.update();
		 *       },
		 *       update: function() {
		 *         if ( this.options.task.completed ) {
		 * 	         this.element.addClass( 'strike' );
		 * 	       } else {
		 *           this.element.removeClass( 'strike' );
		 *         }
		 *       },
		 *       task: function( newTask ) {
		 *         this.options.task = newTask;
		 *         this.on();
		 *         this.update();
		 *       }
		 *     });
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({ completed: true }) 
		 *     });
		 *     taskstriker.task( new TaskStriker({ 
		 *       task: new Task({ completed: false }) 
		 *     }));
		 * 
		 * ## Adding new events
		 * 
		 * If events need to be bound to outside of the control and templated event handlers
		 * are not sufficent, you can call this.on to bind or delegate programatically:
		 * 
		 *     init: function() {
		 *        // calls somethingClicked( el, ev )
		 *        this.on( 'click', 'somethingClicked' ); 
		 *     
		 *        // calls function when the window is clicked
		 *        this.on( window, 'click', function( ev ) {
		 *          //do something
		 *        });
		 *     },
		 *     somethingClicked: function( el, ev ) {
		 *       
		 *     }
		 * 
		 * @param {HTMLElement|jQuery.fn|Object} [el=this.element]
		 * The element to be bound.  If an eventName is provided,
		 * the control's element is used instead.
		 * @param {String} [selector] A css selector for event delegation.
		 * @param {String} [eventName] The event to listen for.
		 * @param {Function|String} [func] A callback function or the String name of a control function.  If a control
		 * function name is given, the control function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		on: function( el, selector, eventName, func ) {
			
			if ( ! el ) {

				// Adds bindings.
				this.off();

				// Go through the cached list of actions and use the processor 
				// to bind
				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element,
					destroyCB = shifter(this,"destroy"),
					funcName;
					
				for ( funcName in actions ) {
					if ( actions.hasOwnProperty( funcName )) {
						ready = actions[funcName] || cls._action(funcName, this.options);
						bindings.push(
							ready.processor(ready.delegate || element, 
							                ready.parts[2], 
											ready.parts[1], 
											funcName, 
											this));
					}
				}
	
	
				// Setup to be destroyed...  
				// don't bind because we don't want to remove it.
				can.bind.call(element,"destroyed", destroyCB);
				bindings.push(function( el ) {
					can.unbind.call(el,"destroyed", destroyCB);
				});
				return bindings.length;
			}

			if ( typeof el == 'string' ) {
				func = eventName;
				eventName = selector;
				selector = el;
				el = this.element;
			}
			
			if ( typeof func == 'string' ) {
				func = shifter(this,func);
			}

			this._bindings.push( binder( el, eventName, func, selector ));

			return this._bindings.length;
		},
		// Unbinds all event handlers on the controller.
		/**
		 * @hide
		 * Unbinds all event handlers on the controller. You should never
		 * be calling this unless in use with [can.Control::on].
		 */
		off : function(){
			var el = this.element[0]
			each(this._bindings || [], function( value ) {
				value(el);
			});
			// Adds bindings.
			this._bindings = [];
		},
		// Prepares a `control` for garbage collection
		/**
		 * @function destroy
		 * `destroy` prepares a control for garbage collection and is a place to
		 * reset any changes the control has made.  
		 * 
		 * ## Allowing Garbage Collection
		 * 
		 * Destroy is called whenever a control's element is removed from the page using 
		 * the library's standard HTML modifier methods.  This means that you
		 * don't have to call destroy yourself and it 
		 * will be called automatically when appropriate.  
		 * 
		 * The following `Clicker` widget listens on the window for clicks and updates
		 * its element's innerHTML.  If we remove the element, the window's event handler
		 * is removed auto-magically:
		 *  
		 * 
		 *      Clickr = can.Control({
		 *       "{window} click": function() {
		 * 	       this.element.html( this.count ? 
		 * 	                          this.count++ : this.count = 0 );
		 *       }  
		 *     });
		 *     
		 *     // create a clicker on an element
		 *     new Clicker( "#clickme" );
		 * 
		 *     // remove the element
		 *     $( '#clickme' ).remove();
		 * 
		 * 
		 * The methods you can use that will destroy controls automatically by library:
		 * 
		 * __jQuery and Zepto__
		 * 
		 *   - $.fn.remove
		 *   - $.fn.html
		 *   - $.fn.replaceWith
		 *   - $.fn.empty
		 * 
		 * __Dojo__
		 * 
		 *   - dojo.destroy
		 *   - dojo.empty
		 *   - dojo.place (with the replace option)
		 * 
		 * __Mootools__
		 * 
		 *   - Element.prototype.destroy
		 * 
		 * __YUI__
		 * 
		 *   - TODO!
		 * 
		 * 
		 * ## Teardown in Destroy
		 * 
		 * Sometimes, you want to reset a controlled element back to its
		 * original state when the control is destroyed.  Overwriting destroy
		 * lets you write teardown code of this manner.  __When overwriting
		 * destroy, make sure you call Control's base functionality__.
		 * 
		 * The following example changes an element's text when the control is
		 * created and sets it back when the control is removed:
		 * 
		 *     Changer = can.Control({
		 *       init: function() {
		 *         this.oldText = this.element.text();
		 *         this.element.text( "Changed!!!" );
		 *       },
		 *       destroy: function() {
		 *         this.element.text( this.oldText );
		 *         can.Control.prototype.destroy.call( this );
		 *       }
		 *     });
		 *     
		 *     // create a changer which changes #myel's text
		 *     var changer = new Changer( '#myel' );
		 * 
		 *     // destroy changer which will reset it
		 *     changer.destroy();
		 * 
		 * ## Base Functionality
		 * 
		 * Control prepares the control for garbage collection by:
		 * 
		 *   - unbinding all event handlers
		 *   - clearing references to this.element and this.options
		 *   - clearing the element's reference to the control
		 *   - removing it's [can.Control.pluginName] from the element's className
		 * 
		 */
		destroy: function() {
			var Class = this.constructor,
				pluginName = Class.pluginName || Class._fullName,
				controls;
			
			// Unbind bindings.
			this.off();
			
			if(pluginName && pluginName !== 'can_control'){
				// Remove the `className`.
				this.element.removeClass(pluginName);
			}
			
			// Remove from `data`.
			controls = can.data(this.element,"controls");
			controls.splice(can.inArray(this, controls),1);
			
			can.trigger( this, "destroyed"); // In case we want to know if the `control` is removed.
			
			this.element = null;
		}
	});

	var processors = can.Control.processors,

	// Processors do the binding.  
	// They return a function that unbinds when called.  
	//
	// The basic processor that binds events.
	basicProcessor = function( el, event, selector, methodName, control ) {
		return binder( el, event, shifter(control, methodName), selector);
	};




	// Set common events to be processed as a `basicProcessor`
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", 
		 "keypress", "mousedown", "mousemove", "mouseout", "mouseover", 
		 "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
		 "focusout", "mouseenter", "mouseleave"], function( v ) {
		processors[v] = basicProcessor;
	});
	
;


can.each([ can.Observe, can.Model ], function(clss){
	// in some cases model might not be defined quite yet.
	if(clss === undefined){
		return;
	}
	
	can.extend(clss, {
		/**
		 * @attribute can.Observe.static.attributes
		 * @parent can.Observe.attributes
		 *
		 * `can.Observe.attributes` is a property that contains key/value pair(s) of an attribute's name and its
		 * respective type for using in [can.Observe.static.convert convert] and [can.Observe.prototype.serialize serialize].
		 * 
		 *		var Contact = can.Observe({
		 *			attributes : {
		 *				birthday : 'date',
		 *				age: 'number',
		 *				name: 'string'
		 *			}
		 *		});
		 *
		 */
		attributes : {},
		
		/**
		 * @attribute can.Observe.static.convert
		 * @parent can.Observe.attributes
		 *
		 * You often want to convert from what the observe sends you to a form more useful to JavaScript. 
		 * For example, contacts might be returned from the server with dates that look like: "1982-10-20". 
		 * We can observe to convert it to something closer to `new Date(1982,10,20)`.
		 *
		 * Convert comes with the following types:
		 *
		 * - __date__ Converts to a JS date. Accepts integers or strings that work with Date.parse
		 * - __number__ An integer or number that can be passed to parseFloat
		 * - __boolean__ Converts "false" to false, and puts everything else through Boolean()
		 *
		 * The following sets the birthday attribute to "date" and provides a date conversion function:
		 *
		 *		var Contact = can.Observe({
		 *			attributes : {
		 *				birthday : 'date'
		 *			},
		 *			convert : {
		 *				date : function(raw){
		 *					if(typeof raw == 'string'){
		 *						//- Extracts dates formated 'YYYY-DD-MM'
		 *						var matches = raw.match(/(\d+)-(\d+)-(\d+)/);
		 *	
		 *						//- Parses to date object and returns
		 *						return new Date(matches[1], 
		 *								        (+matches[2])-1, 
		 *									    matches[3]);
		 *
		 *					}else if(raw instanceof Date){
		 *						return raw;
		 *					}
		 *				}
		 *			}
		 *		},{});
		 *
		 *		var contact = new Contact();
		 *
		 *		//- calls convert on attribute set
		 *		contact.attr('birthday', '4-26-2012') 
		 *
		 *		contact.attr('birthday'); //-> Date
		 *
		 * ## Assocations and Convert
		 *
		 * If you have assocations defined within your model(s), you can use convert to automatically
		 * call seralize on those models.
		 * 
		 * 		can.Model("Contact",{
		 * 			attributes : {
		 * 				tasks: "Task.models"
		 * 			}
		 * 		}, {});
		 *
		 * 		can.Model("Task",{
		 * 			attributes : {
		 * 				due : 'date'
		 * 			}
		 * 		},{});
		 *
		 * 		var contact = new Contact({
		 * 			tasks: [ new Task({
		 * 				due: new Date()
		 * 			}) ]
		 * 		});
		 * 
		 * 		contact.seralize(); 
		 * 		//-> { tasks: [ { due: 1333219754627 } ] }
		 * 
		 */
		convert: {
			"date": function( str ) {
				var type = typeof str;
				if ( type === "string" ) {
					return isNaN(Date.parse(str)) ? null : Date.parse(str)
				} else if ( type === 'number' ) {
					return new Date(str)
				} else {
					return str
				}
			},
			"number": function( val ) {
				return parseFloat(val);
			},
			"boolean": function( val ) {
				return Boolean(val === "false" ? 0 : val);
			},
			"default": function( val, error, type ) {
				var construct = can.getObject(type),
					context = window,
					realType;
				// if type has a . we need to look it up
				if ( type.indexOf(".") >= 0 ) {
					// get everything before the last .
					realType = type.substring(0, type.lastIndexOf("."));
					// get the object before the last .
					context = can.getObject(realType);
				}
				return typeof construct == "function" ? construct.call(context, val) : val;
			}
		},
		/**
		 * @attribute can.Observe.static.serialize
		 * @parent can.Observe.attributes
		 *
		 * `can.Observe.static.seralize` is object of name-function pairs that are used to 
		 * serialize attributes.
		 *
		 * Similar to [can.Observe.convert], in that the keys of this object correspond to 
		 * the types specified in [can.Observe.attributes].
		 *
		 * By default every attribute will be passed through the 'default' serialization method 
		 * that will return the value if the property holds a primitive value (string, number, ...), 
		 * or it will call the "serialize" method if the property holds an object with the "serialize" method set.
		 *
		 * For example, to serialize all dates to ISO format:
		 *
		 * 		var Contact = can.Observe({
		 * 			attributes : {
		 * 				birthday : 'date'
		 * 			},
		 * 			serialize : {
		 * 				date : function(val, type){
		 * 					return new Date(val).toISOString();
		 * 				}
		 * 			}
		 * 		},{});
		 * 		
		 * 		var contact = new Contact({ 
		 * 			birthday: new Date("Oct 25, 1973") 
		 * 		}).serialize();
		 * 		//-> { "birthday" : "1973-10-25T05:00:00.000Z" }
		 *
		 */
		serialize: {
			"default": function( val, type ) {
				return isObject(val) && val.serialize ? val.serialize() : val;
			},
			"date": function( val ) {
				return val && val.getTime()
			}
		}
	});
	
	// overwrite setup to do this stuff
	var oldSetup = clss.setup;
	
	/**
	 * @hide
	 * @attribute can.Observe.static.setup
	 * @parent can.Observe.attributes
	 *
	 * `can.Observe.static.setup` overrides default `can.Observe` setup to provide
	 * functionality for attributes.
	 *
	 */
	clss.setup = function(superClass, stat, proto){
		var self = this;
		oldSetup.call(self, superClass, stat, proto);

		can.each(["attributes", "validations"], function( name ) {
			if (!self[name] || superClass[name] === self[name] ) {
				self[name] = {};
			}
		});

		can.each(["convert", "serialize"], function( name ) {
			if ( superClass[name] != self[name] ) {
				self[name] = can.extend({}, superClass[name], self[name]);
			}
		});
	};
});

/**
 * @hide
 * @function can.Observe.prototype.convert
 * @parent can.Observe.attributes
 */
can.Observe.prototype.__convert = function(prop, value){
	// check if there is a

	var Class = this.constructor,
		val, type, converter;
		
	if(Class.attributes){
		// the type of the attribute
		type = Class.attributes[prop];
		converter = Class.convert[type] || Class.convert['default'];
	}
		
	return value === null || !type ? 
			// just use the value
			value : 
			// otherwise, pass to the converter
			converter.call(Class, value, function() {}, type);
};

/**
 * @function can.Observe.prototype.serialize
 * @parent can.Observe.attributes
 *
 * `can.Observe.prototype.serialize` serializes an object for the object. 
 * Serialized data is typically used to send back to a server.
 *
 * You can set the serialization methods similar to the convert methods:
 *
 *		var Contact = can.Observe({
 *			attributes : { 
 *				birthday : 'date'
 *			},
 *			serialize : {
 *				date : function( val, type ){
 *					return val.getYear() + 
 *						"-" + (val.getMonth() + 1) + 
 *						"-" + val.getDate(); 
 *				}
 *			}
 *		},{})
 *
 *		var contact = new Contact();
 *		contact.attr('birthday', new Date());
 *		contact.serialize()
 *		//-> { birthday: 'YYYY-MM-DD' }
 *
 * You can also get and serialize an individual property by passing the attribute
 * name to the `serialize` function.  Building on the above demo, we can serialize
 * the `birthday` attribute only.
 *
 *		contact.serialize('birthday') //-> 'YYYY-MM-DD'
 *
 * @param {Object} attrName (optional) when passed returns only that attribute name
 */
can.Observe.prototype.serialize = function(attrName){
	var where = {},
		Class = this.constructor,
		attrs = {};
		
	if(attrName != undefined){
		attrs[attrName] = this[attrName];
	} else {
		attrs = this.__get();
	}
		
	can.each(attrs, function( val, name ) {
		var type = Class.attributes[name],
			converter= Class.serialize[type];
			
		// if the value is an object, and has a attrs or serialize function
		where[name] = val && typeof val.serialize == 'function' ?
		// call attrs or serialize to get the original data back
		val.serialize() :
		// otherwise if we have  a converter
		converter ? 
			// use the converter
			converter(val, type) : 
			// or return the val
			val
	});
	
	return attrName != undefined ? where[attrName] : where;
};

})(true, this )