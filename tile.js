/*---------------------------------------------------------------------------------------------------------------------------------
tile image/resource documentation/definition
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
                    0       0   0
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
				
multi-tile
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
function map()
{
	
}

/*---------------------------------------------------------------------------------------------------------------------------------
tile class implementation
---------------------------------------------------------------------------------------------------------------------------------*/	
function tile(imagefile, nrow, ncol, depth, width, base)
{
	
}