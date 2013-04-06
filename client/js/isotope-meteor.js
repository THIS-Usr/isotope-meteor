Timers = new Meteor.Collection(null);

///////////////////////////////////////////////////////////////////////////////
/*
if (! Session.get("x")) {
  Session.set("x", 1);
}

if (! Session.get("y")) {
  Session.set("y", 1);
}

if (! Session.get("z")) {
  Session.set("z", 1);
}

Template.preserveDemo.x =
Template.constantDemo.x =
Template.stateDemo.x =
function () {
  return Session.get("x");
};

Template.timer.y = function () {
  return Session.get("y");
};

Template.stateDemo.z =
function () {
  return Session.get("z");
};

Template.page.events({
  'click input.x': function () {
    Session.set("x", Session.get("x") + 1);
  },

  'click input.y': function () {
    Session.set("y", Session.get("y") + 1);
  },

  'click input.z': function () {
    Session.set("z", Session.get("z") + 1);
  }
});

///////////////////////////////////////////////////////////////////////////////

if (typeof Session.get("spinForward") !== 'boolean') {
  Session.set("spinForward", true);
}

Template.preserveDemo.preserve([ '.spinner', '.spinforward' ]);

Template.preserveDemo.spinForwardChecked = function () {
  return Session.get('spinForward') ? 'checked="checked"' : '';
};

Template.preserveDemo.spinAnim = function () {
  return Session.get('spinForward') ? 'spinForward' : 'spinBackward';
};

Template.preserveDemo.events({
  'change .spinforward' : function (event) {
    Session.set('spinForward', event.currentTarget.checked);
  }
});

///////////////////////////////////////////////////////////////////////////////

Template.constantDemo.checked = function (which) {
  return Session.get('mapchecked' + which) ? 'checked="checked"' : '';
};

Template.constantDemo.show = function (which) {
  return ! Session.get('mapchecked' + which);
};

Template.constantDemo.events({
  'change .remove' : function (event) {
    var tgt = event.currentTarget;
    Session.set('mapchecked' + tgt.getAttribute("which"), tgt.checked);
  }
});

///////////////////////////////////////////////////////////////////////////////

Template.stateDemo.events({
  'click .create': function () {
    Timers.insert({});
  }
});

Template.stateDemo.timers = function () {
  return Timers.find();
};

Template.timer.events({
  'click .reset': function (event, template) {
    template.elapsed = 0;
    updateTimer(template);
  },
  'click .delete': function () {
    Timers.remove(this._id);
  }
});

var updateTimer = function (timer) {
  timer.node.innerHTML = timer.elapsed + " second" +
    ((timer.elapsed === 1) ? "" : "s");
};

Template.timer.created = function () {
  var self = this;
  self.elapsed = 0;
  self.node = null;
};

Template.timer.rendered = function () {
  var self = this;
  self.node = this.find(".elapsed");
  updateTimer(self);

  if (! self.timer) {
    var tick = function () {
      self.elapsed++;
      self.timer = setTimeout(tick, 1000);
      updateTimer(self);
    };
    tick();
  }
};

Template.timer.destroyed = function () {
  clearInterval(this.timer);
};

///////////////////////////////////////////////////////////////////////////////

Template.d3Demo.left = function () {
  return { group: "left" };
};

Template.d3Demo.right = function () {
  return { group: "right" };
};

Template.circles.events({
  'mousedown circle': function (evt, template) {
    Session.set("selectedCircle:" + this.group, evt.currentTarget.id);
  },
  'click .add': function () {
    Circles.insert({x: Random.fraction(), y: Random.fraction(),
                    r: Random.fraction() * .1 + .02,
                    color: {
                      r: Random.fraction(),
                      g: Random.fraction(),
                      b: Random.fraction()
                    },
                    group: this.group
                   });
  },
  'click .remove': function () {
    var selected = Session.get("selectedCircle:" + this.group);
    if (selected) {
      Circles.remove(selected);
      Session.set("selectedCircle:" + this.group, null);
    }
  },
  'click .scram': function () {
    Circles.find({group: this.group}).forEach(function (r) {
      Circles.update(r._id, {
        $set: {
          x: Random.fraction(), y: Random.fraction(), r: Random.fraction() * .1 + .02
        }
      });
    });
  },
  'click .clear': function () {
    Circles.remove({group: this.group});
  }
});

var colorToString = function (color) {
  var f = function (x) { return Math.floor(x * 256); };
  return "rgb(" + f(color.r) + "," +
    + f(color.g) + "," + + f(color.b) + ")";
};

Template.circles.count = function () {
  return Circles.find({group: this.group}).count();
};

Template.circles.disabled = function () {
  return Session.get("selectedCircle:" + this.group) ?
    '' : 'disabled="disabled"';
};

Template.circles.created = function () {
};

Template.circles.rendered = function () {
  var self = this;
  self.node = self.find("svg");

  var data = self.data;

  if (! self.handle) {
    d3.select(self.node).append("rect");
    self.handle = Deps.autorun(function () {
      var circle = d3.select(self.node).selectAll("circle")
        .data(Circles.find({group: data.group}).fetch(),
              function (d) { return d._id; });

      circle.enter().append("circle")
        .attr("id", function (d) {
          return d._id;
        })
        .attr("cx", function (d) {
          return d.x * 272;
        })
        .attr("cy", function (d) {
          return d.y * 272;
        })
        .attr("r", 50)
        .style("fill", function (d) {
          return colorToString(d.color);
        })
        .style("opacity", 0);

      circle.transition()
        .duration(250)
        .attr("cx", function (d) {
          return d.x * 272;
        })
        .attr("cy", function (d) {
          return d.y * 272;
        })
        .attr("r", function (d) {
          return d.r * 272;
        })
        .style("fill", function (d) {
          return colorToString(d.color);
        })
        .style("opacity", .9)
        .ease("cubic-out");

      circle.exit().transition()
        .duration(250)
        .attr("r", 0)
        .remove();

      var selectionId = Session.get("selectedCircle:" + data.group);
      var s = selectionId && Circles.findOne(selectionId);
      var rect = d3.select(self.node).select("rect");
      if (s)
        rect.attr("x", (s.x - s.r) * 272)
        .attr("y", (s.y - s.r) * 272)
        .attr("width", s.r * 2 * 272)
        .attr("height", s.r * 2 * 272)
        .attr("display", '')
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", 3);
      else
        rect.attr("display", 'none');
    });
  }
};

Template.circles.destroyed = function () {
  this.handle && this.handle.stop();
};

*/
/////// - Template.isotope - ///////
if (Meteor.isClient) {
	  Meteor.startup(function () {
	    console.log("DOM loaded.");
	    //isotope();//must be called at some point - not here though
	    //Session.set("isotope", new isotope());//** what, if anything would this do?
	    console.log("function isotope not called here.");
	  });
	};
	
