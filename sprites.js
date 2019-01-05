/*-----------------------------------------------------------------------------------

completed	
-	capitalize first character so it is now 'Scene'. reason is we want to 
	standardize classes to be starting with capital letter

-----------------------------------------------------------------------------------*/


	
/*////////////////////////////////////////////////////////////////////////////////////////////////
 sprites (sprite sheet) class 

fileNamePath
- 	image file source with full path and file name
- 	may contain a single or multiple frames of an animated image arranged this way:
	[0,1,2,]
	[3,4,5,]
	[6,7,8,]
	where 0 is the first frame and 8 is the last

width, height
- frame size

////////////////////////////////////////////////////////////////////////////////////////////////*/
function Sprites(fileNamePath, width, height)
{
	// load the sprite sheet into sprite object
	var sprite = new Sprite(fileNamePath);		
		
	// allow sprites class to handle onload event for this sprite object
	sprite.parent = this;
	sprite.onload = function(){ if (this.parent.onload) this.parent.onload(); }		
	
	this.drawFrame = function(elem, x, y, index, useCanvas)
	{		
		// calculate how many frames can fit within the image's width
		var framesPerRow = Math.floor(sprite.width() / width); 

		// calculate the top-left coordinate in the image where this frame to be drawn is located
		var sx = (index % framesPerRow) * width;
		var sy = Math.floor(index/framesPerRow) * height;
		
		// draw 
		sprite.drawRegionToTarget(elem, sx, sy, width, height, x, y, width, height, useCanvas); 
	}		
	
	// draw the whole image
	this.draw = function(elem, x, y, useCanvas)
	{				
		// draw with option to draw canvas or direct image
		sprite.draw(elem, x, y, useCanvas);
	}		
		
}