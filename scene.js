/*------------------------------------------------------------------------------------------------------------
action item:
-	bring out as much of canvas drawing function 

completed 
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
function scene(thisCanvas)
{	
	/*------------------------------------------------------------------------
	initialize the canvas element
	------------------------------------------------------------------------*/
	var m_canvas = {};
		
	// if a reference to canvas is passed, we copy reference to that canvas element
	if (typeof thisCanvas != 'undefined')
	{		
		// access canvas created from web page
		m_canvas = document.getElementById(thisCanvas);		
		
		// let's check if the referenced canvas exist
		if (!m_canvas)
		{
			// dynamically create canvas element
			console.log("canvas with id=" +thisCanvas+ " does not exist. Creating a new canvas...");
			m_canvas = document.createElement("canvas");
		}
	}
	// otherwise, if no canvas reference is passed, we create a new one
	else
	{
		thisCanvas = "canvas";
		console.log("no canvas reference passed, creating a canvas with id=" +thisCanvas+ "...");
		m_canvas = document.createElement("canvas");
	}  	
	
	// at this point, canvas is either created or already exist so we do final verification
	if (m_canvas)
	{
		console.log("canvas with id=" +thisCanvas+ " successfully created or already exists.");
		document.body.appendChild(m_canvas);		
	}
	else{ throw new Error("Failed to canvas with id=" +thisCanvas+ "."); }
	
		
	/*------------------------------------------------------------------------
	configure canvas - extent, position, orientation, etc...
	------------------------------------------------------------------------*/

	// privileged method: set extent of the canvas
	this.setSize = function(width, height)                             
	{
		m_canvas.width = width;
		m_canvas.height = height;
		
		// fire up a "resize" event 
		var resize = new CustomEvent("resize",{ detail:{ width: width, height: height }});
		m_canvas.dispatchEvent(resize);
	}    
	
	// privileged method: set the left and top offset position of the canvas where it will be placed by html 
	// if html set this canvas to be drawn at the center of the page, the x and y will be its offset
	this.setPos = function(x, y)
	{
		//CSS3 transform to move element, doing this for cross-browser compatibility
		m_canvas.style.MozTransform = "translate(" + x + "px, " + y + "px)";
		m_canvas.style.WebkitTransform = "translate(" + x + "px, " + y + "px)";
		m_canvas.style.OTransform = "translate(" + x + "px, " + y + "px)";
		
		// fire up a "move" event 
		var move = new CustomEvent("move",{ detail:{x: x, y: y}});
		m_canvas.dispatchEvent(move);		
	}	

	// privileged method: set background color of the canvas.
	// color can be set as #[XX][YY][ZZ] where XX is 8-bit red, YY is 8-bit green, ZZ is 8-bit blue; #FFFF00 = yellow
	this.setBackgroundColor = function(color){ m_canvas.style.backgroundColor = color; }	
	
	// clear screen
	this.clear = function(){ m_canvas.getContext("2d").clearRect(0, 0, m_canvas.width, m_canvas.height); }

	// get the top-left position of canvas in the document as well as its width/height all in the form of 'rect' object
	this.getBoundingClientRect = function(){ return m_canvas.getBoundingClientRect(); }

	// access canvas extents
	this.width = function(){ return m_canvas.width; }
	this.height = function(){ return m_canvas.height; }

	// set or access canvas properties
	this.shadowBlur = function(e){ if (e) m_canvas.getContext("2d").shadowBlur = e; return m_canvas.getContext("2d").shadowBlur; }
	this.fillStyle = function(e){ if (e) m_canvas.getContext("2d").fillStyle = e; return m_canvas.getContext("2d").fillStyle; }
	this.strokeStyle = function(e){ if (e) m_canvas.getContext("2d").strokeStyle = e; return m_canvas.getContext("2d").strokeStyle; }
	this.shadowColor = function(e){ if (e) m_canvas.getContext("2d").shadowColor = e; return m_canvas.getContext("2d").shadowColor; }
	this.shadowOffsetX = function(e){ if (e) m_canvas.getContext("2d").shadowOffsetX = e; return m_canvas.getContext("2d").shadowOffsetX; }
	this.shadowOffsetY = function(e){ if (e) m_canvas.getContext("2d").shadowOffsetY = e; return m_canvas.getContext("2d").shadowOffsetY; }	
	
	// wrapped canvas functions to handle its drawing state
	this.save = function(){ m_canvas.getContext("2d").save(); }	
	this.restore = function(){ m_canvas.getContext("2d").restore(); }	
	
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
	
	this.addEventListener = function(evt, func){ m_canvas.addEventListener(evt, func); }
	this.removeEventListener = function(evt, func){ m_canvas.removeEventListener(evt, func); }
		
	/*------------------------------------------------------------------------
	functions to draw stuff 
	------------------------------------------------------------------------*/
	
	// wrapper for draw functions of canvas element
	this.drawImage = function(image, x, y){ m_canvas.getContext("2d").drawImage(image, x, y); }	
	this.drawImageRegionToTarget = function(image, sx, sy, sw, sh, x, y, w, h){ m_canvas.getContext("2d").drawImage(image, sx, sy, sw, sh, x, y, w, h); }	
	this.drawImageToTarget = function(image, x, y, w, h){ m_canvas.getContext("2d").drawImage(image, x, y, w, h); }
	
	// draw line
	this.drawLine = function(x0, y0, x1, y1, color)
	{
		var ctx = m_canvas.getContext("2d");
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x0, y0)
		ctx.lineTo(x1, y1)
		ctx.stroke();			
	}
	
	// draw circle
	this.drawCircle = function(x, y, radius, color, fill)
	{
		var ctx = m_canvas.getContext("2d");
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
		var ctx = m_canvas.getContext("2d");
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
		var ctx = m_canvas.getContext("2d");
		
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
	
	this.translate = function(tx, ty){ m_canvas.getContext("2d").translate(tx, ty); }
		
	/*------------------------------------------------------------------------
	 functions to draw text primarily for debugging purposes
	------------------------------------------------------------------------*/
	
	// privileged method: write text to canvas at given position
	this.drawText = function(text, x, y, font, color, alpha, halign, valign) 
	{
		var ctx = m_canvas.getContext("2d");
		if (!ctx){ throw new Error("Failed to get 2D context from " +m_canvas+ "."); }
		
		if (typeof font !== 'undefined' && font){ ctx.font = font; }
		if (typeof color !== 'undefined' && color){ ctx.fillStyle = color; }
		
		// default is top-left, no transparency
		(typeof alpha !== 'undefined' && alpha)? ctx.globalAlpha = alpha: ctx.globalAlpha = 1.0; 
		(typeof halign !== 'undefined' && halign)? ctx.textAlign = halign: ctx.textAlign = "left"; 
		(typeof valign !== 'undefined' && valign)? ctx.textBaseline = valign: ctx.textBaseline = "top";  

		ctx.fillText(text, x, y);		
	}
	

	/*------------------------------------------------------------------------------------------------------------------------------------------
	functions to manage event loop
	queueing event follows FIFO rule; if 2 same function is queued, the next call to stop it will stop the first one in the list
	------------------------------------------------------------------------------------------------------------------------------------------*/
	var m_events = [];
	var m_intID;
	var m_eventQueue = [];
	
	// accessors
	this.getNumEvents = function(){ return m_events.length; }
	
	// add an event handler to list of events to process in application loop
	// n - if set, this event will only be executed n steps
	// t - event's time interval in milliseconds
	this.addEvent = function(func, t, n)
	{
		var e = { func: func, t: t, n: n, add: true }
		m_eventQueue.push(e);
	}
	
	// queue up an event handler to be removed from the list. once safe to delete, it will be deleted
	this.removeEvent = function(func)
	{	
		// look for the first occurence of this event in the list starting at first-in
		for (var i = 0; i < m_events.length; i++)
		{ 			
			if(func == m_events[i]) 
			{
				// add this event to list of to be removed 
				var e = { func: func, add: false }
				m_eventQueue.push(e);				
				
				// let's pause this event so it won't get updated anymore from here onwards...
				m_events[i].paused = true; 
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
		m_intID = setInterval(function()
		{
			// snapshot time now
			var now = new Date().getTime();						
			
			// loop through all events 		
			for (var i = 0; i < m_events.length; i++)
			{ 
				m_events[i].now = now;
				
				// if it's the first time for this event
				if (m_events[i].first)
				{
					m_events[i].first = false;
					m_events[i].prev = now;
					continue;
				}
				
				// if this event is already stopped, let's not update it anymore.
				if(m_events[i].paused) continue;
		
				// if time elapsed more than this event's interval, let's fire it up
				if (now - m_events[i].prev > m_events[i].t)
				{
					// calculate how many steps the event has occured based on delta time between prev and now
					var step = Math.floor((now - m_events[i].prev)/m_events[i].t);					
					
					// calculate frame rate of this event. it updates every second
					m_events[i].frame++;
					if(now - m_events[i].start1sec >= 1000)
					{
						m_events[i].fps = m_events[i].frame / (now - m_events[i].start1sec) * 1000;
						m_events[i].start1sec = now;
						m_events[i].frame = 0;
					}
										
					// update timers and fire up the event!
					m_events[i].prev += (step * m_events[i].t);
					m_events[i]	({	step: step, 
									now: now, 
									fps: m_events[i].fps
								});				

					// if this event is to be executed at limited step, handle it here
					if (m_events[i].n != 'undefined' && m_events[i].n)
					{
						m_events[i].n -= step;
						if (m_events[i].n <= 0) this.removeEvent(m_events[i]);
					}
				}	
			}		
				
			// any event that is requested to be added or removed will be performed here.
			while( m_eventQueue.length)
			{
				// if to be added...
				if (m_eventQueue[0].add)
				{
					m_events.push(m_eventQueue[0].func);
					m_events[m_events.length - 1].t = m_eventQueue[0].t;
					m_events[m_events.length - 1].first = true;		
					m_events[m_events.length - 1].n = m_eventQueue[0].n;			
					m_events[m_events.length - 1].paused = false;					
					m_events[m_events.length - 1].step = 0;					
					m_events[m_events.length - 1].start1sec = now;					
					m_events[m_events.length - 1].fps = 0;					
				}
				// if to be removed...
				else
				{				
					for (var i = 0; i < m_events.length; i++)
					{
						if( m_eventQueue[0].func == m_events[i]) 
						{
							m_events.splice(i,1);
							break;
						}
					}
				}
				m_eventQueue.shift();				
			}
			
		}.bind(this), 1);
	}
	
	// stop the scene  
	this.stop = function(){ clearInterval(m_intID); }				
}


