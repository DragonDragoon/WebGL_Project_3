// RotatingTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Rotation angle (degrees/second)
var ANGLE_STEP = 45.0;

// Hold the color data for each triangle
var C = [
  new Float32Array([1.0, 0.0, 0.0, 1.0]),
  new Float32Array([0.0, 1.0, 0.0, 1.0]),
  new Float32Array([0.0, 0.0, 1.0, 1.0]),
  new Float32Array([0.5, 0.5, 0.5, 1.0])
];

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Pass the color vector
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Current rotation angle
  var currentAngle = 0.0;

  // Current color
  var currentColor = C[0];

  // Model matrix
  var modelMatrix = new Matrix4();

  // Start drawing
  var tick = function() {
    var animationData = animate(currentAngle);  // Update the animation data
    currentAngle = animationData.angle; // Update roatation angle from animation data
    currentColor = animationData.color; // Update the color from animation data
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, currentColor, u_FragColor);   // Draw the triangle
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  tick();
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array ([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3;   // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, currentColor, u_FragColor) {
  // Set the rotation matrix
  modelMatrix.setRotate(currentAngle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)
 
  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set color of triangle
  gl.uniform4fv(u_FragColor, currentColor);

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle;
  if (angle >= 180 && angle <= 360) {
    newAngle = angle + (2 * ANGLE_STEP * elapsed) / 1000.0;
  } else {
    newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  }

  // Update the current color by rotation
  var newColor;
  if (angle >= 0 && angle < 90) {
    newColor = C[0];
  } else if (angle >= 90 && angle < 180) {
    newColor = C[1];
  } else if (angle >= 180 && angle < 270) {
    newColor = C[2];
  } else {
    newColor = C[3];
  }

  // Return animation data
  return {
    "angle": newAngle %= 360, 
    "color": newColor
  };
}
