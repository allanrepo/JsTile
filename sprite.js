/*-----------------------------------------------------------------------------------
action items:
-	test if calling draw() too soon will cause error if image and/or image.canvas is 
	check for validity

completed	
-	capitalize first character so it is now 'Scene'. reason is we want to standardize classes to be
	starting with capital letter


completed [20181231]
-	use scene's draw() functions now used to draw images 

-----------------------------------------------------------------------------------*/
 
/*-----------------------------------------------------------------------------------
sprite class
-----------------------------------------------------------------------------------*/
function Sprite(imagefile)
{		
	// check if image file is passed
	if (typeof imagefile === 'undefined' ){ throw new Error("No image file is passed to sprite."); }

	// create image object and set this image file as its source
	var image = new Image();
	image.src = imagefile;
	image.parent = this;			
	
	// as this image file is loaded, let's set the canvas size where this image will be loaded
	image.onload = function() 
	{                       
		// add a reference to a canvas where this image file will be loaded
		this.canvas = document.createElement("canvas");
		if (!this.canvas){ throw new Error("Failed to create a canvas for an image object."); }	

		// set the canvas size based on the actual size of the image
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;			
		
		// finally let's draw this image into its canvas
		this.canvas.getContext("2d").drawImage(this, 0, 0);
		
		console.log(this.src + "(" + this.canvas.width + "x" + this.canvas.height + ") is loaded successfully to sprite object.");		
		
		// allow sprite class to handle onload event for this image
		if (this.parent.onload) this.parent.onload();
	}	

	// this event happens when image source file fails to load e.g. file doesn't exist
	image.onerror = function()
	{		
		throw new Error("Failed to load image source file. check if file exist."); 	 
	}
	
	// accessors
	this.width = function(){ return image.canvas? image.canvas.width : 0; }
	this.height = function(){ return image.canvas? image.canvas.height : 0; }
	this.getImage = function(){ return image; }

	/*-----------------------------------------------------------------------------------
	draw the image to canvas with option to use canvas or direct image
	-----------------------------------------------------------------------------------*/
	this.draw = function(elem, x, y, useCanvas = true)
	{		
		// make sure image is loaded 
		if (!image) return;
		if (!image.canvas) return;
		
		// make sure we are drawing to an actual scene object
		if (!(elem instanceof Scene) ){ throw new Error("scene object passed is not valid."); }

		// round off the x and y coordinate because we noticed some wierd shifting if a coordinate contains decimal value
		x = Math.round(x);
		y = Math.round(y);
		
		// draw with option to draw canvas or direct image
		elem.drawImage( useCanvas? image.canvas : image, x, y); 
	}	
	
	/*-----------------------------------------------------------------------------------
	draw a portion of the image to a specified target
	-----------------------------------------------------------------------------------*/
	this.drawRegionToTarget = function(elem, sx, sy, swidth, sheight, x, y, width, height, useCanvas = true)
	{
		// make sure image is loaded 
		if (!image) return;
		if (!image.canvas) return;   
		
		// make sure we are drawing to an actual scene object
		if (!(elem instanceof Scene) ){ throw new Error("scene object passed is not valid."); }

		// round off the x and y coordinate because we noticed some wierd shifting if a coordinate contains decimal value
		x = Math.round(x);
		y = Math.round(y);
		
		// draw with option to draw canvas or direct image 
		elem.drawImageRegionToTarget(useCanvas? image.canvas : image, sx, sy, swidth, sheight, x, y, width, height); 
	}
	
	/*-----------------------------------------------------------------------------------
	check if given position in the image intersects with a non transparent pixel
	-----------------------------------------------------------------------------------*/
}
