var canvas=document.querySelector("canvas");
var ctx=canvas.getContext('2d');
var BB=canvas.getBoundingClientRect();
canvas.width=1000;
canvas.height=500;
var offsetX=BB.left;
var offsetY=BB.top;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

// drag related variables
var dragok = false;
var dragcreate;
var startX;
var startY;
var snapshot;
// an array of objects that define different shapes
var shapes=[];


// listen for mouse events
document.getElementById("clear").addEventListener("click", function(){
    clear();
    shapes=[];
  });
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;

canvas.ondblclick = deleteTriangle;


// call to draw the scene
draw();

// draw a single triangle
function triangle(r) { 
  ctx.beginPath();
  ctx.moveTo(r.x1, r.y1);
  ctx.lineTo(r.x2, r.y2);
  ctx.lineTo(r.x3, r.y3);
  ctx.closePath();
  ctx.stroke();
  console.log(r.fill);
  ctx.fillStyle=r.fill;
  ctx.fill();
}


// clear the canvas
function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// redraw the scene
function draw() {
  clear();
  for(var i=0;i<shapes.length;i++)
    triangle(shapes[i]);
}

//handle double click events
function deleteTriangle(e){
    e.preventDefault();
    e.stopPropagation();
  // get the current mouse position
    var mx=parseInt(e.clientX-offsetX);
    var my=parseInt(e.clientY-offsetY);
    for(var i=shapes.length-1;i>=0;i--){
        var s=shapes[i];            
      // test if the mouse is inside this triangle
      if(pointInTriangle(s.x1, s.y1, s.x2, s.y2, s.x3, s.y3, mx, my)){
        // if yes, remove that element from the array
            shapes.splice(i, 1);
            draw();
            break;
      }
    }
}




function takeSnapshot() {
    snapshot = ctx.getImageData(0, 0, WIDTH, HEIGHT); //take snapshot so that same element can be redrawn
}

function restoreSnapshot() {
    ctx.putImageData(snapshot, 0, 0);
}




// handle mousedown events
function myDown(e){

  // tell the browser we're handling this mouse event
  e.preventDefault();
  e.stopPropagation();
  // get the current mouse position
  var mx=parseInt(e.clientX-offsetX);
  var my=parseInt(e.clientY-offsetY);

  // test each shape to see if mouse is inside
  dragok=false;
  for(var i=shapes.length-1;i>=0;i--){
    var s=shapes[i];            
      // test if the mouse is inside this triangle
    if(pointInTriangle(s.x1, s.y1, s.x2, s.y2, s.x3, s.y3, mx, my)){
        dragok=true;
        s.isDragging=true;
        canvas.onmousemove = myMove;
        break
        }
    }
    if (dragok==false){
        takeSnapshot();
        dragcreate=true;
        canvas.onmousemove = shapeMove;
    }
  // save the current mouse position
  startX=mx;
  startY=my;
}


// barycentric coordinate system
function pointInTriangle(x1, y1, x2, y2, x3, y3, x, y){
 var denominator = ((y2 - y3)*(x1 - x3) + (x3 - x2)*(y1 - y3));
 var a = ((y2 - y3)*(x - x3) + (x3 - x2)*(y - y3)) / denominator;
 var b = ((y3 - y1)*(x - x3) + (x1 - x3)*(y - y3)) / denominator;
 var c= 1 - a - b;
 
 return 0 <= a && a <= 1 && 0 <= b && b <= 1 && 0 <= c && c <= 1;
}


function shapeMove(e){  //function for moving the shape while creating
    if(dragcreate==true){
    restoreSnapshot();
    var mx=parseInt(e.clientX-offsetX);
    var my=parseInt(e.clientY-offsetY);
    ctx.beginPath();
    // ctx.moveTo(startX+ (mx-startX)/2, startY+ (my-startY)/2);
    // ctx.lineTo(startX, my)
    // ctx.lineTo(mx, my);
    ctx.moveTo(startX,startY);
    ctx.lineTo(mx, my);
    ctx.lineTo(startX - (mx-startX),my);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle="black";
    ctx.fill();
    }
}



function myUp(e){
  // tell the browser we're handling this mouse event
  e.preventDefault();
  e.stopPropagation();

  dragcreate=false;
  if(dragok == false)
    {
    color='#'+Math.random().toString(16).substr(-6);  //get a random hexadecimal value
    var mx=parseInt(e.clientX-offsetX);   //get current position
    var my=parseInt(e.clientY-offsetY);
    var nx=startX+ (mx-startX)/2;     //calculate third coordinate for the triangle
    var ny=startY+ (my-startY)/2;
    //shapes.push({x1:nx, y1:ny, x2:mx, y2:my, x3:startX, y3:my, fill:color, isDragging:false});
    shapes.push({x1:startX,y1:startY,x2:mx,y2:my,x3:startX-(mx-startX),y3:my,fill:color, isDragging:false});
    draw();
    }

  // clear all the dragging flags
  dragok = false;
  for(var i=0;i<shapes.length;i++){
    shapes[i].isDragging=false;
  }
}


// handle mouse moves
function myMove(e){
    
  // if we're dragging anything...
  if (dragok){
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx=parseInt(e.clientX-offsetX);
    var my=parseInt(e.clientY-offsetY);

    // calculate the distance the mouse has moved
    // since the last mousemove
    var dx=mx-startX;
    var dy=my-startY;

    // move each triangle that isDragging 
    // by the distance the mouse has moved
    // since the last mousemove
    for(var i=0;i<shapes.length;i++){
      var s=shapes[i];
      if(s.isDragging){
        s.x1+=dx;
        s.y1+=dy;
        s.x2+=dx;
        s.y2+=dy;
        s.x3+=dx;
        s.y3+=dy
      }
    }

    // redraw the scene with the new triangle positions
    draw();

    // reset the starting mouse position for the next mousemove
    startX=mx;
    startY=my;

  }

}