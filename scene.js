/*------------------------------------------------------------------------------------------------------------
action item:
-	bring out as much of canvas drawing function 
-	might want to change canvas property wrappers to use defineProperty()

completed
- 	add more canvas property wrappers
- 	update drawText() such that it's x,y param means it's the top-left of the rectangle where
	the text will be drawn.
-	add function to get text width
- 	updated drawText() as it now alignment feature, clipping, and bounding box. fancy!
- 	add a function to clip drawings in rectangular area
-	replace canvas width and height getter functions into properties

completed[20190105]
-	capitalize first character so it is now 'Scene'. reason is we want to standardize classes to be
	starting with capital letter
-	wrapped globalAlpha property of canvas and make it a property of scene
- 	change m_canvas to canvas for simplicity

completed [20181231]
- 	added comment notes on addEvent() to describe n and t parameters
- 	added function to enable/disable auto resizing of canvas to fit document area
- 	fixed some of the canvas function wrappers to call the functions with context()
-	added wrapper for canvas' save() and restore() functions to allow saving its drawing state

completed [20181225]
-	remove useCanvas() function to force others not to use it anymore
-	when executing event, an object containing its information (e.g. fps, step) is now passed to it
- 
completed[20181201]
-	event functions' frame rate are now being measured and passed as argument to the function
-	n counter on event manager now looks for both n = 0 and n = undefined. previously it's just undefined

completed[20180316]
-	draw() functions implemented and the wraps canvas' draw() function so no need to access canvas object
	
completed[20180307]
- 	removed functions that manage mouse events
- 	removed function that add event listener
- 	add accessor to canvas width, height
- 	added eventhandler methods for canvas as well as getBoundingClientRect() to mimic canvas' method.
	these are needed by ui classes so they can directly bind to scene class and not canvas

------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
design documentation

events
- 	functions that are queued in the list to be executed based on its specified frame rate
- 	parameters:
	-	step - number of times the event is supposed to occur based on the current delta time (curr - prev)

------------------------------------------------------------------------------------------------------------*/

