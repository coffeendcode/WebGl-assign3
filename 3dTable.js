"use strict";

var gl;

var canvas;

var shaderProgram;

var floorVertexPositionBuffer;

var floorVertexIndexBuffer;

var cubeVertexPositionBuffer;

var cubeVertexIndexBuffer;



var modelViewMatrix;

var projectionMatrix;

var modelViewMatrixStack;

//Rotation Variables
var axis = 0;

var xAxis = 0;

var yAxis =1;

var zAxis = 2;

var theta = [ 0, 0, 0 ];

var thetaLoc;

var modelView;



window.onload = function init()

{

  canvas = document.getElementById( "gl-canvas" );

  gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));

  setupShaders();

  setupBuffers();

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  
  //buttons
  document.getElementById( "xButton" ).onclick = function () {

      axis = xAxis;

  };

  document.getElementById( "yButton" ).onclick = function () {

      axis = yAxis;

  };

  document.getElementById( "zButton" ).onclick = function () {

      axis = zAxis;

  };



  draw();

}



function createGLContext(canvas) {

  var names = ["webgl", "experimental-webgl"];

  var context = null;

  for (var i=0; i < names.length; i++) {

    try {

      context = canvas.getContext(names[i]);

    } catch(e) {}

    if (context) {

      break;

    }

  }

  if (context) {

    context.viewportWidth = canvas.width;

    context.viewportHeight = canvas.height;

  } else {

    alert("Failed to create WebGL context!");

  }

  return context;

}





function setupShaders() {

  //

  //  Load shaders and initialize attribute buffers

  //

  shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );

  gl.useProgram( shaderProgram );



  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");

  shaderProgram.uniformMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");

  shaderProgram.uniformProjMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");



  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);



  modelViewMatrix = mat4.create();

  projectionMatrix = mat4.create();

  modelViewMatrixStack = [];

}





function setupCubeBuffers() {

  cubeVertexPositionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);



  var cubeVertexPosition = [

       // Front face

       1.0,  1.0,  1.0, //v0

      -1.0,  1.0,  1.0, //v1

      -1.0, -1.0,  1.0, //v2

       1.0, -1.0,  1.0, //v3



       // Back face

       1.0,  1.0, -1.0, //v4

      -1.0,  1.0, -1.0, //v5

      -1.0, -1.0, -1.0, //v6

       1.0, -1.0, -1.0, //v7



       // Left face

      -1.0,  1.0,  1.0, //v8

      -1.0,  1.0, -1.0, //v9

      -1.0, -1.0, -1.0, //v10

      -1.0, -1.0,  1.0, //v11



       // Right face

       1.0,  1.0,  1.0, //12

       1.0, -1.0,  1.0, //13

       1.0, -1.0, -1.0, //14

       1.0,  1.0, -1.0, //15



        // Top face

        1.0,  1.0,  1.0, //v16

        1.0,  1.0, -1.0, //v17

       -1.0,  1.0, -1.0, //v18

       -1.0,  1.0,  1.0, //v19



        // Bottom face

        1.0, -1.0,  1.0, //v20

        1.0, -1.0, -1.0, //v21

       -1.0, -1.0, -1.0, //v22

       -1.0, -1.0,  1.0, //v23

  ];



  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition),

                gl.STATIC_DRAW);

  cubeVertexPositionBuffer.itemSize = 3;

  cubeVertexPositionBuffer.numberOfItems = 24;



  cubeVertexIndexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  var cubeVertexIndices = [

            0, 1, 2,      0, 2, 3,    // Front face

            4, 6, 5,      4, 7, 6,    // Back face

            8, 9, 10,     8, 10, 11,  // Left face

            12, 13, 14,   12, 14, 15, // Right face

            16, 17, 18,   16, 18, 19, // Top face

            20, 22, 21,   20, 23, 22  // Bottom face

        ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),

                gl.STATIC_DRAW);

  cubeVertexIndexBuffer.itemSize = 1;

  cubeVertexIndexBuffer.numberOfItems = 36;
  
  thetaLoc = gl.getUniformLocation(shaderProgram, "theta");

}





