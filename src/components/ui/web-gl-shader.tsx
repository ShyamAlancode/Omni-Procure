"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

// Mix of the Comet + Cloud shader combined with the Rainbow distortion shader mathematically
export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.OrthographicCamera | null
    renderer: THREE.WebGLRenderer | null
    mesh: THREE.Mesh | null
    uniforms: any
    animationId: number | null
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const { current: refs } = sceneRef

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    // By enforcing WebGL 1.0 compliance instead of WebGL 2.0 (version 300 es), 
    // it perfectly injects into our React ecosystem safely. 
    // We combine the visual attributes of the clouds and comets with the distoring rainbow
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      #define FC gl_FragCoord.xy
      #define T time
      #define R resolution
      #define MN min(R.x,R.y)

      float rnd(vec2 p) {
        p=fract(p*vec2(12.9898,78.233));
        p+=dot(p,p+34.56);
        return fract(p.x*p.y);
      }

      float noise(in vec2 p) {
        vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
        float a=rnd(i), b=rnd(i+vec2(1.0,0.0)), c=rnd(i+vec2(0.0,1.0)), d=rnd(i+1.0);
        return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
      }

      float fbm(vec2 p) {
        float t=0.0, a=1.0; 
        mat2 m=mat2(1.0,-0.5,0.2,1.2);
        for (int i=0; i<5; i++) {
          t+=a*noise(p);
          p*=2.0*m;
          a*=0.5;
        }
        return t;
      }

      float clouds(vec2 p) {
        float d=1.0, t=0.0;
        for (int i=0; i<3; i++) {
          float fi = float(i);
          float a=d*fbm(fi*10.0+p.x*0.2+0.2*(1.0+fi)*p.y+d+fi*fi+p);
          t=mix(t,d,a);
          d=a;
          p*=2.0/(fi+1.0);
        }
        return t;
      }

      void main() {
        // --- 1. COMET / CLOUD SHADER LOGIC ---
        vec2 uv=(FC-0.5*R)/MN;
        vec2 st=uv*vec2(2.0,1.0);
        vec3 col=vec3(0.0);
        float bg=clouds(vec2(st.x+T*0.5,-st.y));
        uv*=1.0-0.3*(sin(T*0.2)*0.5+0.5);
        
        for (int i=1; i<12; i++) {
          float fi = float(i);
          uv+=0.1*cos(fi*vec2(0.1+0.01*fi, 0.8)+fi*fi+T*0.5+0.1*uv.x);
          vec2 p_cloud=uv;
          float d_cloud=length(p_cloud);
          col+=0.00125/d_cloud*(cos(sin(fi)*vec3(1.0,2.0,3.0))+1.0);
          float b=noise(fi+p_cloud+bg*1.731);
          col+=0.002*b/length(max(p_cloud,vec2(b*p_cloud.x*0.02,p_cloud.y)));
          col=mix(col,vec3(bg*0.25,bg*0.137,bg*0.05),d_cloud);
        }

        // --- 2. RAINBOW DISTORTION FLOW LOGIC ---
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b2 = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        vec3 rainbow = vec3(r, g, b2);

        // --- 3. MIX THEM ---
        // Add the rainbow with an intensity multiplier over the comets
        gl_FragColor = vec4(col + (rainbow * 0.9), 1.0);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
      refs.renderer.setPixelRatio(window.devicePixelRatio)
      refs.renderer.setClearColor(new THREE.Color(0x000000), 1)

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.05 },
      }

      const position = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()
    }

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const width = window.innerWidth
      const height = window.innerHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()
        }
      }
      refs.renderer?.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block touch-none"
    />
  )
}