/////////////////////////////////////////////////////////////////////////////////////////////////
// holds object to draw stuff
// runs a scene loop with controllable frame rate
/////////////////////////////////////////////////////////////////////////////////////////////////
Scene = function(thisCanvas)
{	
	/*------------------------------------------------------------------------
	initialize the canvas element
	------------------------------------------------------------------------*/
	var canvas = {};
		
	// if a reference to canvas is passed, we copy reference to that canvas element
	if (typeof thisCanvas != 'undefined')
	{		
		// access canvas created from web page
		canvas = document.getElementById(thisCanvas);		
		
		// let's check if the referenced canvas exist
		if (!canvas)
		{
			// dynamically create canvas element
			console.log("canvas with id=" +thisCanvas+ " does not exist. Creating a new canvas...");
			canvas = document.createElement("canvas");
		}
	}
	// otherwise, if no canvas reference is passed, we create a new one
	else
	{
		thisCanvas = "canvas";
		console.log("no canvas reference passed, creating a canvas with id=" +thisCanvas+ "...");
		canvas = document.createElement("canvas");
	}  	
	
	// at this point, canvas is either created or already exist so we do final verification
	if (canvas)
	{
		console.log("canvas with id=" +thisCanvas+ " successfully created or already exists.");
		document.body.appendChild(canvas);		
	}
	else{ throw new Error("Failed to canvas with id=" +thisCanvas+ "."); }
	
		
	/*------------------------------------------------------------------------
	configure canvas - extent, position, orientation, etc...
	------------------------------------------------------------------------*/

	// privileged method: set extent of the canvas
	this.setSize = function(width, height)                             
	{
		canvas.width = width;
		canvas.height = height;
		
		// fire up a "resize" event 
		var resize = new CustomEvent("resize",{ detail:{ width: width, height: height }});
		canvas.dispatchEvent(resize);
	}    
	
	// privileged method: set the left and top offset position of the canvas where it will be placed by html 
	// if html set this canvas to be drawn at the center of the page, the x and y will be its offset
	this.setPos = function(x, y)
	{
		//CSS3 transform to move element, doing this for cross-browser compatibility
		canvas.style.MozTransform = "translate(" + x + "px, " + y + "px)";
		canvas.style.WebkitTransform = "translate(" + x + "px, " + y + "px)";
		canvas.style.OTransform = "translate(" + x + "px, " + y + "px)";
		
		// fire up a "move" event 
		var move = new CustomEvent("move",{ detail:{x: x, y: y}});
		canvas.dispatchEvent(move);		
	}	

	// privileged method: set background color of the canvas.
	// color can be set as #[XX][YY][ZZ] where XX is 8-bit red, YY is 8-bit green, ZZ is 8-bit blue; #FFFF00 = yellow
	this.setBackgroundColor = function(color){ canvas.style.backgroundColor = color; }	
	
	// clear screen
	this.clear = function(){ canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); }

	// get the top-left position of canvas in the document as well as its width/height all in the form of 'rect' object
	this.getBoundingClientRect = function(){ return canvas.getBoundingClientRect(); }

	// access canvas extents
	//this.width = function(){ return canvas.width; }
	//this.height = function(){ return canvas.height; }
	Object.defineProperty(this, "width", { get: function(){ return canvas.width; } });
	Object.defineProperty(this, "height", { get: function(){ return canvas.height; } });

	// set or access canvas properties
	Object.defineProperty(this, "shadowBlur", { get: function(){ return canvas.getContext("2d").shadowBlur; }, set: function(e){ canvas.getContext("2d").shadowBlur = e; }});
	Object.defineProperty(this, "fillStyle", { get: function(){ return canvas.getContext("2d").fillStyle; }, set: function(e){ canvas.getContext("2d").fillStyle = e; }});
	Object.defineProperty(this, "strokeStyle", { get: function(){ return canvas.getContext("2d").strokeStyle; }, set: function(e){ canvas.getContext("2d").strokeStyle = e; }});
	Object.defineProperty(this, "shadowColor", { get: function(){ return canvas.getContext("2d").shadowColor; }, set: function(e){ canvas.getContext("2d").shadowColor = e; }});
	Object.defineProperty(this, "shadowOffsetX", { get: function(){ return canvas.getContext("2d").shadowOffsetX; }, set: function(e){ canvas.getContext("2d").shadowOffsetX = e; }});
	Object.defineProperty(this, "shadowOffsetY", { get: function(){ return canvas.getContext("2d").shadowOffsetY; }, set: function(e){ canvas.getContext("2d").shadowOffsetY = e; }});
	Object.defineProperty(this, "globalAlpha", { get: function(){ return canvas.getContext("2d").globalAlpha; }, set: function(e){ canvas.getContext("2d").globalAlpha = e; }});
	Object.defineProperty(this, "font", { get: function(){ return canvas.getContext("2d").font; }, set: function(e){ canvas.getContext("2d").font = e; }});
	Object.defineProperty(this, "textBaseline", { get: function(){ return canvas.getContext("2d").textBaseline; }, set: function(e){ canvas.getContext("2d").textBaseline = e; }});
	
	// wrapped canvas functions to handle its drawing state
	this.save = function(){ canvas.getContext("2d").save(); }	
	this.restore = function(){ canvas.getContext("2d").restore(); }	

	// wrapped canvas functions for text
	this.getTextWidth = function(text, font)
	{ 
		if (typeof font !== 'undefined' && font){ canvas.getContext("2d").font = font; }
		return canvas.getContext("2d").measureText(text).width; 
	}

	/*------------------------------------------------------------------------
	scene can automatically resize canvas to fill document area. this can be
	enabled/disabled with this function
	------------------------------------------------------------------------*/	
	
	// internal function that resizes the canvas
	var autoFitDocument = function(e)
	{
		this.setSize(window.innerWidth, window.innerHeight);
		this.setPos(0, 0);				
	}.bind(this);
	
	// enable/disable auto resize canvas 
	this.autoFitDocument = function(enable)
	{		
		if (typeof enable != 'undefined' && enable) 
		{
			autoFitDocument();
			window.addEventListener("resize", autoFitDocument);				
		}
		else{ window.removeEventListener("resize", autoFitDocument); }		
	}
	
	/*------------------------------------------------------------------------
	wrapper for event handler functions for canvas element
	------------------------------------------------------------------------*/	
	
	this.addEventListener = function(evt, func){ canvas.addEventListener(evt, func); }
	this.removeEventListener = function(evt, func){ canvas.removeEventListener(evt, func); }
		
	/*------------------------------------------------------------------------
	functions to draw stuff 
	------------------------------------------------------------------------*/
	
	// wrapper for draw functions of canvas element
	this.drawImage = function(image, x, y){ canvas.getContext("2d").drawImage(image, x, y); }	
	this.drawImageRegionToTarget = function(image, sx, sy, sw, sh, x, y, w, h){ canvas.getContext("2d").drawImage(image, sx, sy, sw, sh, x, y, w, h); }	
	this.drawImageToTarget = function(image, x, y, w, h){ canvas.getContext("2d").drawImage(image, x, y, w, h); }
	
	// draw line
	this.drawLine = function(x0, y0, x1, y1, color)
	{
		var ctx = canvas.getContext("2d");
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x0, y0)
		ctx.lineTo(x1, y1)
		ctx.stroke();			
	}
	
	// draw circle
	this.drawCircle = function(x, y, radius, color, fill)
	{
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2*Math.PI);
		
		if (typeof fill != 'undefined')
		{
			ctx.fillStyle = fill;
			ctx.fill();
		}
		
		if (typeof color != 'undefined')
		{
			ctx.strokeStyle = color;
			ctx.stroke();			
		}		
	}		
	
	// draw rectangle
	this.drawRect = function(x, y, w, h, color, fill)
	{
		var ctx = canvas.getContext("2d");
		if (fill) 
		{
			ctx.fillStyle = fill;
			ctx.fillRect(x,y,w,h);
		}
		if (color)
		{
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.rect(x,y,w,h);
			ctx.stroke();	
		}			
	}
	
	// draw rounded corner frame 
	this.drawRoundedRectangle = function(x, y, w, h, r, color, fill)
	{
		var ctx = canvas.getContext("2d");
		
		if (r == 'undefined' || !r)
		{
			if (fill) 
			{
				ctx.fillStyle = fill;
				ctx.fillRect(x,y,w,h);
			}
			if (color)
			{
				ctx.strokeStyle = color;
				ctx.beginPath();
				ctx.rect(x,y,w,h);
				ctx.stroke();	
			}				
		}
		else
		{			
			ctx.beginPath();			
			ctx.moveTo(x + r, y + 0);
			ctx.lineTo(x + w - r, y + 0);
			ctx.arcTo(x + w, y + 0, x + w, y + r, r);
			ctx.lineTo(x + w, y + h - r);
			ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
			ctx.lineTo(x + r, y + h);
			ctx.arcTo(x + 0, y + h, x + 0, y + h - r, r);
			ctx.lineTo(x + 0, y + r);
			ctx.arcTo(x + 0, y + 0, x + r, y + 0, r);
			if(fill){ ctx.fillStyle = fill; ctx.fill(); }		
			if(color){ ctx.strokeStyle = color; ctx.stroke(); }
		}
	}	

	
	/*------------------------------------------------------------------------
	functions that performs transformation of canvas element
	------------------------------------------------------------------------*/		
	this.translate = function(tx, ty){ canvas.getContext("2d").translate(tx, ty); }

	this.clip = function(x, y, w, h)
	{
		canvas.getContext("2d").beginPath();
		canvas.getContext("2d").rect(x, y, w, h);
		canvas.getContext("2d").clip();
	}
		
	/*------------------------------------------------------------------------
	 functions to draw text primarily for debugging purposes
	------------------------------------------------------------------------*/
	
	// privileged method: write text to canvas at given position
	
	this.draw1Text = function(text, x, y, font, color) 
	{
		var ctx = canvas.getContext("2d");
		if (!ctx){ throw new Error("Failed to get 2D context from " +canvas+ "."); }

		if (typeof font !== 'undefined' && font){ ctx.font = font; }
		if (typeof color !== 'undefined' && color){ ctx.fillStyle = color; }
		
		// x,y is always the top-left of text
		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		ctx.fillText(text, x, y);		
	}
	

	/*------------------------------------------------------------------------
	function to draw text 
	------------------------------------------------------------------------*/
	this.drawText = function(	text, 
								x, y, // top-left position to draw
								w, h, // render/clipping rectangular area
								s, font = 'verdana', color = 'black', // font size, style, and color
								halign = 'left', // horizontal alignment - left, right, center
								valign = 'top', // vertical alignment - top, bottom, center
								clip = false // clip text if true
								)
	{
		var ctx = canvas.getContext("2d");
		if (!ctx){ throw new Error("Failed to get 2D context from " +canvas+ "."); }

		// get width of font
		var tw = this.getTextWidth(text, s + "px " + font);
	
		// check if we're clipping
		if ((tw > w || s > h) && clip)
		{
			this.save();
			this.clip(x, y, w, h);
		}
	
		// calculate top-left x,y position based on given alignment 
		//tx = x; // left
		//tx = x - (tw - w)/2; // center
		//tx = x - (tw - w); // right
		x -= (halign === 'left'? 0 : (tw - w) / (halign === 'right'? 1 : 2));
		y -= (valign === 'top'? 0 : (s - h) / (valign === 'bottom'? 1 : 2));
	
		// ensure there's no transparency or shadow
		ctx.globalAlpha = 1;
		ctx.shadowBlur = 0;

		// canvas will always align to top-left x,y as we managed the alignment ourselves
		ctx.textAlign = "left";
		ctx.textBaseline = "top";				
		
		// tell canvas font size, type, and color
		if (typeof font !== 'undefined' && font){ ctx.font = s + "px " + font; }
		if (typeof color !== 'undefined' && color){ ctx.fillStyle = color; }		

		ctx.fillText(text, x, y);
	
		// if we clipped, let's restore
		if ((tw > w || s > h) && clip) this.restore();
	}	
	

	/*------------------------------------------------------------------------------------------------------------------------------------------
	functions to manage event loop
	queueing event follows FIFO rule; if 2 same function is queued, the next call to stop it will stop the first one in the list
	------------------------------------------------------------------------------------------------------------------------------------------*/
	var events = [];
	var intID;
	var eventQueue = [];
	
	// accessors
	this.getNumEvents = function(){ return events.length; }
	
	// add an event handler to list of events to process in application loop
	// n - if set, this event will only be executed n steps
	// t - event's time interval in milliseconds
	this.addEvent = function(func, t, n)
	{
		var e = { func: func, t: t, n: n, add: true }
		eventQueue.push(e);
	}
	
	// queue up an event handler to be removed from the list. once safe to delete, it will be deleted
	this.removeEvent = function(func)
	{	
		// look for the first occurence of this event in the list starting at first-in
		for (var i = 0; i < events.length; i++)
		{ 			
			if(func == events[i]) 
			{
				// add this event to list of to be removed 
				var e = { func: func, add: false }
				eventQueue.push(e);				
				
				// let's pause this event so it won't get updated anymore from here onwards...
				events[i].paused = true; 
				break;
			}
		}
	}
	
	// start the application loop at 1ms interval. 1ms is the fastest you can set
	// execute one setInterval and fire up all events from it
	var prev;
	this.start = function()
	{
		prev = new Date().getTime();
		intID = setInterval(function()
		{
			// snapshot time now
			var now = new Date().getTime();						
			
			// loop through all events 		
			for (var i = 0; i < events.length; i++)
			{ 
				events[i].now = now;
				
				// if it's the first time for this event
				if (events[i].first)
				{
					events[i].first = false;
					events[i].prev = now;
					continue;
				}
				
				// if this event is already stopped, let's not update it anymore.
				if(events[i].paused) continue;
		
				// if time elapsed more than this event's interval, let's fire it up
				if (now - events[i].prev > events[i].t)
				{
					// calculate how many steps the event has occured based on delta time between prev and now
					var step = Math.floor((now - events[i].prev)/events[i].t);					
					
					// calculate frame rate of this event. it updates every second
					events[i].frame++;
					if(now - events[i].start1sec >= 1000)
					{
						events[i].fps = events[i].frame / (now - events[i].start1sec) * 1000;
						events[i].start1sec = now;
						events[i].frame = 0;
					}
										
					// update timers and fire up the event!
					events[i].prev += (step * events[i].t);
					events[i]	({	step: step, 
									now: now, 
									fps: events[i].fps
								});				

					// if this event is to be executed at limited step, handle it here
					if (events[i].n != 'undefined' && events[i].n)
					{
						events[i].n -= step;
						if (events[i].n <= 0) this.removeEvent(events[i]);
					}
				}	
			}		
				
			// any event that is requested to be added or removed will be performed here.
			while( eventQueue.length)
			{
				// if to be added...
				if (eventQueue[0].add)
				{
					events.push(eventQueue[0].func);
					events[events.length - 1].t = eventQueue[0].t;
					events[events.length - 1].first = true;		
					events[events.length - 1].n = eventQueue[0].n;			
					events[events.length - 1].paused = false;					
					events[events.length - 1].step = 0;					
					events[events.length - 1].start1sec = now;					
					events[events.length - 1].fps = 0;					
				}
				// if to be removed...
				else
				{				
					for (var i = 0; i < events.length; i++)
					{
						if( eventQueue[0].func == events[i]) 
						{
							events.splice(i,1);
							break;
						}
					}
				}
				eventQueue.shift();				
			}
			
		}.bind(this), 1);
	}
	
	// stop the scene  
	this.stop = function(){ clearInterval(intID); }				
}


