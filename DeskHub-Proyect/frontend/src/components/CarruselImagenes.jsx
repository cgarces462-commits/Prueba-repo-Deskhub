import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { IconChevronLeft, IconChevronRight, IconX } from './Icons';
import { imagenesDeEspacio } from '../utils/imagenes';

const VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = `
  uniform sampler2D map;
  uniform vec2 center;
  uniform float strength;
  uniform vec2 uvOffset;
  uniform vec2 uvScale;
  varying vec2 vUv;

  float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
  }

  void main() {
    vec2 tUv = vUv * uvScale + uvOffset;
    if (abs(strength) > 0.001) {
      vec4 color = vec4(0.0);
      float total = 0.0;
      vec2 toCenter = center * uvScale + uvOffset - tUv;
      float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

      for (float t = 0.0; t <= 20.0; t++) {
        float percent = (t + offset) / 20.0;
        float weight = 2.0 * (percent - percent * percent);
        vec4 texel = texture2D(map, tUv + toCenter * percent * strength);

        texel.rgb *= texel.a;
        color += texel * weight;
        total += weight;
      }

      gl_FragColor = color / total;

      gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
      gl_FragColor.a = 1.0 - abs(strength);
    } else {
      gl_FragColor = texture2D(map, tUv);
    }
  }
`;

