'use strict';

angular.module('ngWebglDemo')
  .directive('ngWebgl', function () {
    return {
      restrict: 'A',
      scope: { 
        'width': '=',
        'height': '=',
        'fillcontainer': '=',
        'scale': '=',
        'materialType': '='
      },
      link: function postLink(scope, element, attrs) {

        var camera, scene, renderer,
          shadowMesh, icosahedron, light,
          mouseX = 0, mouseY = 0,
          contW = (scope.fillcontainer) ? 
            element[0].clientWidth : scope.width,
          contH = scope.height, 
          windowHalfX = contW / 2,
          windowHalfY = contH / 2,
          materials = {};


        scope.init = function () {

          // Camera
          camera = new THREE.PerspectiveCamera( 20, contW / contH, 1, 10000 );
          camera.position.z = 1800;

          // Scene
          scene = new THREE.Scene();

          // Ligthing
          light = new THREE.DirectionalLight( 0xffffff );
          light.position.set( 0, 0, 1 );
          scene.add( light );

          // Shadow
          var canvas = document.createElement( 'canvas' );
          canvas.width = 128;
          canvas.height = 128;

          // Render a 2d gradient to use as shadow
          var context = canvas.getContext( '2d' );
          var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );

          gradient.addColorStop( 0.1, 'rgba(200,200,200,1)' );
          gradient.addColorStop( 1, 'rgba(255,255,255,1)' );

          context.fillStyle = gradient;
          context.fillRect( 0, 0, canvas.width, canvas.height );

          var shadowTexture = new THREE.Texture( canvas );
          shadowTexture.needsUpdate = true;

          var shadowMaterial = new THREE.MeshBasicMaterial( { 
            map: shadowTexture 
          } );
          var shadowGeo = new THREE.PlaneGeometry( 300, 300, 1, 1 );

          // Apply the shadow texture to a plane
          shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
          shadowMesh.position.y = - 250;
          shadowMesh.rotation.x = - Math.PI / 2;
          scene.add( shadowMesh );
          
          var faceIndices = [ 'a', 'b', 'c', 'd' ];

          var color, f, p, n, vertexIndex,
            radius = 200,
            geometry  = new THREE.IcosahedronGeometry( radius, 1 );


          for (var i = 0; i < geometry.faces.length; i ++) {

            f  = geometry.faces[ i ];

            n = ( f instanceof THREE.Face3 ) ? 3 : 4;

            for( var j = 0; j < n; j++ ) {

              vertexIndex = f[ faceIndices[ j ] ];

              p = geometry.vertices[ vertexIndex ];

              color = new THREE.Color( 0xffffff );
              color.setHSL( 0.125 * vertexIndex/geometry.vertices.length, 1.0, 0.5 );

              f.vertexColors[ j ] = color;

            }

          }

          materials.lambert = new THREE.MeshLambertMaterial({ 
            color: 0xffffff, 
            shading: THREE.FlatShading, 
            vertexColors: THREE.VertexColors 
          });

          materials.phong = new THREE.MeshPhongMaterial({ 
            ambient: 0x030303, 
            color: 0xdddddd, 
            specular: 0x009900, 
            shininess: 30, 
            shading: THREE.FlatShading, 
            vertexColors: THREE.VertexColors  
          });

          materials.wireframe = new THREE.MeshBasicMaterial({ 
            color: 0x000000, 
            shading: THREE.FlatShading, 
            wireframe: true, 
            transparent: true });

          // Build and add the icosahedron to the scene
          icosahedron = new THREE.Mesh( geometry, materials[scope.materialType] );
          icosahedron.position.x = 0;
          icosahedron.rotation.x = 0;
          scene.add( icosahedron );

          renderer = new THREE.WebGLRenderer( { antialias: true } );
          renderer.setClearColor( 0xffffff );
          renderer.setSize( contW, contH );

          // element is provided by the angular directive
          element[0].appendChild( renderer.domElement );

          document.addEventListener( 'mousemove', scope.onDocumentMouseMove, false );

          window.addEventListener( 'resize', scope.onWindowResize, false );

        };

        // -----------------------------------
        // Event listeners
        // -----------------------------------
        scope.onWindowResize = function () {

          scope.resizeCanvas();

        };

        scope.onDocumentMouseMove = function ( event ) {

          mouseX = ( event.clientX - windowHalfX );
          mouseY = ( event.clientY - windowHalfY );

        };

        // -----------------------------------
        // Updates
        // -----------------------------------
        scope.resizeCanvas = function () {

          contW = (scope.fillcontainer) ? 
            element[0].clientWidth : scope.width;
          contH = scope.height;

          windowHalfX = contW / 2;
          windowHalfY = contH / 2;

          camera.aspect = contW / contH;
          camera.updateProjectionMatrix();

          renderer.setSize( contW, contH );

        };

        scope.resizeObject = function () {

          icosahedron.scale.set(scope.scale, scope.scale, scope.scale);
          shadowMesh.scale.set(scope.scale, scope.scale, scope.scale);

        };

        scope.changeMaterial = function () {

          icosahedron.material = materials[scope.materialType];

        };


        // -----------------------------------
        // Draw and Animate
        // -----------------------------------
        scope.animate = function () {

          requestAnimationFrame( scope.animate );

          scope.render();

        };

        scope.render = function () {

          camera.position.x += ( mouseX - camera.position.x ) * 0.05;
          // camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

          camera.lookAt( scene.position );

          renderer.render( scene, camera );

        };

        // -----------------------------------
        // Watches
        // -----------------------------------
        scope.$watch('fillcontainer + width + height', function () {

          scope.resizeCanvas();
        
        });

        scope.$watch('scale', function () {
        
          scope.resizeObject();
        
        });

        scope.$watch('materialType', function () {
        
          scope.changeMaterial();
        
        });

        // Begin
        scope.init();
        scope.animate();

      }
    };
  });
