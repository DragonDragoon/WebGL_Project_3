// RotatedTriangle_Matrix4.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// The rotation angle
var ANGLES = [
  90.0, 45.0, 22.5, 11.25
];

// Hold the color data for each triangle
var C = [
  new Float32Array([1.0, 0.0, 0.0, 1.0]),
  new Float32Array([0.0, 1.0, 0.0, 1.0]),
  new Float32Array([0.0, 0.0, 1.0, 1.0]),
  new Float32Array([0.5, 0.5, 0.5, 1.0])
];

// Hold the raw vertices
var _vertices = [];
var _n = 0; // The number of vertices

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

  for (var i = 0; i < ANGLES.length; i++) {
    // Push new vertices (triangle)
    _vertices.push(
      0, 0.5,   -0.5, -0.5,   0.5, -0.5
    );
    _n = _n + 3; // The number of vertices
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Create Matrix4 object for the rotation matrix
  var xformMatrix = new Matrix4();

  // Pass the rotation matrix to the vertex shader
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
    return;
  }

  // Pass the color vector
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Hold current triangle number
  var currentTriangle = 0;
  for (var i = 0; i < ANGLES.length; i++) {
    // Set the rotation matrix
    var ANGLE = ANGLES[i]; // The rotation angle
    xformMatrix.setRotate(ANGLE, 0, 0, 1);

    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

    // Set color of triangle
    gl.uniform4fv(u_FragColor, C[i]);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, currentTriangle, 3);

    // Go to next triangle in vertex array
    currentTriangle += 3;
  }
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array(_vertices);
  var n = _n; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