Template.isotope.helpers({
		  list: function () {
			  return Lists.find({}, {sort: {name: 1}});
		  }
		});

Template.isotope.created = function () {

	};

function xinspect(o,i){
	    if(typeof i=='undefined')i='';
	    if(i.length>50)return '[MAX ITERATIONS]';
	    var r=[];
	    for(var p in o){
	        var t=typeof o[p];
	        r.push(i+'"'+p+'" ('+t+') => '+(t=='object' ? 'object:'+xinspect(o[p],i+'  ') : o[p]+''));
	    }
	    return r.join(i+'\n');
	}

var Inspect = {
	    TYPE_FUNCTION: 'function',
	    // Returns an array of (the names of) all methods
	    methods: function(obj) {
	        var testObj = obj || self;
	        var methods = [];
	        for (prop in testObj) {
	            if (typeof testObj[prop] == Inspect.TYPE_FUNCTION && typeof Inspect[prop] != Inspect.TYPE_FUNCTION) {
	                methods.push(prop);
	            }
	        }
	        return methods;
	    },
	    // Returns an array of (the names of) all properties
	    properties: function(obj) {
	        var testObj = obj || self;
	        var properties = [];
	        for (prop in testObj) {
	            if (typeof testObj[prop] != Inspect.TYPE_FUNCTION && typeof Inspect[prop] != Inspect.TYPE_FUNCTION) {
	                properties.push(prop);
	            }
	        }
	        return properties;
	    }
	};

	
