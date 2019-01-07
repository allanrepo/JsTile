/*---------------------------------------------------------------------------------------------------------------------------------
DESIGN PHILOSOPHY

tile image/resource decription
- 	has fix width but can have varying height
- 	has 2 properties common to all tile image regardless of height
	- 	depth - in terms of perspective, it's the depth of the tile from the front to rear
	-	base - how 'thick' the tile is

- 	a typical tile image is shown below 

							1		-----------------|			
						1       1							
					1               1       
				1                       1 			depth
				1   1               1   1       
				1   1   1       1   1   1
	|--------		1   1   1   1   1     -----------|
 base       			1   1   1
	|-------------			1
	
- some tile images are taller, because they contain something on top of their base

                            0       --------------------------------------|
                        0       0
                    0       0   0				offset height
				0		0	 	0	-----------------|			
				0	0           1							       actual height
				0	0       1       1       
				1   0   1               1 		 depth
				1   1               1   1       
				1   1   1       1   1   1
	|--------		1   1   1   1   1     -----------|
 base       	|		1   1   1		|
	|-------------			1          -----------------------------------|
				|						|
				|<----    width    ---->|

				
- 	regardless of height differences, their base and depth values are always the same
- 	when rendering a map, all tiles are vertically aligned with their depth 
- 	below show how 3 tiles with varying height are arranged to align at their depth...                                                      
   
																				0    
				0                                                     		0       0
			0       0                                            		0               0
		0       0   0                                            		0   0               0
	0		0	 	0            				1		          	 	0		0		0	0
	0	0           1			 			1   	1		      	 	0			0  	 	0
	0	0       1       1        		1           	1        		1           0       0
	1   0   1               1		1                   	1		1      	1       0       1
	1   1               1   1    	1   1               1   1    		1       1   0   1   
	1   1   1       1   1   1    	1   1   1       1   1   1    	  	   	1		1      
		1   1   1   1   1        		1   1   1   1   1        		   	   	1          
			1   1   1            			1   1   1            				    
				1                				1	              					 
				
- 	an image can contain multiple tile
-	below shows a 2x3 (rowxcol) multi-tile

					0			------------------------------------------------|
				0		0
			0				0											offset height
		0				0	0	1		----------------------------------------|			
		0	0		0		0       1							
		0		0		    0           1       
		0		0	        0               1 			
		0		0 			0			1		1
		0		0			1		1				1		
		1		0		1		1						1
		1	1	0	1		1		1				1		1
		1	1	1		1				1		1				1			total depth
			1	1	1						1						1
				1	1	1				1		1				1	1
					1	1	1		1				1		1	1	1
						1	1	1						1	1	1
							1	1	1				1	1	1
								1	1	1		1	1	1
	|-----------------------		1	1	1	1	1		--------------------|
 base 									1	1	1
	|---------------------------			1			


---------------------------------------------------------------------------------------------------------------------------------*/	


/*---------------------------------------------------------------------------------------------------------------------------------
map class implementation
---------------------------------------------------------------------------------------------------------------------------------*/	
//function Map(scene, map, cx, cy, depth, base, tilewidth)
function Map()
{
	"use strict";




	return;

	/*------------------------------------------------------------------------
	 private members
	------------------------------------------------------------------------*/
	var tiles = [];			
	var maxtileheight = 0;

	/*------------------------------------------------------------------------
	// validate arguments
	------------------------------------------------------------------------*/
	
	// check if scene is valid
	if (typeof scene === 'undefined'){ throw new Error("scene passed is undefined"); }
	if (!(scene instanceof Scene) ){ throw new Error("scene object is not an instance of scene."); }

	// make sure map is a 2D array
	if (typeof map === 'undefined'){ throw new Error("map is undefined"); }
	if (map.constructor !== Array){ throw new Error("map is not an array"); }
	if (!map.length){ throw new Error("map does not contain rows"); }
	if (map[0].constructor !== Array){ throw new Error("map is not a 2D array"); }
	
	/*------------------------------------------------------------------------
	store map information
	------------------------------------------------------------------------*/	

	// calculate the total height and width of the map. this width and height 
	// refers to the rectangular area that the map can fit into when it is drawn.
	map.height = (map.length + map[0].length)/2 * depth;
	map.width = (map.length + map[0].length)/2 * tilewidth;	
		
	// tile map is shaped as diamond with 4 corners - top, bottom, left right. 
	// let nx, ny be the top corner of the map	
	Object.defineProperty(this, "cx",
	{
		set: function(e)
		{
			cx = e;
			map.nx = cx - map.width/2.0 + map.length/2 * tilewidth;	// north corner
			map.ex = cx + map.width/2; // east corner
			map.wx = cx - map.width/2; // west corner			
		},
		get: function(){ return cx; }
	});
	
	Object.defineProperty(this, "cy",
	{
		set: function(e)
		{
			cy = e;
			map.ny = cy - map.height/2.0;	// north corner
			map.ey = cy - map.height/2.0 + map[0].length/2 * depth; // east corner
			map.wy = cy - map.height/2.0 + map.length/2 * depth; // west corner			
		},
		get: function(){ return cy; }
	});	


	
}

