/*-----------------------------------------------------------------------------------
action items:
- 	set scene as one of arguments to constructor and use it to draw
-----------------------------------------------------------------------------------*/

/*
action items:
-	use scene's draw() functions to draw images as scene.useCanvas() will be removed
	and there won't be access to scene's canvas object anymore. make sure to test it
*/
	
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
function sprites(fileNamePath, width, height)
{
	// load the sprite sheet into sprite object
	var m_sprite = new sprite(fileNamePath);		
		
	// allow sprites class to handle onload event for this sprite object
	m_sprite.parent = this;
	m_sprite.onload = function(){ if (this.parent.onload) this.parent.onload(); }		
	
	this.drawFrame = function(elem, x, y, index, useCanvas)
	{		
		// calculate how many frames can fit within the image's width
		var framesPerRow = Math.floor(m_sprite.width() / width); 

		// calculate the top-left coordinate in the image where this frame to be drawn is located
		var sx = (index % framesPerRow) * width;
		var sy = Math.floor(index/framesPerRow) * height;
		
		// draw 
		m_sprite.drawRegionToTarget(elem, sx, sy, width, height, x, y, width, height, useCanvas); 
	}		
	
	// draw the whole image
	this.draw = function(elem, x, y, useCanvas)
	{				
		// draw with option to draw canvas or direct image
		m_sprite.draw(elem, x, y, useCanvas);
	}		
		
}