Template.isotope.rendered = function () {
	//****isotope();//not here - incorrect behaviour
	//call to isotope function
	console.log( ' checking what\'s available and what works:- $iso logging' );
	var list = function () {
		return Lists.find({}, {sort: {name: 1}});
	};
	//list inspection
	//console.log('logging list data object : ' + xinspect(list));
	//or
	console.log('logging list data object - methods : ' + Inspect.methods(list));
	console.log('logging list data object - properties : ' + Inspect.properties(list));
	//***isotope() = object window;xinspect(isotope()) = consumes too much memory;xinspect(Session.get(isotope()))
	//if (!(Session.get("isotope") instanceof isotope)) {
	//	Session.set("isotope",new isotope());}
	//console.log('****testing whether isotope dereference here ' + xinspect(new isotope()));
	
	//*Note - naked call to isotope() *here* is incorrect - causes elements to be unclickable
	
	/*TBD - may need this something like this to clone - needs thought 
	no method next here
	list.each(function(){
       var $this = $(this);
        console.log('logging list data object : ' + $this);
	});
	*/
	
	//for clone?
	//isotope().appendElements(list);
	
    console.log('container length:- ' + $('#container').filter('div').length );
    
    //elements plus cloned elements   
    
    //**console.log('after appendElement - global space - each element:- ' + $('#container').html() );
    
    /*TBD /////////
    - Shows logging against different elements
    - Note:not $iso object and no Session.set or get now - doesn't work as expected and not needed
    //what is availability of isotope vars? $() nothing
    console.log('$() - global space - each element:- ' + $().text() );
    $(this).html() null
    console.log('$iso - global space - each element:- ' + $iso );
    //#Object ?
    console.log('$iso - global space - each element:- ' + this.filter('div').text() );
    //this === [object Window]
    //$(this) [object Object]
    console.log('isotope() - :- ' + Session.get("iso").html() );
    Session.get("iso").isotope('reLayout');
   
   */ ////////////
    
    
    	/*TBD this code shows how to attach css to an element, including opacity.
    	Needs to be rewritten into a function 
    	var self = this;
    	  self.node = self.find("svg");

    	  //var data = self.data;

    	  if (! self.handle) {
    	    //d3.select(self.node).append("rect");
    	    self.handle = Deps.autorun(function () {
    	      var circle = d3.select(self.node).selectAll("circle")
    	        .data(Circles.find({group: data.group}).fetch(),
    	              function (d) { return d._id; });

    	      circle.enter().append("circle")
    	        .attr("id", function (d) {
    	          return d._id;
    	        })
    	        .style("opacity", 1);

    	      circle.transition()
    	        .duration(250)
    	        .style("opacity", .9)
    	        .ease("cubic-out");

    	      var selectionId = Session.get("selectedCircle:" + data.group);
    	      var s = selectionId && Circles.findOne(selectionId);
    	      var rect = d3.select(self.node).select("rect");
    	      if (s)
    	        rect.attr("x", (s.x - s.r) * 272)
    	        .attr("y", (s.y - s.r) * 272)
    	        .attr("width", s.r * 2 * 272)
    	        .attr("height", s.r * 2 * 272)
    	        .attr("display", '')
    	        .style("fill", "none")
    	        .style("stroke", "red")
    	        .style("stroke-width", 3);
    	      else
    	        rect.attr("display", 'none');
    	    });
    	  }	
    	  *///////////
};

Template.isotope.destroyed = function () {
};
//shuffle
//correct behaviour with function isotope(options) return this; - can pass in options to alter isotope object
Template.isotope.events({
	'click .isotopeshuffle': function () {
		//something programmatic
		/****
		console.log(options);
		console.log($.Isotope);
		var el = $('.element');
		console.log(isotope(optlt));
		var jsonString = JSON.stringify(options);
		console.log(jsonString);
		*/
		// following wrong approach
		//$.each( options, function( key, value ) {
	//		console.log( key + ": " + value );
		//	if(value == 'masonry :'){
			//	String.replace(options, 'masonry :', 'visibleStyleObject : { opacity : 100, scale : 1.5 } /n masonry :');
		//	}
	//		});
	
	// ///// - styles - /////
		//isotope(options);//new style - OK
		//isotope().isotope('shuffle');//OK
		//isotope(optlt);//respects new options - OK
		
		//var $iso = isotope(); OK
		//$iso.isotope('shuffle'); OK
		//Session.set("isotope",isotope());KO
		//console.log('logging "isotope()" data object : ' + Inspect.methods(isotope()));
		//console.log('logging Session.get("isotope") data object : ' + isotope().getComputedStyle());KO
		//isotope(options).isotope('shuffle');OK - overrides
		//isotope(optlt).isotope('shuffle');
		
		// - call into 'shuffle' - //
		//isotope('optlt');//optlt - quoted seen as a method 
		isotope();//needed to initialise
		//elements shouldn't oclude
		isotope(optlt).isotope('shuffle');//here - not in helper - this is nearly correct behaviour
	  },
	  
	});	