function setupBuffers() {

  setupCubeBuffers();

}



function uploadModelViewMatrixToShader() {

  //upload your transformation matrices to the GPU before they can be used to do any transformations in the vertex shader

  //the second argument specifies whether you want to transpose the columns that are uploaded

  gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false, modelViewMatrix);

}



function uploadProjectionMatrixToShader() {

  gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix,false, projectionMatrix);

}





function drawCube(r,g,b,a) {

  // Disable vertex attrib array and use constant color for the cube.

  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

  // Set color

  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);



  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,

                         cubeVertexPositionBuffer.itemSize,

                         gl.FLOAT, false, 0, 0);



  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);



  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems,

                  gl.UNSIGNED_SHORT, 0);



}





function draw() {

	var newRotationMatrix = mat4.create();
	mat4.identity(newRotationMatrix);
	var now;
	var then = 0;
	
	now *= 0.001;
	
	var deltaTime = now - then;
	then = now;

	
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //ma4.perpective(fovy,aspect ratio, near, far, projectionMatrix);

  //field of view of 70 degrees, a near plane 0.1 units in front of the viewer and a far plane of 100 units from the viewer

	mat4.perspective(70, gl.viewportWidth / gl.viewportHeight,

                   0.1, 100.0, projectionMatrix);

	mat4.identity(modelViewMatrix); //load the identity matrix to modelViewMatrix


	//View
	mat4.lookAt([-5, 0, -7],[0, 0, 0], [0, 1,0], modelViewMatrix);





	// Draw tableTop

	mat4.translate(modelViewMatrix, [0.0, -1.7 ,0.0], modelViewMatrix);

	mat4.scale(modelViewMatrix, [1.5, 0.1, 1.5], modelViewMatrix);



	uploadModelViewMatrixToShader();

	uploadProjectionMatrixToShader();



	drawCube(0.6, 0.2, 0, 1.0);
  
  
	mat4.translate(modelViewMatrix, [-0.9, -7 ,-0.9], modelViewMatrix);
	mat4.scale(modelViewMatrix, [0.1, -8, -0.1], modelViewMatrix);
   
   
	   
	//First leg
	mat4.translate(modelViewMatrix, [0, 0 ,0], modelViewMatrix);
	
	uploadModelViewMatrixToShader();
	uploadProjectionMatrixToShader();

	drawCube(0.6, 0.2, 0, 1.0);
	
	//Second leg
	mat4.translate(modelViewMatrix, [18, 0 ,0], modelViewMatrix);


	uploadModelViewMatrixToShader();
	uploadProjectionMatrixToShader();

	drawCube(0.6, 0.2, 0, 1.0);
	
	//Third leg
	mat4.translate(modelViewMatrix, [0, 0 ,-18], modelViewMatrix);


	uploadModelViewMatrixToShader();
	uploadProjectionMatrixToShader();

	drawCube(0.6, 0.2, 0, 1.0);
	
	//Fourth Leg
	mat4.translate(modelViewMatrix, [-18, 0 ,0], modelViewMatrix);


	uploadModelViewMatrixToShader();
	uploadProjectionMatrixToShader();

	drawCube(0.6, 0.2, 0, 1.0);
	
	//Floor
	mat4.translate(modelViewMatrix, [10,1.1,7], modelViewMatrix);
	mat4.scale(modelViewMatrix, [18, 0.1,-18], modelViewMatrix);

	uploadModelViewMatrixToShader();
	uploadProjectionMatrixToShader();

	drawCube(0.2, 1.0, 0.3, 1.0);
	
	//Cube
	mat4.translate(modelViewMatrix, [0,-24,0], modelViewMatrix);
	mat4.scale(modelViewMatrix, [-0.1,4,-0.1], modelViewMatrix);
	mat4.rotate(modelViewMatrix, deltaTime, [1,0,0,0]);
	
	uploadModelViewMatrixToShader();
	uploadProjectionMatrixToShader();

	drawCube(0.6, 1.0, 0.9, 1.0);
    
	
	
	//Animate
	requestAnimationFrame( draw );
	

}