/*---------------------------------------------------------------------------------------------------------------------------------
tile class implementation
---------------------------------------------------------------------------------------------------------------------------------*/	
function Tile(imagefile, row, col, depth, tilewidth, base)
{
	"use strict";	

	/*------------------------------------------------------------------------
	validate arguments
	------------------------------------------------------------------------*/
	if (typeof imagefile === 'undefined'){ throw new Error("imagefiles passed is undefined"); }	
	
	/*------------------------------------------------------------------------
	set/get properties
	------------------------------------------------------------------------*/
	Object.defineProperty(this, "row", { get: function(){ return row; }});
	Object.defineProperty(this, "col", { get: function(){ return col; }});
	Object.defineProperty(this, "depth", { get: function(){ return depth; }});
	Object.defineProperty(this, "tilewidth", { get: function(){ return tilewidth; }});
	Object.defineProperty(this, "base", { get: function(){ return base; }});
	Object.defineProperty(this, "offsetheight", { get: function(){ return image.offsetheight? image.offsetheight: 0; }});
	Object.defineProperty(this, "width", { get: function(){ return image.naturalWidth? image.naturalWidth: 0; }});
	Object.defineProperty(this, "height", { get: function(){ return image.naturalHeight? image.naturalHeight: 0; }});
	
	/*------------------------------------------------------------------------
	create image object to hold our image file and 
	store tiles to its canvas array
	------------------------------------------------------------------------*/
	var image = new Image();
	image.src = imagefile;	
	image.parent = this;
	
	// calculate total depth - height from [0,0] to [n,n]
	image.totaldepth = col * depth/2 + row * depth/2;	

	// as this image file is loaded, let's create the canvas needed to render the tiles
	image.onload = function() 
	{		
		// create canvas to store the whole image. this canvas serves 2 purposes. first, it is used to draw
		// tiles if the option to draw is to use the full image and draw a portion of it. it's second purpose is 
		// to get the image data for tile selection. it is much accurate to do it this way than getting the image 
		// data from selected canvas tile because on tiled canvas there's an issue with left half side tiles
		// as it seems there's overlapping pixels to their right edge that causes to miss pixel data...
		this.canvas = document.createElement("canvas");
		if (!this.canvas){ throw new Error("Failed to create a canvas for an image object."); }
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;		
		this.canvas.getContext("2d").drawImage(this, 0, 0);		

		// measure offset height. offset height is the height from top of image to top of first tile [0,0]
		this.offsetheight = this.naturalHeight - this.totaldepth - base;

		// create an array of canvas where each tile will be stored
		this.tiles = [];
		
		for (var r = 0; r < row; r++)
		{
			// add empty row
			this.tiles.push([]);
			
			for (var c = 0; c < col; c++)
			{
				// create canvas for this tile
				var canvas = document.createElement("canvas");
				if (!canvas){ throw new Error("Failed to create a canvas for an image object."); }	
				
				// some tiles are "center tile". any tile with 'col - c = row - r' is considered center tile. 
				// a prominent center tile is the very last one [col - 1, row - 1].
				// center tiles are draw as full tile. others are drawn as half tile.
				if (col - c == row - r) canvas.width = tilewidth;
				else canvas.width = tilewidth / 2;
				
				// height starts from top of image and down to bottom of the this tile
				canvas.height = this.offsetheight + depth + r * depth/2 + c * depth/2 + base;
				
				// calculate this tile's top-left position relative to the image
				var x = (row - 1 + c - r) * tilewidth/2; 
				
				// for tiles that are drawn to the right side of center tiles, we draw only the right half side
				// shift x position by tilewidth/2
				// note that if (col - c > row - r), tiles are drawn to the right side of center tiles.
				if (col - c < row - r) x += tilewidth/2;
		
				// copy the portion of the image and draw it to this tile's canvas
				canvas.getContext("2d").drawImage(this, x, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height); 		
				
				this.tiles[r].push(canvas);
			}
		}				
		if (typeof this.parent.onload === 'function') this.parent.onload();
	}
	
	/*------------------------------------------------------------------------
	get the canvas height of the tile specified in r,c 
	canvas tile height = image.height - totaldepth - (r + c) * depth/2
	or
	tileheight = image.offsetheight + depth + base + (r + c) depth/2
	------------------------------------------------------------------------*/
	this.tileheight = function(r, c)
	{ 
		//return image.offsetheight + depth * ( 1 + (r + c) / 2 ) + base;
		return image.naturalHeight + depth * (1 + (r + c - col - row) / 2 );
	}	
	
	/*------------------------------------------------------------------------
	some canvas tiles are overlapped by others, e.g. [1,1] is overlapped by
	[2,2]. overlapped canvas tiles are hidden so we don't need to draw them.
	this function checks for that
	------------------------------------------------------------------------*/
	this.hidden = function(r, c)
	{
		if (r == row - 1){ return false; }
		if (c == col - 1){ return false; }
		return true;
	}	

	/*------------------------------------------------------------------------
	quickly draw the image for testing purposes
	------------------------------------------------------------------------*/
	this.drawImage = function(scene, x, y, tile = false, useCanvas = true)
	{
		scene.drawImage(useCanvas? image.canvas: image, x, y);
		//	scene.drawRect(x,y,image.width(),image.height(), "rgba(128,128,128,0.5)", 0);
	}
	
	/*------------------------------------------------------------------------
	test draw image in tiled format
	------------------------------------------------------------------------*/
	this.drawTiled = function(scene, x, y, useTiledCanvas = true, drawHidden = false)
	{
		var n = 0;
		for (var r = 0; r < row; r++)
		{
			for (var c = 0; c < col; c++)
			{								
				// calculate the top-left position of the current tile excluding offset height
				var tx = x + (row * tilewidth/2 - tilewidth/2) + c * tilewidth/2 - r * tilewidth/2;			
				var ty = y + r * depth/2 + c * depth/2;
				
				this.draw(scene, r, c, tx, ty, useTiledCanvas, drawHidden);
				//scene.drawText(r + ", " + c, tx, ty, "16px courier", "rgb(128,128,128, 0.5)");
				//scene.drawRect(tx, ty, tilewidth, depth, "rgba(128,128,128,0.5)", 0);
				n++;
			}
		}		
		//scene.drawRect(x,y, image.naturalWidth, image.totaldepth, "rgba(128,255,128,0.5)", 0);
		return n;
	}
	
	/*------------------------------------------------------------------------
	draw specific tile within the image
	it offsets the y-position such that the x, y is the top-left position of 
	tile excluding offset height. this is to make map engine not to worry
	tile's offset height and just assume all tiles are just depth/tilewidth 
	size
	------------------------------------------------------------------------*/
	this.draw = function(scene, r, c, x, y, useTiledCanvas = true, drawHidden = false)
	{
		if(!drawHidden){ if(this.hidden(r, c)) return; }

		if (useTiledCanvas)
		{	
			if (!image.tiles[r][c]) return;
			
			// calculate y such that the top position to draw the image is the 
			// y-position of tile excluding offset height
			y -= (image.offsetheight +  r * depth/2 + c * depth/2);
			
			// half tiles (non center tiles) that will be drawn to the right side of center 
			// tiles must be drawn at the right half side so we shift x by half tilewidth
			if (col - c < row - r) x += tilewidth/2;
						
			scene.drawImage(image.tiles[r][c], x, y);
			//scene.drawRect(x, y, image.tiles[r][c].width, image.tiles[r][c].height, "rgba(128,128,128,0.5)", 0);

			//f (typeof this.ondraw === 'function') this.ondraw({elem: this, x: x, y: y, });
		}
		else
		{
			if (!image.canvas) return;	
			
			// calculate the x,y from the image that is the top-left coordinate of the tile 
			var sx = (row - 1 + c - r) * tilewidth/2; 
			var sy = 0;
			
			// half tiles (non center tiles) that will be drawn to the right side of center 
			// tiles must be drawn at the right half side so we shift x by half tilewidth
			if (col - c < row - r)
			{ 
				sx += tilewidth/2; 
				x += tilewidth/2; 
			}
			
			// center tiles are draw as full tile. others are drawn as half tile.
			var sw = (col - c == row - r)? tilewidth : tilewidth/2;
			
			var sh = this.tileheight(r, c);		
			
			// calculate y such that the top position to draw the image is the 
			// y-position of tile excluding offset height
			y -= (image.offsetheight +  r * depth/2 + c * depth/2);
					
			scene.drawImageRegionToTarget(image.canvas, sx, sy, sw, sh, x, y, sw, sh);
			//scene.drawRect(x, y, sw, sh, "rgba(128,128,128,0.5)", 0);
			//scene.drawText(sw + ", " + sh, x, y, "16px courier", "rgb(128,128,128, 0.5)");

		}
	}	
	
	/*------------------------------------------------------------------------
	get pixel data of the specified canvas
	------------------------------------------------------------------------*/
	this.getImageData = function(x, y, w, h, r, c)
	{
		/* 	-- 	this is the original algorithm where it gets imagedata from 
				tile canvas. kinda buggy because we seem to miss a pixel on 
				left half side tile. quick and dirty solution is create a full
				image canvas and use that solely for getting image data
				
		// tiles that are on the right half side has half the width so we "shift" 
		// the x to half the width
		if (c == col - 1 && r < row - 1) x -= tilewidth/2;
		
		// do the magic...
		return image.tiles[r][c].getContext("2d").getImageData(x, y, w, h); 
		*/
		
		x += (row - 1 + c - r) * tilewidth/2; 		
		return image.canvas.getContext("2d").getImageData(x, y, w, h); 		
	} 	

}