var options =  {
	      itemSelector : '.element',
	      containerStyleObject :
	      { position: 'relative', overflow: 'hidden' },
	      hiddenClassString : 'isotope-hidden',
	      	hiddenStyleObject :
	    		{ opacity : 0, scale : 0.001 },
	    	onLayout: function( $elems, instance ) {
			    // `this` refers to jQuery object of the container element
			    console.log( 'onLayout - $clonedall height logged:- ' + this.height());
			    // callback provides jQuery object of laid-out item elements
			    $elems.css({ 
				position: 'relative',
			  	overflow: 'hidden',
			  	width: '250',
			  	height: '500',
			  	background: '',//blue etc .. shows as altered CSS
			  	//webkitTransform: 'translate3d(250px, 55px, 0px) scale3d(2, 2, 1);',
			  	borderWidth: '2px',
			  	opacity: '.80',
			    "z-index": 100
				 });
			    // instance is the Isotope instance
			    console.log('isotope.events:- ' + instance.$filteredAtoms.length );
			  },
			//visibleStyleObject : { opacity : 100, scale : 1.5 },//BIG!
	      masonry : {
	        columnWidth : 120
	      },
	      masonryHorizontal : {
	        rowHeight: 120
	      },
	      cellsByRow : {
	        columnWidth : 240,
	        rowHeight : 240
	      },
	      cellsByColumn : {
	        columnWidth : 240,
	        rowHeight : 240
	      },
	      getSortData : {
	        symbol : function( $elem ) {
	          return $elem.attr('data-symbol');
	        },
	        category : function( $elem ) {
	          return $elem.attr('data-category');
	        },
	        number : function( $elem ) {
	          return parseInt( $elem.find('.number').text(), 10 );
	        },
	        weight : function( $elem ) {
	          return parseFloat( $elem.find('.weight').text().replace( /[\(\)]/g, '') );
	        },
	        name : function ( $elem ) {
	          return $elem.find('.name').text();
	        }
	      }
	    };
/*
 * does nothing when used in original or subsequent call, but a subsequent call using this option 
 * object does do something!
 */
var optlt =  {
	      itemSelector : '.element',
	      
	      onLayout: function( $elems, instance ) {
			    // `this` refers to jQuery object of the container element
			    console.log( 'onLayout - $clonedall height logged:- ' + this.height());
			    // callback provides jQuery object of laid-out item elements
			    $elems.css({ 
				position: 'relative',
			  	overflow: 'hidden',
			  	//width: '100',
			  	//height: '120',
			  	background: '',//blue element etc OK .. shows as altered CSS - background to each element
			  	//webkitTransform: 'translate3d(250px, 55px, 0px) scale3d(1, 1, 1);',
			  	borderWidth: '2px',
			  	opacity: '.80',
			    "z-index": 100
				 });
			    this.css({ 
				  	//background: 'blue'//OK the 'container' background
					 });
	      },
	      
	      masonry : {
		        columnWidth : '',//?
		        background: 'red'//does nothing
		      },
	    };

/* TD
 * isotope no longer anonymous and takes 'options' - incorrect??
 * isotope(options)
 * here are the exposed function calls - but are there others or can others be made available -
 * especially how to work on an atom - or do I need?
 * ('reLayout')
 * ( 'insert', $newEls )
 * ('shuffle')
 * $container.append( $newEls ).isotope( 'appended', $newEls );
 * $container.append - can be appendTo, prepend etc. In that case what does 'appended' do?
 * Look further in to JSON and option object creation - haven't done yet
 * JSON injection from server via Meteor
 * Look into reset - how to
 * Find way of clone
 * Find way of overlay
 * Find control of animations
 * 
 */

