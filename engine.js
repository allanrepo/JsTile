var engine = engine || 
{
    r: 5,
    font: "verdana"
};

/* ---------------------------------------------------------------------------------------------
more like entry point of the engine. 
when this object is created, engine gets a reference to scene
all other ui objects need this root object to operate. 
--------------------------------------------------------------------------------------------- */
engine.ui = function(scene)
{
    var ui = new root(scene, "root");
    engine.scene = scene;

    ui.addEventListener("draw", function(e)
    {
        engine.scene.globalAlpha = 1;
        engine.scene.shadowBlur = 0;
        engine.scene.drawRect(0, 0, e.w, e.h, "", "rgba(128,128,128,1)");
    });	     
    return ui;
}

/* ---------------------------------------------------------------------------------------------
typical frame ui but wrapped for convenience of drawing
--------------------------------------------------------------------------------------------- */
engine.frame = function(parent, name, x, y, w, h, sx, xy)
{
    var f = new frame(parent, name, x, y, w, h, true, true, false);
    f.addEventListener("draw", engine.onDrawFrame);	   
    return f;
}

/* ---------------------------------------------------------------------------------------------
also known as radio button, it's a toggle switch.
built from frame ui with fancy built-in drawing event handler 
--------------------------------------------------------------------------------------------- */
engine.switch = function(parent, name, x, y, d, text)
{
    var s = new frame(parent, name, x, y, d, d, false, false, false);
    s.addEventListener("draw", engine.onDrawSwitch);	     
    s.addEventListener("mouseup", function(e){ e.elem.value = !e.elem.value; });	     
    s.value = false;
    s.text = text;
    return s;
}

/* ---------------------------------------------------------------------------------------------
typical ui button built from frame ui. added fancy text with alignment properties
--------------------------------------------------------------------------------------------- */
engine.button = function(parent, name, x, y, w, h, text)
{
    var b = new frame(parent, name, x, y, w, h, false, false, false);
    b.addEventListener("draw", engine.onDrawButton);	     
    b.text = text;
    b.state = 0;
    b.addEventListener("mousemove", function(e){ e.elem.state = 1; });
    b.addEventListener("mouseleave", function(e){ e.elem.state = 0; });
    b.addEventListener("mousedown", function(e){ e.elem.state = 2; });    
    b.addEventListener("mouseup", function(e){ e.elem.state = 1; });    
    return b;
}

/* ---------------------------------------------------------------------------------------------
slider wrapped into fancy drawing event handlers
--------------------------------------------------------------------------------------------- */
engine.slider = function(   parent, 
                            name, 
                            v, // true if orientation is vertical, horizontal if not.
                            x, y, // 
                            l, t, // length and thickness. dynamically sets width and height base on orientation
                            min, max,
                            )
{
    var s = new slider(parent, name, v, x, y, v? t:l, v? l:t, t, min, max);
    s.addEventListener("draw", function(e)
    { 
        var ll = (l - t) * (e.value - e.min) / (e.max - e.min ) + t/2; 
        var lr = l - ll;

        engine.scene.shadowBlur = 0;
        engine.scene.drawRoundedRectangle(  e.x + (v? (e.w/2 - e.w/4):0),
                                            e.y + (v? 0:(e.h/2 - e.h/4)), 
                                            v? e.w/2 : ll, v? ll:e.h/2 , 
                                            //e.w/(v?2:1), e.h/(v?1:2), 
                                            t/4, 
                                            "rgba(192, 192, 192, 1)", "rgba(192, 192, 192, 1)"); 

        engine.scene.drawRoundedRectangle(  e.x + (v? (e.w/2 - e.w/4):0) + (v?0:ll),
                                            e.y + (v? 0:(e.h/2 - e.h/4)) + (v?ll:0), 
                                            v? e.w/2 : lr, v? lr:e.h/2 , 
                                            t/4, 
                                            "rgba(144, 144, 144, 1)", "rgba(144, 144, 144, 1)"); 

    });	     
    
    s.addEventListener("drawthumb", function(e)
    { 
        engine.scene.shadowBlur = 0;
        engine.scene.drawRoundedRectangle( e.x, e.y, e.w, e.h, e.w/2, "", "rgba(255, 255, 255, 1)"); 
    });	    
    
    return s;
}

/* ---------------------------------------------------------------------------------------------
draw frame box
--------------------------------------------------------------------------------------------- */
engine.onDrawFrame = function(e)
{
    engine.scene.shadowColor = "black";
    engine.scene.shadowBlur = 10;
    engine.scene.drawRoundedRectangle(e.x, e.y, e.w, e.h, engine.r, "", "rgba(192, 192, 192, 0.5)");
}

/* ---------------------------------------------------------------------------------------------
draw radio button like switch with text to its right side
--------------------------------------------------------------------------------------------- */
engine.onDrawSwitch = function(e)
{
    // radio button is always flat so now shadow
    engine.scene.shadowBlur = 0;

    // draw the radio button
    engine.scene.drawCircle(e.x + e.h/2, e.y + e.h/2, e.h/2,  "rgba(64, 64, 64, 1)",  "rgba(64, 64, 64, 1)");
    engine.scene.drawCircle(e.x + e.h/2, e.y + e.h/2, e.h/2 - 4,  "rgba(192, 192, 192, 1)",  "rgba(192, 192, 192, 1)");
    if (e.elem.value) engine.scene.drawCircle(e.x + e.h/2, e.y + e.h/2, e.h/2 - 6,  "rgba(64, 64, 64, 1)",  "rgba(64, 64, 64, 1)");

    // write the corresponding text
    //engine.scene.draw1Text(e.elem.text, e.x + e.h + 10, e.y - (e.h - e.h)/2, e.h + "px " + engine.font, "rgb(255,255,255)");
    engine.scene.drawText(e.elem.text, e.x + e.h + 10, e.y - (e.h - e.h)/2, 0, 0, e.h, engine.font, "rgb(255,255,255)");
}

/* ---------------------------------------------------------------------------------------------
draw button with text
--------------------------------------------------------------------------------------------- */
engine.onDrawButton = function(e)
{
    // set draw parameters
    engine.scene.shadowBlur = 5;

    // button's offset position when pressed
    var d = 1;    

    // let's set a font height that is half the button's height
    var h = e.h / 2;

    // measure the width of the text so we can center align as well as clip if necessary.
    var w = engine.scene.getTextWidth(e.elem.text, h + "px " + engine.font);

    // boundary between button's area and area where text can be drawn inside the button
    var b = 12;

    // let's draw the rectangle that fills the button
    engine.scene.drawRoundedRectangle(  e.x + (e.elem.state == 2? d: 0), 
                                        e.y + (e.elem.state == 2? d: 0), 
                                        e.w, e.h, engine.r, 
                                        "", "rgba(192, 192, 192, " + (e.elem.state >0? 0.7: 0.5)  + ")");    
    // draw the text
    engine.scene.drawText(  e.elem.text, 
                            e.x + (e.elem.state == 2? d: 0) + b, 
                            e.y + (e.elem.state == 2? d: 0) + h/2, 
                            e.w - b*2, h, h, engine.font, 'rgb(255, 255, 255)', 'center', 'center', true);
}






