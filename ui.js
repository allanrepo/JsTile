/*------------------------------------------------------------------------------------------------------------
action item:
-	some function calls on child and pointers are probably not being check for existence correctly.
	figure out what's the best way to test them before calling them
- 	test how ui behaves when 'hide' parameter is set to various values including 'undefined' or some 
	random object. fix any unexpected behavior
-	test hide() of all ui classes
-	what's the design philosophy with event handlers for multi component ui objects such as slider?
	is our implementation acceptable and within the design philosophy? we have separate event handler
	for drawing body and thumb for sliders but both components share the same event handlers for 
	mouse events. is this acceptable?
-	convert hide() into property

completed
-	added min, max, curr as parameters to pass on draw event handlers
-	scene.width and .height are now properties. replaced .width() and .height() getters 

completed[20190105]
-	remove setParent() to all classes

completed[20181231]
-	removed console loggers for events
- 	replaced event handler arguments with objects so its easier to add new parameters in future. 
-	removed setEventHandlers(). addEventListeners() replaced them
-	add comments on slider's body onmousedown/drag event handlers to explain in more detail how thumb
	is repositioned
-	setEventHandlers() are also removed from slider class. event handlers for slider's body and thumb 
	are now set to be the same except for draw() event in which there's separate event for drawing body
	and and another for thumb
-	stopped firing up onmouseover() for root. onmouseover() is only supposed to fire up if mouse cursor
	moved to ui object FROM its sibling or parent.
-	in frame class, mousemove event handlers are only fired up if mouse IS NOT hovering to any of its child.

completed[20180316]
-	element parameter now expects it to be scene and not canvas

completed[20180311]
- 	slider control class implemented
-	mx, my now passed to mousedrag event
-	mouse cursor mx, my is now being passed to onmousedown, onmouseup, mousemove event handlers for 
	frame, root
-	remove findTopAtPoint() and updated findTopChildAtPoint() so it can do the same job as findTopAtPoint()

completed[20180307]
- 	handle mousemove, mouseleave, mouseover event handlers for root and frame class and test them
- 	add name string as property

------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
DESIGN PHILOSOPHY 

event:onmousemove
-	an event that happens to a ui object when mouse cursor is hovering/moving over its extent
-	this event fires up everytime the mouse cursor changes coordinate while within the ui object's extent
- 	it does NOT fire up when mouse cursor is moving over ui object's child. instead it fires up on the
	child.

event:onmouseover
-	an event that happens to a ui object when mouse cursor hovers/move over its extent.
-	difference with onmousemove is that this event fires up only once the first time mouse move over the
	ui object's extent. further movement over the ui object does not fire up this event until mouse cursor
	moves outside the ui object's extent, to which onmouseleave is fired up.
-	this event is only fired up if mouse cursor moved to ui object from its parent or sibling. it DOES NOT
	fire up if mouse cursor moved to ui object from its child
	
event:onmouseleave
-	an event that happens to a ui object when mouse cursor leaves or moves outside its extent.
-	this event is fired up only once as soon as mouse cursor moves out of the ui object's extent.	
-	this event is only fired up if mouse cursor moved into the ui object's parent or sibling. it DOES NOT
	fire up if mouse cursor moved into ui object's child.


------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
root element. it all starts here.
- 	this class instantiates the main object in user interface
- 	it binds to an element and resizes itself automatically to fit within its bounds/extent	by 
	listening to the element's "resize" event 
- 	it doesn't need to be rendered as its purpose is for logic use
-	the element it binds to is typically a scene element but it does not expect it to be.
	all it needs is the element's width and height and event handlers
-	it's top-left position is always 0,0 and width, height is always equal to parent's width, heigh 
	as it always fit to fill its parent extents
------------------------------------------------------------------------------------------------------------*/
function root(element, name)
{	
	/*--------------------------------------------------------------------------------------
	element is supposed to be a scene but this object does not expect it to be all it
	needs is the width/height of the object it will fit into
	--------------------------------------------------------------------------------------*/
	//var w = element?( (typeof element.width === 'function') ? element.width() : 0): 0;
	//var h = element?( (typeof element.height === 'function') ? element.height() : 0): 0;
	var w = element?( element.width ? element.width : 0): 0;
	var h = element?( element.height ? element.height : 0): 0;
	
	this.width = function(){ return w;}	
	this.height = function(){ return h;}	

	/*--------------------------------------------------------------------------------------
	will handle resize event from the object it binds to as it will resize itself to 
	always fit to it. note that canvas don't fire up resize event so the canvas of the
	scene this object binds to must have a custom event that fires up upon resize 
	--------------------------------------------------------------------------------------*/
	element.addEventListener("resize", function(e)
	{
		w = e?(e.detail.width? e.detail.width : 0): 0;
		h = e?(e.detail.height? e.detail.height : 0): 0;	

		// fire up event handler
		for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); } 
	}.bind(this));
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var resizeEvents = [];
	var drawEvents = [];
	var mouseupEvents = [];
	var mousedownEvents = [];
	var mouseleaveEvents = [];
	var mousedragEvents = [];
	var mousemoveEvents = [];
	var mouseoverEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }		
		if (e === "mouseup"){ mouseupEvents.push(f); }		
		if (e === "mousedown"){ mousedownEvents.push(f); }		
		if (e === "mouseleave"){ mouseleaveEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
		if (e === "mousemove"){ mousemoveEvents.push(f); }
		if (e === "mouseover"){ mouseoverEvents.push(f); }
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "mouseup"){ for (var i = 0; i < mouseupEvents.length; i++){ if (mouseupEvents[i] == f){ mouseupEvents.splice(i,1); return; }}}			
		if (e === "mousedown"){ for (var i = 0; i < mousedownEvents.length; i++){ if (mousedownEvents[i] == f){ mousedownEvents.splice(i,1); return; }}}			
		if (e === "mouseleave"){ for (var i = 0; i < mouseleaveEvents.length; i++){ if (mouseleaveEvents[i] == f){ mouseleaveEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
		if (e === "mousemove"){ for (var i = 0; i < mousemoveEvents.length; i++){ if (mousemoveEvents[i] == f){ mousemoveEvents.splice(i,1); return; }}}			
		if (e === "mouseover"){ for (var i = 0; i < mouseoverEvents.length; i++){ if (mouseoverEvents[i] == f){ mouseoverEvents.splice(i,1); return; }}}			
	}	

	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.addChild = function(child){ children.push(child); }
	this.removeChild = function(child){	for (var i = 0; i < children.length; i++) { if ( children[i] == child) { children.splice(i, 1); return; }}}
	this.getNumChildren = function(){ return children.length; }
	
	/*--------------------------------------------------------------------------------------
	this object doesn't really get rendered. its main purpose is to occupy the scene it 
	binds to. this function is used to render its child objects instead. however, an it 
	fires up a render event to allow application option in case users choose to
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{		
		for (var i = 0; i < drawEvents.length; i++){ drawEvents[i]({elem: this, name: name, w: w, h: h}); } 		
		for(var i = 0; i < children.length; i++){if (children[i].draw) children[i].draw();}					
	}
		  
	/*--------------------------------------------------------------------------------------
	tests if mouse cursor is within its bounds (collision detection against mouse)
	--------------------------------------------------------------------------------------*/
	this.intersect = function(mx, my)
	{
		if (mx > w) return false;
		if (my > h) return false;
		if (mx < 0) return false;
		if (my < 0) return false;		
		return true;
	}	
	
	/*--------------------------------------------------------------------------------------
	takes the given child object t and if it exist in children list will be moved to top
	--------------------------------------------------------------------------------------*/
	this.sendChildToTop = function(t)
	{
		for (var i = 0; i < children.length; i++)
		{
			if(children[i] == t)
			{
				children.splice(i,1);
				children.push(t);
				return;
			}
		}
	}

	/*--------------------------------------------------------------------------------------
	with given mouse cursor coordinate, it finds the top child that intersects with it, 
	starting from the top. it recursively (optional) checks through descendants until the 
	youngest that intersect is found. any child that intersects will also be moved to
	to top (optional)
	returns the child (or descendant) that is found to intersect with mouse cursor.
	returns null if no child (or descendant) if found to intersect
	--------------------------------------------------------------------------------------*/
	this.findTopChildAtPoint = function(mx, my, recursive, top)
	{
		for (var i = children.length - 1; i >= 0; i--)
		{ 
			if (typeof children[i].hide === 'function'){ if (children[i].hide()) continue; }
			if (children[i].intersect(mx, my))
			{ 
				// send this child to top. also, set i to top child
				if (top) 
				{
					this.sendChildToTop(children[i]);					
					i = children.length - 1;
				}
				
				// recursively do this...
				if (typeof children[i].findTopChildAtPoint === 'function' && recursive) 
				{					
					var t = children[i].findTopChildAtPoint(mx, my, recursive, top);
					if (t) return t;							
				}					
				return children[i]; 
			}
		}
	}

	/*--------------------------------------------------------------------------------------
	_mousemove points to a top child where mouse cursor hovers when mouse button
	is released (mouse over)
	_mousedown points to a child where the mouse cursor hovers when mouse button is pressed
	--------------------------------------------------------------------------------------*/
	var _mousedown = 0;
	var _mousemove = 0;
	
		
	/*--------------------------------------------------------------------------------------
	listen to "mousemove" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousemove", function(e)
	{ 
		// calculate the mouse cursor's relative position to element we are bound to
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 
		
		// if there's a child that mouse cursor has click to while mouse is moving, 
		// this child should track the mouse movement.
		if (_mousedown)
		{
			if(_mousedown.onmousedrag){_mousedown.onmousedrag(mx, my, e.movementX, e.movementY);}
		}
		// otherwise, find the top child that mouse cursor intersects with and set it as 
		// "mousemove" child		
		else
		{		
			// we are only looking for top child (immediate), grand childrens are not included. 
			var t = this.findTopChildAtPoint(mx, my, false, false);		

			// if the top child intersecting with mouse cursor is not the same as the previous child,
			// it means that the mouse cursor is now hovering on a new child. call "mouse leave" event
			// on previous child so it can handle this event
			if (t != _mousemove)
			{ 
				if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave(); }
				
				// if t is one of the root's active child, fire up "mouse over" event
				if(t){ if(t.onmouseover) t.onmouseover(); }	
				
				// if t does not exist, we mousever in root. trigger event only if root isn't mousemove ui before
				//else{ if(_mousemove != this) this.onmouseover(); }
			}		
			
			// update pointer to new child where mouse hovers and call "mouse move" event 
			if (t)_mousemove = t;
			else _mousemove = this;
			if (_mousemove){if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, e.movementX, e.movementY);}		
		}		
	
	}.bind(this));	
	
	/*--------------------------------------------------------------------------------------
	listen to "mousedown" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousedown", function(e)
	{ 
		// calculate the mouse cursor's relative position to element we are bound to
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 
		
		// find the top ui (including this) that the mouse button has click to and call its event
		//_mousedown = this.findTopAtPoint(mx, my, true);
		_mousedown = this.findTopChildAtPoint(mx, my, true, true);
		if (!_mousedown) _mousedown = this; 
		
		if (_mousedown){ if (_mousedown.onmousedown) _mousedown.onmousedown(mx, my); }
	}.bind(this));		
	
	/*--------------------------------------------------------------------------------------
	listen to "mouseup" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	document.addEventListener("mouseup", function(e)
	{ 
		// calculate the mouse cursor's relative position to element we are bound to
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 
				
		// if mouse button clicked into a child...
		if(_mousedown)
		{
			// is mouse cursor still hovering the child it click to?
			if (_mousedown.intersect)
			{
					// if yes, let the child handle "mouseup" event
					if (_mousedown.intersect(mx, my)){if (_mousedown.onmouseup) _mousedown.onmouseup(mx, my);}		
					
					// otherwise, let the child handle "mouse leave" event
					else{ if (_mousedown.onmouseleave) _mousedown.onmouseleave(); }
			}
			// if mouse cursor is now hovering on another child...
			else{if (_mousedown.onmouseleave) _mousedown.onmouseleave();}
		}
		_mousedown = 0;
	}.bind(this));			
	
	// handle event when this frame is being dragged by a mouse when it clicks and hold to it
	// dx/dy is the delta movement of mouse between previous and current onmousedrag event occurence
	this.onmousedrag = function(mx, my, dx, dy)
	{ 
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); }
	}	

	// handle event when mouse button is clicked into this frame
	this.onmousedown = function(mx, my)
	{ 
		for (var i = 0; i < mousedownEvents.length; i++){ mousedownEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}	
			
	// handle event when mouse is moving on top of this frame
	this.onmouseup = function(mx, my)
	{ 
		for (var i = 0; i < mouseupEvents.length; i++){ mouseupEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}	
	
	// handle event when mouse just moved inside this frame's extents
	this.onmouseover = function()
	{ 
		for (var i = 0; i < mouseoverEvents.length; i++){ mouseoverEvents[i]({elem: this, name: name}); }
	}	
	
	// handle event when mouse is moving on top of root
	this.onmousemove = function(mx, my, dx, dy)
	{ 
		for (var i = 0; i < mousemoveEvents.length; i++){ mousemoveEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); }
	}		
}


/*------------------------------------------------------------------------------------------------------------
frame element. 
- 	typically used as container for control elements such as buttons, text box, list box, and drop downs
- 	can be drag around via mouse within the bounds of its parent, typically root element
- 	to draw, attach a draw event handler 
------------------------------------------------------------------------------------------------------------*/
function frame(parent, name, x, y, w, h, sx, sy, hide)
{
	if (typeof parent !== 'undefined' && parent){if (parent.addChild){ parent.addChild(this); }}

	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.addChild = function(child){ children.push(child); }
	this.removeChild = function(child){ for (var i = 0; i < children.length; i++){ if ( children[i] == child){ children.splice(i, 1); return; }}}
	this.getNumChildren = function(){ return children.length; }
	
	/*--------------------------------------------------------------------------------------
	frames and other ui elements hold position relative only to its parent. this function
	returns its absolute position which is relative to root element 
	--------------------------------------------------------------------------------------*/
	this.getAbsPos = function()
	{
		var P = {x: x, y: y};		
		if (parent){ if (parent.getAbsPos){ T = parent.getAbsPos(); P.x += T.x; P.y += T.y; }}		
		return P;
	}
	
	/*--------------------------------------------------------------------------------------
	tests if mouse cursor is within its bounds (collision detection against mouse)
	--------------------------------------------------------------------------------------*/
	this.intersect = function(mx, my)
	{
		var P = this.getAbsPos();
		
		if (mx > P.x + w) return false;
		if (my > P.y + h) return false;
		if (mx < P.x) return false;
		if (my < P.y ) return false;
		
		return true;
	}		
	
	/*--------------------------------------------------------------------------------------
	takes the given child object t and if it exist in children list will be moved to top
	--------------------------------------------------------------------------------------*/
	this.sendChildToTop = function(t)
	{
		for (var i = 0; i < children.length; i++)
		{
			if(children[i] == t)
			{
				children.splice(i,1);
				children.push(t);
				return;
			}
		}
	}

	/*--------------------------------------------------------------------------------------
	with given mouse cursor coordinate, it finds the top child that intersects with it, 
	starting from the top. it recursively (optional) checks through descendants until the 
	youngest that intersect is found. any child that intersects will also be moved to
	to top (optional)
	returns the child (or descendant) that is found to intersect with mouse cursor.
	returns null if no child (or descendant) if found to intersect
	--------------------------------------------------------------------------------------*/
	this.findTopChildAtPoint = function(mx, my, recursive, top)
	{
		for (var i = children.length - 1; i >= 0; i--)
		{ 
			if (children[i].hide){ if (children[i].hide()) continue; }
			if (children[i].intersect(mx, my))
			{ 
				// send this child to top. also, set i to top child
				if (top) 
				{
					this.sendChildToTop(children[i]);					
					i = children.length - 1;
				}
				
				// recursively do this...
				if (children[i].findTopChildAtPoint && recursive) 
				{					
					var t = children[i].findTopChildAtPoint(mx, my, recursive, top);
					if (t) return t;							
				}					
				return children[i]; 
			}
		}
	}
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var resizeEvents = [];
	var drawEvents = [];
	var mouseupEvents = [];
	var mousedownEvents = [];
	var mouseleaveEvents = [];
	var mousedragEvents = [];
	var mouseoverEvents = [];
	var mousemoveEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }		
		if (e === "mouseup"){ mouseupEvents.push(f); }		
		if (e === "mousedown"){ mousedownEvents.push(f); }		
		if (e === "mouseleave"){ mouseleaveEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
		if (e === "mousemove"){ mousemoveEvents.push(f); }
		if (e === "mouseover"){ mouseoverEvents.push(f); }		
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "mouseup"){ for (var i = 0; i < mouseupEvents.length; i++){ if (mouseupEvents[i] == f){ mouseupEvents.splice(i,1); return; }}}			
		if (e === "mousedown"){ for (var i = 0; i < mousedownEvents.length; i++){ if (mousedownEvents[i] == f){ mousedownEvents.splice(i,1); return; }}}			
		if (e === "mouseleave"){ for (var i = 0; i < mouseleaveEvents.length; i++){ if (mouseleaveEvents[i] == f){ mouseleaveEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
		if (e === "mousemove"){ for (var i = 0; i < mousemoveEvents.length; i++){ if (mousemoveEvents[i] == f){ mousemoveEvents.splice(i,1); return; }}}			
		if (e === "mouseover"){ for (var i = 0; i < mouseoverEvents.length; i++){ if (mouseoverEvents[i] == f){ mouseoverEvents.splice(i,1); return; }}}			
	}	
	
	/*--------------------------------------------------------------------------------------
	draw function
	option to set draw event handler 
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{
		if (hide) return;
		var P = this.getAbsPos();
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, x: P.x, y: P.y, w: w, h: h});
		for (var i = 0; i < children.length; i++){ if (children[i].draw) children[i].draw(); }				
	}

	/*--------------------------------------------------------------------------------------
	_mousemove points to a top child where mouse cursor hovers when mouse button
	is released (mouse over)
	--------------------------------------------------------------------------------------*/
	var _mousemove = 0;	
	
	// handle event when this frame is being dragged by a mouse when it clicks and hold to it
	// dx/dy is the delta movement of mouse between previous and current onmousedrag event occurence
	this.onmousedrag = function(mx, my, dx, dy)
	{
		if(sx) x += dx;
		if(sy) y += dy;
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); }
	}	
	
	// handle event when mouse is moving on top of this frame
	this.onmousemove = function(mx, my, dx, dy)
	{		
		var t = this.findTopChildAtPoint(mx, my, false, false);		

		// if the top child intersecting with mouse cursor is not the same as the previous child,
		// it means that the mouse cursor is now hovering on a new child. call "mouse leave" event
		// on previous child so it can handle this event
		if (t != _mousemove)
		{ 
			if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave(); }
			if(t){ if(t.onmouseover) t.onmouseover(); }				
		}		
		
		// update pointer to new child where mouse hovers and call "mouse move" event 
		_mousemove = t;
		if (_mousemove){if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, dx, dy);}		
				
		// fire up event handler ONLY if no child is on top of the mouse cursor
		if (!_mousemove){ for (var i = 0; i < mousemoveEvents.length; i++){ mousemoveEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); } }
	}	

	// handle event when mouse is moved out of this frame's extents
	this.onmouseleave = function()
	{ 
		if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave();}
		_mousemove = 0;
		
		for (var i = 0; i < mouseleaveEvents.length; i++){ mouseleaveEvents[i]({elem: this, name: name}); }
	}

	// handle event when mouse just moved inside this frame's extents
	this.onmouseover = function()
	{ 
		for (var i = 0; i < mouseoverEvents.length; i++){ mouseoverEvents[i]({elem: this, name: name}); }
	}	
	
	// handle event when mouse button is clicked into this frame
	this.onmousedown = function(mx, my)
	{ 
		for (var i = 0; i < mousedownEvents.length; i++){ mousedownEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}
		
	// handle event when mouse is moving on top of this frame
	this.onmouseup = function(mx, my)
	{ 
		for (var i = 0; i < mouseupEvents.length; i++){ mouseupEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}	

	// setters and getters
	// --------------------------------------------------------------------------------------
	this.width = function(){ return w;}	
	this.height = function(){ return h;}
	this.setPos = function(px, py){ x = px; y = py;}
	this.movePos = function(dx, dy){ x += dx; y += dy; }
	this.getPos = function(){ return { x: x, y: y }; }	
	this.hide = function(state){ if (state) hide = state; return hide; }
	this.setSize = function(pw, ph)
	{ 
		w = pw; h = ph; 
		for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
	}
}

/*------------------------------------------------------------------------------------------------------------
slider control element
-	has 2 components - body and thumb
- 	t = length of the thumb. this aligns with slider's orientation
------------------------------------------------------------------------------------------------------------*/
function slider(parent, name, vertical, x, y, w, h, t, min, max, hide)
{
	var body = new frame(parent, name + "_body", x, y, w, h, false, false, hide);
	var thumb = new frame(body, name + "_thumb", 0, 0, vertical? w:t, vertical? t:h, false, hide); 
	
	// initialize current value to min 
	var current = min;	
		
	// updates the thumb position based on current value
	// --------------------------------------------------------------------------------------
	var updateThumbPos = function()
	{
		if (vertical) thumb.setPos(0, (current - min) / (max - min) * (h - t) );
		else thumb.setPos( (current - min) / (max - min) * (w - t), 0);
	}
	
	// update thumb position based on current value
	updateThumbPos();	
	
	/* --------------------------------------------------------------------------------------
	set/get visibility state 
	-------------------------------------------------------------------------------------- */
	this.hide = function(state)
	{ 
		if (state)
		{
			hide = state; 
			thumb.hide(state);
			body.hide(state);
		}
		return hide; 
	}
	
	body.addEventListener("draw", function(e)
	{
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, x: e.x, y: e.y, w: e.w, h: e.h, value: current, min: min, max: max});
	}.bind(this));

	thumb.addEventListener("draw", function(e)
	{
		for (var i = 0; i < drawThumbEvents.length; i++) drawThumbEvents[i]({elem: this, name: name, x: e.x, y: e.y, w: e.w, h: e.h, value: current, min: min, max: max});
	}.bind(this));
	
	this.draw = function()
	{
		if (hide) return;
		var P = this.getAbsPos();
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, x: P.x, y: P.y, w: w, h: h});
		for (var i = 0; i < children.length; i++){ if (children[i].draw) children[i].draw(); }				
	}	
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/

	var drawEvents = [];
	var drawThumbEvents = [];
	var changeEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "change"){ changeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }
		if (e === "drawthumb"){ drawThumbEvents.push(f); }
		if (e === "resize"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mouseup"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mousedown"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mouseover"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mouseleave"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mousemove"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mousedrag"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "change"){ for (var i = 0; i < changeEvents.length; i++){ if (changeEvents[i] == f){ changeEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "drawthumb"){ for (var i = 0; i < drawThumbEvents.length; i++){ if (drawThumbEvents[i] == f){ drawThumbEvents.splice(i,1); return; }}}			
		if (e === "resize"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mouseup"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mousedown"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mouseover"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mouseleave"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mousemove"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mousedrag"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
	}		

	/* --------------------------------------------------------------------------------------
	acquire or manually set the current index value of the slider
	-------------------------------------------------------------------------------------- */
	this.get = function(){ return current; }
	
	this.set = function(curr)
	{		
		current = curr;
		if (current > max) current = max;
		if (current < min) current = min;
		
		// update thumb position based on current value
		updateThumbPos();		
		
		for (var i = 0; i < changeEvents.length; i++){ changeEvents[i]({elem: this, val: curr, min: min, max: max}); }		
	}	
	
	/* --------------------------------------------------------------------------------------
	update range
	-------------------------------------------------------------------------------------- */
	this.resize = function(_min, _max)
	{
		min = _min;
		max = _max;
		
		this.set(curr);
	}
	
	/* --------------------------------------------------------------------------------------
	thumb is set to be not draggable so we can manage its mouse drag movement here
	its movement shift snaps to slider's shift index
	-------------------------------------------------------------------------------------- */
	var M;
	thumb.addEventListener("mousedrag",function(e)
	{
		// calculate relative position of mouse cursor with thumb
		var P = body.getAbsPos();
		e.x -= M.x;
		e.y -= M.y;
		
		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.set( M.current + Math.round( (vertical?e.y:e.x) / shift) );			
		
	}.bind(this));
	
	/* --------------------------------------------------------------------------------------
	snapshot current value and mouse cursor on mousedown to be used as reference for 
	mouse drag
	-------------------------------------------------------------------------------------- */
	thumb.addEventListener("mousedown", function(e)
	{
		M = { x: e.x, y: e.y, current: current };
	});			
	
	/* --------------------------------------------------------------------------------------
	when user click (mousedown) on the slider's body where thumb does not occupy, slider 
	forces the thumb to be repositioned where it's center sits on the mouse pointer whenver
	possible. the center position is with respect to its orientation - meaning, the slider's
	length 't' is centered. it's thickness is ignored.	
	-------------------------------------------------------------------------------------- */
	body.addEventListener("mousedown", function(e)
	{
		// calculate relative position of mouse cursor with body + thumb's center position
		// note that we ignore slider's orientation and just blindly calculate with thumb'same
		// length on both x and y. this is because only one of them will be used to calculate
		// position and the choice will depend on the slider's orientation
		var P = body.getAbsPos();
		e.x -= (P.x + t/2);
		e.y -= (P.y + t/2);
		
		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.set( Math.round( (vertical?e.y:e.x) / shift) + min );			
		
	}.bind(this));	
	
	/* --------------------------------------------------------------------------------------
	when mouse cursor is dragged into slider's body, reposition the thumb so that its center
	sits at	the mouse pointer whenever possible. the center position is with respect to its
	orientation - meaning, the slider's	length 't' is centered. it's thickness is ignored.	
	-------------------------------------------------------------------------------------- */
	body.addEventListener("mousedrag", function(e)
	{		
		// calculate relative position of mouse cursor with body + thumb's center position
		// note that we ignore slider's orientation and just blindly calculate with thumb'same
		// length on both x and y. this is because only one of them will be used to calculate
		// position and the choice will depend on the slider's orientation
		var P = body.getAbsPos();
		e.x -= (P.x + t/2);
		e.y -= (P.y + t/2);
		
		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.set( Math.round( (vertical?e.y:e.x) / shift) + min );			
		
	}.bind(this));	
	
}