function isotope(options){
    
    var $container = $('#container');	
    	
      // add randomish size classes
      $container.find('.element').each(function(){
        var $this = $(this),
            number = parseInt( $this.find('.number').text(), 10 );
        if ( number % 7 % 2 === 1 ) {
          $this.addClass('width2');
        }
        if ( number % 3 === 0 ) {
          $this.addClass('height2');
        }
      });
        
    if(options){
    	$container.isotope(options);	
    }
    else {
    
    $container.isotope({
      itemSelector : '.element',
      containerStyleObject :
      { position: 'relative', overflow: 'hidden' },
      hiddenClassString : 'isotope-hidden',
      masonry : {
        columnWidth : 120
      },
      masonryHorizontal : {
        rowHeight: 120
      },
      cellsByRow : {
        columnWidth : 240,
        rowHeight : 240
      },
      cellsByColumn : {
        columnWidth : 240,
        rowHeight : 240
      },
      getSortData : {
        symbol : function( $elem ) {
          return $elem.attr('data-symbol');
        },
        category : function( $elem ) {
          return $elem.attr('data-category');
        },
        number : function( $elem ) {
          return parseInt( $elem.find('.number').text(), 10 );
        },
        weight : function( $elem ) {
          return parseFloat( $elem.find('.weight').text().replace( /[\(\)]/g, '') );
        },
        name : function ( $elem ) {
          return $elem.find('.name').text();
        }
      }
    });
    }
    
    
      var $optionSets = $('#options .option-set'),
          $optionLinks = $optionSets.find('a');

      $optionLinks.click(function(){
        var $this = $(this);
        // don't proceed if already selected
        if ( $this.hasClass('selected') ) {
          return false;
        }
        var $optionSet = $this.parents('.option-set');
        $optionSet.find('.selected').removeClass('selected');
        $this.addClass('selected');
  
        // make option object dynamically, i.e. { filter: '.my-filter-class' }
        var options = {},
            key = $optionSet.attr('data-option-key'),
            value = $this.attr('data-option-value');
        // parse 'false' as false boolean
        value = value === 'false' ? false : value;
        options[ key ] = value;
        if ( key === 'layoutMode' && typeof changeLayoutMode === 'function' ) {
          // changes in layout modes need extra logic
          changeLayoutMode( $this, options );
        } else {
          // otherwise, apply new options
          $container.isotope( options );
        }
        
        return false;
      });


    
      // change layout
      var isHorizontal = false;
      function changeLayoutMode( $link, options ) {
        var wasHorizontal = isHorizontal;
        isHorizontal = $link.hasClass('horizontal');

        if ( wasHorizontal !== isHorizontal ) {
          // orientation change
          // need to do some clean up for transitions and sizes
          var style = isHorizontal ? 
            { height: '80%', width: $container.width() } : 
            { width: 'auto' };
          // stop any animation on container height / width
          $container.filter(':animated').stop();
          // disable transition, apply revised style ***//*** how to revise style
          $container.addClass('no-transition').css( style );
          setTimeout(function(){
            $container.removeClass('no-transition').isotope( options );
          }, 100 );
        } else {
          $container.isotope( options );
        }
      }


      // change size of clicked element
      $container.delegate( '.element', 'click', function(){
    	  $(this).toggleClass('large');
          $container.isotope('reLayout');
      });
      

      // toggle variable sizes of all elements
      $('#toggle-sizes').find('a').click(function(){
        $container
          .toggleClass('variable-sizes')
          .isotope('reLayout');
        
        return false;
      });


    
      $('#insert a').click(function(){
        var $newEls = $( fakeElement.getGroup() );
        $container.isotope( 'insert', $newEls );
        return false;
      });

    //also controls size of appended elements
      $('#append a').click(function(){
        var $newEls = $( fakeElement.getGroup() );
        $container.append( $newEls ).isotope( 'appended', $newEls );
		//$container.append( $newElsclone ).isotope( 'appended', $newElsclone );//must be append
        return false;
      });
      
      //append elements named function with params
      appendElements = function(newEls){
        $container.append( newEls ).isotope( 'appended', newEls );
        return false;
      };
	
        
    var $sortBy = $('#sort-by');
    $('#shuffle a').click(function(){
    $container.isotope('shuffle');
    $sortBy.find('.selected').removeClass('selected');
    $sortBy.find('[data-option-value="random"]').addClass('selected');
     
      return false;
    });//'#shuffle a'

   return this;
  };


  
  jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ? 
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
};
  