export default function CarruselImagenes({ espacio, onCerrar }) {
  const canvasRef = useRef(null);
  const controlesRef = useRef({ next: () => {}, prev: () => {} });
  const cerrarRef = useRef(onCerrar);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    cerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !espacio) return undefined;

    const imagenes = imagenesDeEspacio(espacio);
    let cancelado = false;
    let loops = [];
    let texturas = [];
    let imagen;
    const center = new THREE.Vector2(0.5, 0.5);
    let indiceActual = 0;
    let indiceSiguiente = null;
    let enTransicion = false;
    let transicion = 0;
    let texturaCambiada = false;
    let ruedaAcumulada = 0;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0f172a, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    function medidas() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      camera.left = -aspect / 2;
      camera.right = aspect / 2;
      camera.top = 0.5;
      camera.bottom = -0.5;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      return { wWorld: aspect, hWorld: 1, ratio: aspect };
    }

    function crearZoomBlur() {
      const uniforms = {
        map: { value: null },
        center: { value: new THREE.Vector2(0.5, 0.5) },
        strength: { value: -1 },
        uvOffset: { value: new THREE.Vector2(0, 0) },
        uvScale: { value: new THREE.Vector2(1, 1) },
      };

      const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
      const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      return {
        mesh,
        uniforms,
        setMap(tex) {
          uniforms.map.value = tex;
          redimensionar();
        },
        redimensionar,
        dispose() {
          scene.remove(mesh);
          geometry.dispose();
          material.dispose();
          if (uniforms.map.value) uniforms.map.value.dispose();
        },
      };
    }

    function redimensionar() {
      const { wWorld, ratio } = medidas();
      const escalar = (a, uMap) => {
        if (!a) return;
        a.mesh.scale.set(wWorld, 1, 1);
        const img = uMap?.image;
        const iRatio = img && img.width && img.height ? img.width / img.height : 1.6;
        a.uniforms.uvOffset.value.set(0, 0);
        a.uniforms.uvScale.value.set(1, 1);
        if (iRatio > ratio) {
          a.uniforms.uvScale.value.x = ratio / iRatio;
          a.uniforms.uvOffset.value.x = (1 - a.uniforms.uvScale.value.x) / 2;
        } else {
          a.uniforms.uvScale.value.y = iRatio / ratio;
          a.uniforms.uvOffset.value.y = (1 - a.uniforms.uvScale.value.y) / 2;
        }
      };
      escalar(imagen, imagen?.uniforms.map.value);
    }

    function onResize() {
      if (cancelado) return;
      redimensionar();
    }

    function setStrength(v) {
      if (imagen?.uniforms.strength) imagen.uniforms.strength.value = v;
    }

    function iniciarTransicion(pasos) {
      if (enTransicion || pasos === 0 || texturas.length < 2) return;
      const n = texturas.length;
      const destino = (((indiceActual + pasos) % n) + n) % n;
      if (destino === indiceActual) return;

      indiceSiguiente = destino;
      enTransicion = true;
      transicion = 0;
      texturaCambiada = false;
    }

    function actualizarTransicion() {
      if (!enTransicion) return;
      transicion = Math.min(transicion + 0.035, 1);
      setStrength(Math.sin(Math.PI * transicion));

      if (!texturaCambiada && transicion >= 0.5) {
        texturaCambiada = true;
        imagen.setMap(texturas[indiceSiguiente]);
        indiceActual = indiceSiguiente;
        indiceSiguiente = null;
        setIndice(indiceActual);
      }

      if (transicion >= 1) {
        enTransicion = false;
        setStrength(0);
      }
    }

    function onWheel(e) {
      e.preventDefault();
      ruedaAcumulada += e.deltaY;
      const paso = Math.trunc(ruedaAcumulada / 140);
      if (paso !== 0) {
        iniciarTransicion(paso);
        ruedaAcumulada -= paso * 140;
      }
    }

    function onKeyup(e) {
      if (e.key === 'Escape') {
        cerrarRef.current();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') iniciarTransicion(-1);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') iniciarTransicion(1);
    }

    function animate() {
      if (cancelado) return;
      loops.push(requestAnimationFrame(animate));
      center.copy(mouse).divideScalar(2).addScalar(0.5);
      lerpv2(imagen?.uniforms.center.value, center, 0.1);
      actualizarTransicion();
      renderer.render(scene, camera);
    }

    const mouse = new THREE.Vector2();

    function onPointer(e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    const loader = new THREE.TextureLoader();

    function loadTexture(src) {
      return new Promise((resolve) => {
        loader.load(src, (tex) => resolve(tex), undefined, () => resolve(null));
      });
    }

    Promise.all(imagenes.map(loadTexture)).then((cargadas) => {
      if (cancelado) return;
      texturas = cargadas.filter(Boolean);
      if (texturas.length === 0) return;

      imagen = crearZoomBlur();
      imagen.setMap(texturas[0]);
      setStrength(0);

      medidas();
      redimensionar();

      window.addEventListener('resize', onResize);
      window.addEventListener('wheel', onWheel, { passive: false });
      document.addEventListener('keyup', onKeyup);
      window.addEventListener('pointermove', onPointer);

      controlesRef.current.next = () => iniciarTransicion(1);
      controlesRef.current.prev = () => iniciarTransicion(-1);

      loops.push(requestAnimationFrame(animate));
    });

    return () => {
      cancelado = true;
      loops.forEach((id) => cancelAnimationFrame(id));
      loops = [];
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('keyup', onKeyup);
      window.removeEventListener('pointermove', onPointer);
      if (imagen) imagen.dispose();
      texturas.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, [espacio]);

  if (!espacio) return null;

  return (
    <div className="carrusel-overlay">
      <canvas ref={canvasRef} className="carrusel-canvas" />

      <header className="carrusel-barra">
        <div className="carrusel-info">
          <strong>{espacio.nombre}</strong>
          <span className="carrusel-tipo">
            Galería · {indice + 1} / {imagenesDeEspacio(espacio).length}
          </span>
        </div>
        <button type="button" className="carrusel-cerrar" onClick={onCerrar} aria-label="Cerrar galería">
          <IconX />
        </button>
      </header>

      <button
        type="button"
        className="carrusel-flecha carrusel-anterior"
        onClick={() => controlesRef.current.prev()}
        aria-label="Imagen anterior"
      >
        <IconChevronLeft />
      </button>

      <button
        type="button"
        className="carrusel-flecha carrusel-siguiente"
        onClick={() => controlesRef.current.next()}
        aria-label="Imagen siguiente"
      >
        <IconChevronRight />
      </button>

      <footer className="carrusel-pie">
        Usa la rueda del mouse, las flechas del teclado o los botones para navegar.
      </footer>
    </div>
  );
}

function lerp(a, b, x) {
  return a + x * (b - a);
}

function lerpv2(v1, v2, amount) {
  if (!v1) return;
  v1.x = lerp(v1.x, v2.x, amount);
  v1.y = lerp(v1.y, v2.y, amount);
}