import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Compass, RotateCw, Sparkles, Zap, ZoomIn, ZoomOut, Play, Pause } from "lucide-react";

interface Bike3DViewerProps {
  className?: string;
}

export default function Bike3DViewer({ className = "" }: Bike3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [headingDegrees, setHeadingDegrees] = useState(158);

  // Callbacks ref for UI controls
  const controlsRef = useRef<{
    toggleAutoSpin: () => void;
    resetView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let animFrameId: number;

    try {
      // 1. Scene setup
      const scene = new THREE.Scene();

      // 2. Camera setup - Centered front 3/4 sports showcase framing
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 540;
      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
      let targetCameraDistance = 6.25;
      let currentCameraDistance = 6.25;
      camera.position.set(0, 0.45, currentCameraDistance);
      camera.lookAt(0, 0.08, 0);

      // 3. WebGL Renderer with full transparency
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.22;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // 4. Studio Environment Map (IBL) for Realistic PBR Specular Reflections (Matching Sketchfab)
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      scene.environment = envTexture;

      // 5. Studio Multi-Angle Lighting Rig
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      // Key light - Crisp directional studio light for glossy red paint reflections
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(6, 9, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      // Soft fill light from the left
      const fillLight = new THREE.DirectionalLight(0xf8fafc, 1.8);
      fillLight.position.set(-6, 5, 5);
      scene.add(fillLight);

      // Crisp cool rim light from behind
      const cyanRim = new THREE.DirectionalLight(0xe0f2fe, 1.6);
      cyanRim.position.set(-5, 6, -5);
      scene.add(cyanRim);

      // Warm accent light for engine & exhaust details
      const warmAccent = new THREE.DirectionalLight(0xffedd5, 1.2);
      warmAccent.position.set(5, 4, -4);
      scene.add(warmAccent);

      // Underbelly bounce light for tires and lower chassis
      const underLight = new THREE.DirectionalLight(0xe2e8f0, 1.0);
      underLight.position.set(0, -4, 2);
      scene.add(underLight);

      // 6. Bike Main Group setup
      const bikeGroup = new THREE.Group();
      scene.add(bikeGroup);

      // 7. Horizontal Floor Cyber Rings (Stationary Ground Hologram)
      const floorRingGroup = new THREE.Group();
      floorRingGroup.position.set(0, -0.72, 0);

      const createHorizontalFlatRing = (
        innerR: number,
        outerR: number,
        colorHex: number,
        opacityVal: number
      ) => {
        const ringGeo = new THREE.RingGeometry(innerR, outerR, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: opacityVal,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        return ringMesh;
      };

      floorRingGroup.add(createHorizontalFlatRing(1.2, 1.22, 0x06b6d4, 0.45));
      floorRingGroup.add(createHorizontalFlatRing(1.5, 1.515, 0x10b981, 0.35));
      floorRingGroup.add(createHorizontalFlatRing(1.85, 1.865, 0x38bdf8, 0.25));

      // Dashed Tick Markers on Ground Ring
      const tickCount = 28;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2;
        const tickGeo = new THREE.PlaneGeometry(0.02, 0.12);
        const tickMat = new THREE.MeshBasicMaterial({
          color: i % 4 === 0 ? 0x10b981 : 0x06b6d4,
          transparent: true,
          opacity: i % 4 === 0 ? 0.75 : 0.4,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const tick = new THREE.Mesh(tickGeo, tickMat);
        tick.rotation.x = -Math.PI / 2;
        tick.rotation.z = -angle;
        tick.position.x = Math.cos(angle) * 1.51;
        tick.position.z = Math.sin(angle) * 1.51;
        floorRingGroup.add(tick);
      }

      scene.add(floorRingGroup);

      // 8. Load Texture Assets from model folder for high fidelity
      const textureLoader = new THREE.TextureLoader();

      // Carbon fiber normal weave
      const carbonNormalMap = textureLoader.load(
        "/models/bmw-s1000-rr/textures/carbonfiber_001_nrml_12.png"
      );
      carbonNormalMap.wrapS = THREE.RepeatWrapping;
      carbonNormalMap.wrapT = THREE.RepeatWrapping;
      carbonNormalMap.repeat.set(10, 10);

      // Brake disc texture
      const brakeDiscMap = textureLoader.load(
        "/models/bmw-s1000-rr/textures/bmw_m1krr_brakes_4.png"
      );

      // Cockpit screen display
      const cockpitScreenMap = textureLoader.load(
        "/models/bmw-s1000-rr/textures/bmw_m1krr_cockpit_25.png"
      );

      // 9. Load BMW S1000 RR 3D GLB Model
      const loader = new GLTFLoader();
      loader.load(
        "/models/bmw-s1000-rr.glb",
        (gltf) => {
          const model = gltf.scene;

          // Compute raw bounding box
          const rawBox = new THREE.Box3().setFromObject(model);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);

          // Target scale to comfortably fit framing (max dimension ~3.2 units)
          const targetDim = 3.2;
          const scale = targetDim / (maxDim || 1);
          model.scale.setScalar(scale);

          // Calculate scaled bounds to center horizontally and ground vertically
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

          // Horizontally center model
          model.position.x = -scaledCenter.x;
          model.position.z = -scaledCenter.z;

          // Ground bottom precisely at -0.68 (resting right above floor ring at -0.72)
          model.position.y = -scaledBox.min.y - 0.68;

          // Make sure all bones and joints in the skeleton remain active and updated
          model.updateMatrixWorld(true);

          // Apply authentic Sketchfab BMW S1000 RR PBR Materials & Shaders
          model.traverse((child) => {
            // Only hide collision meshes (do not hide bones/skeleton nodes!)
            if (child.name.endsWith(".col") || child.name === "offlrds1000r.col") {
              child.visible = false;
              return;
            }

            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.frustumCulled = false;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // Clean vertex colors so game mask channels don't interfere
              if (mesh.geometry) {
                if (mesh.geometry.attributes.color) mesh.geometry.deleteAttribute("color");
                if (mesh.geometry.attributes.color_1) mesh.geometry.deleteAttribute("color_1");
              }

              if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((mat) => {
                  const stdMat = mat as THREE.MeshStandardMaterial & {
                    clearcoat?: number;
                    clearcoatRoughness?: number;
                  };
                  const name = (stdMat.name || "").toLowerCase();
                  const meshName = (mesh.name || "").toLowerCase();

                  // Enforce solid opaque PBR rendering for structural parts
                  stdMat.transparent = false;
                  stdMat.depthWrite = true;
                  stdMat.depthTest = true;
                  stdMat.opacity = 1.0;
                  stdMat.vertexColors = false;
                  stdMat.side = THREE.FrontSide;

                  // 1. Racing Tires (Dark Matte Vulcanized Rubber)
                  if (name.includes("tyre") || meshName.includes("tyre")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x111215);
                    stdMat.roughness = 0.92;
                    stdMat.metalness = 0.04;
                  }
                  // 2. Forged M-Performance Wheel Rims (Gloss Midnight Black with clear reflections)
                  else if (name.includes("wheel") || meshName.includes("wheel_l")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x0a0b10);
                    stdMat.roughness = 0.16;
                    stdMat.metalness = 0.92;
                  }
                  // 3. Exposed Trellis Frame & Subframe (Brushed Silver Aluminum)
                  else if (
                    meshName.includes("chassis") ||
                    meshName.includes("rear-frame") ||
                    name.includes("frame") ||
                    name.includes("braided_alu")
                  ) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0xe2e8f0);
                    stdMat.roughness = 0.15;
                    stdMat.metalness = 0.98;
                  }
                  // 4. Titanium Exhaust Pipe & Canister (Brushed Satin Titanium)
                  else if (name.includes("exhaust") || meshName.includes("engineblock")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0xcbd5e1);
                    stdMat.roughness = 0.2;
                    stdMat.metalness = 0.96;
                  }
                  // 5. Engine Block, Gearbox & Transmission (Deep Matte Graphite / Dark Alloy)
                  else if (name.includes("engine") || name.includes("gear") || name.includes("chain")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x1e293b);
                    stdMat.roughness = 0.38;
                    stdMat.metalness = 0.82;
                  }
                  // 6. High-Performance Front Inverted Forks (Dark Titanium / Black Anodized)
                  else if (meshName.includes("fork") || name.includes("gold")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x1e293b);
                    stdMat.roughness = 0.18;
                    stdMat.metalness = 0.92;
                  }
                  // 7. Floating Brake Rotors (Dark Drilled Stainless Steel with Texture)
                  else if (name.includes("brake") || meshName.includes("bikedisc")) {
                    stdMat.map = brakeDiscMap;
                    if (stdMat.color) stdMat.color.setHex(0xffffff);
                    stdMat.roughness = 0.25;
                    stdMat.metalness = 0.92;
                  }
                  // 8. Main Body Fairings, Fuel Tank & Tail Cowl (Vibrant Racing Crimson Red)
                  else if (
                    name.includes("paint") ||
                    name.includes("livery") ||
                    name.includes("primary") ||
                    name.includes("carbon fiber red") ||
                    meshName.includes("bodyshell")
                  ) {
                    if (name.includes("decal") || name.includes("badge")) {
                      stdMat.transparent = true;
                      stdMat.alphaTest = 0.5;
                      stdMat.depthWrite = true;
                    } else if (name.includes("carbon")) {
                      stdMat.normalMap = carbonNormalMap;
                      stdMat.normalScale = new THREE.Vector2(1.2, 1.2);
                      if (stdMat.color) stdMat.color.setHex(0x18181b);
                      stdMat.roughness = 0.26;
                      stdMat.metalness = 0.65;
                    } else {
                      stdMat.map = null;
                      if (stdMat.color) stdMat.color.setHex(0xd90429);
                      stdMat.roughness = 0.12;
                      stdMat.metalness = 0.15;
                      if ("clearcoat" in stdMat) {
                        stdMat.clearcoat = 1.0;
                        stdMat.clearcoatRoughness = 0.04;
                      }
                    }
                  }
                  // 9. Carbon Fiber Aerodynamic Nose Fairing, Front Mudguard & Winglets
                  else if (
                    name.includes("carbon") ||
                    meshName.includes("mud-gaurd") ||
                    meshName.includes("extra_7") ||
                    meshName.includes("rear-seat")
                  ) {
                    stdMat.normalMap = carbonNormalMap;
                    stdMat.normalScale = new THREE.Vector2(1.2, 1.2);
                    if (stdMat.color) stdMat.color.setHex(0x18181b);
                    stdMat.roughness = 0.26;
                    stdMat.metalness = 0.65;
                  }
                  // 10. Windshield & Light Optical Glass (Smoke Tinted Glass)
                  else if (
                    name.includes("glass") ||
                    meshName.includes("windshield") ||
                    name.includes("headlight glass")
                  ) {
                    stdMat.transparent = true;
                    stdMat.depthWrite = false;
                    stdMat.opacity = 0.6;
                    stdMat.side = THREE.DoubleSide;
                    if (stdMat.color) stdMat.color.setHex(0x475569);
                    stdMat.roughness = 0.05;
                    stdMat.metalness = 0.1;
                  }
                  // 11. LED Projector Headlights (Angel-Eye Bright White Glow)
                  else if (meshName.includes("headlight")) {
                    if (stdMat.color) stdMat.color.setHex(0xffffff);
                    stdMat.emissive = new THREE.Color(0xffffff);
                    stdMat.emissiveIntensity = 3.5;
                  }
                  // 12. Ergonomic Saddle (Black Alcantara & Leather)
                  else if (name.includes("seat") || name.includes("alcantara")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x18181b);
                    stdMat.roughness = 0.88;
                    stdMat.metalness = 0.05;
                  }
                  // 13. Cockpit TFT Race Display Screen
                  else if (
                    name.includes("dials") ||
                    name.includes("cockpit") ||
                    name.includes("takometro")
                  ) {
                    stdMat.map = cockpitScreenMap;
                    if (stdMat.color) stdMat.color.setHex(0xffffff);
                    stdMat.roughness = 0.12;
                  }
                  // 14. Swingarm Structure
                  else if (meshName.includes("swingarm")) {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x1e293b);
                    stdMat.roughness = 0.28;
                    stdMat.metalness = 0.85;
                  }
                  // 15. All other chassis & trim components
                  else {
                    stdMat.map = null;
                    if (stdMat.color) stdMat.color.setHex(0x1e293b);
                    stdMat.roughness = 0.35;
                    stdMat.metalness = 0.65;
                  }

                  if ("envMapIntensity" in stdMat) {
                    stdMat.envMapIntensity = 1.35;
                  }
                  stdMat.needsUpdate = true;
                });
              }
            }
          });

          bikeGroup.add(model);

          // Pre-compile GPU shaders so final rendered view appears instantly without popping
          if (renderer) {
            renderer.compile(scene, camera);
          }
          requestAnimationFrame(() => {
            setIsLoading(false);
          });
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
          } else {
            setLoadProgress((prev) => Math.min(92, prev + 12));
          }
        },
        (err) => {
          console.error("Failed to load BMW S1000 RR model:", err);
          setHasError(true);
          setIsLoading(false);
        }
      );

      // 10. 360° Continuous Turntable Rotation & Full Gesture Interaction System
      // Default angle set to dynamic Front-3/4 sports showcase view (~158°)
      const defaultHeroAngle = 2.75;
      let currentRotY = defaultHeroAngle;
      let targetRotY = defaultHeroAngle;
      let currentRotX = 0.02;
      let targetRotX = 0.02;
      let velocityRotY = 0;
      let velocityRotX = 0;

      let mouseHoverX = 0;
      let mouseHoverY = 0;

      let isDragging = false;
      let prevPointerX = 0;
      let prevPointerY = 0;
      let lastMoveTime = performance.now();
      let lastInteractTime = performance.now();
      let autoSpinActive = true;
      const baseAutoSpinSpeed = 0.005; // Silky continuous 360° rotation

      // Touch pinch tracking
      let initialPinchDistance = 0;
      let pinchStartDistance = currentCameraDistance;

      // Expose controls to UI Buttons
      controlsRef.current = {
        toggleAutoSpin: () => {
          autoSpinActive = !autoSpinActive;
          setIsAutoSpinning(autoSpinActive);
          lastInteractTime = performance.now();
        },
        resetView: () => {
          targetRotY = defaultHeroAngle;
          targetRotX = 0.02;
          targetCameraDistance = 6.25;
          velocityRotY = 0;
          velocityRotX = 0;
          autoSpinActive = true;
          setIsAutoSpinning(true);
        },
        zoomIn: () => {
          targetCameraDistance = Math.max(3.8, targetCameraDistance - 0.65);
        },
        zoomOut: () => {
          targetCameraDistance = Math.min(7.8, targetCameraDistance + 0.65);
        },
      };

      // 11. Gesture Handlers (Pointer / Mouse / Touch / Wheel)
      const handlePointerDown = (e: PointerEvent) => {
        isDragging = true;
        setIsInteracting(true);
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
        lastMoveTime = performance.now();
        lastInteractTime = performance.now();
        velocityRotY = 0;
        velocityRotX = 0;

        try {
          (e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId);
        } catch {
          // Fallback if pointer capture is unsupported
        }
      };

      const handlePointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        mouseHoverX = normX;
        mouseHoverY = normY;

        if (isDragging) {
          const now = performance.now();
          const dt = Math.max(1, now - lastMoveTime);
          const deltaX = e.clientX - prevPointerX;
          const deltaY = e.clientY - prevPointerY;

          // 360° direct horizontal rotation mapping
          targetRotY += deltaX * 0.0085;
          // Constrained pitch tilt (tilt up / tilt down)
          targetRotX += deltaY * 0.0045;
          targetRotX = Math.max(-0.28, Math.min(0.28, targetRotX));

          // Calculate release velocity for smooth inertial spin
          velocityRotY = (deltaX / dt) * 0.045;
          velocityRotX = (deltaY / dt) * 0.025;

          prevPointerX = e.clientX;
          prevPointerY = e.clientY;
          lastMoveTime = now;
          lastInteractTime = now;
        }
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (isDragging) {
          isDragging = false;
          setIsInteracting(false);
          lastInteractTime = performance.now();

          try {
            (e.currentTarget as HTMLElement)?.releasePointerCapture(e.pointerId);
          } catch {
            // Safe fallback
          }
        }
      };

      // Touch Pinch-to-Zoom handling (2 fingers)
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          pinchStartDistance = targetCameraDistance;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistance > 0) {
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          const factor = initialPinchDistance / Math.max(10, currentDistance);
          targetCameraDistance = Math.max(3.8, Math.min(7.8, pinchStartDistance * factor));
          lastInteractTime = performance.now();
        }
      };

      const handleTouchEnd = () => {
        initialPinchDistance = 0;
      };

      // Mouse Wheel Zoom
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * 0.0035;
        targetCameraDistance = Math.max(3.8, Math.min(7.8, targetCameraDistance + delta));
        lastInteractTime = performance.now();
      };

      // Double Click / Double Tap reset to showcase view
      const handleDoubleClick = () => {
        controlsRef.current?.resetView();
      };

      container.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: true });
      container.addEventListener("touchend", handleTouchEnd);
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("dblclick", handleDoubleClick);

      const handleResize = () => {
        if (!container || !renderer) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener("resize", handleResize);

      // 12. Animation loop: 360° Continuous Turntable
      const clock = new THREE.Clock();
      let lastDegreeUpdate = 0;

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        const now = performance.now();

        // Subtle floating levitation
        const floatY = Math.sin(elapsedTime * 1.6) * 0.032;
        bikeGroup.position.y = floatY;

        // Ground Floor Cyber Ring slowly rotates independently for ambient depth
        floorRingGroup.rotation.y += 0.0025;

        // Auto 360° Turntable Rotation Logic with inertia & seamless resume
        if (isDragging) {
          // Actively user-manipulated: targetRotY is driven directly by gestures
        } else {
          // Apply residual inertia decay
          if (Math.abs(velocityRotY) > 0.0001) {
            targetRotY += velocityRotY;
            velocityRotY *= 0.93;
          }
          if (Math.abs(velocityRotX) > 0.0001) {
            targetRotX += velocityRotX;
            targetRotX = Math.max(-0.28, Math.min(0.28, targetRotX));
            velocityRotX *= 0.90;
          }

          // Smoothly resume 360° continuous turntable rotation when idle
          if (autoSpinActive && now - lastInteractTime > 900) {
            targetRotY += baseAutoSpinSpeed;
          }
        }

        // Smooth damping interpolation for bike orientation (Y-axis 360° full yaw, X-axis subtle pitch)
        const hoverOffset = isDragging ? 0 : mouseHoverX * 0.16;
        currentRotY += (targetRotY + hoverOffset - currentRotY) * 0.08;
        currentRotX += (targetRotX - (isDragging ? 0 : mouseHoverY * 0.08) - currentRotX) * 0.08;

        // Set 3D Bike rotation
        bikeGroup.rotation.y = currentRotY;
        bikeGroup.rotation.x = currentRotX;

        // Camera Smooth Zoom Damping
        currentCameraDistance += (targetCameraDistance - currentCameraDistance) * 0.08;
        camera.position.z = currentCameraDistance;

        // Update HUD heading degrees (0° - 360°) throttled to 10fps
        if (now - lastDegreeUpdate > 100) {
          const rawDeg = ((currentRotY * (180 / Math.PI)) % 360 + 360) % 360;
          setHeadingDegrees(Math.round(rawDeg));
          lastDegreeUpdate = now;
        }

        renderer?.render(scene, camera);
      };

      animate();

      // Cleanup
      return () => {
        cancelAnimationFrame(animFrameId);
        container.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("dblclick", handleDoubleClick);
        window.removeEventListener("resize", handleResize);

        if (pmremGenerator) {
          pmremGenerator.dispose();
        }

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.error("3D Motorcycle WebGL Error:", err);
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none overflow-visible ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[340px] sm:h-[500px] lg:h-[580px] cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
      />

      {/* Loading Progress State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-20 transition-opacity duration-300">
          <div className="relative flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <Zap className="absolute h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="text-sm font-semibold tracking-wide text-foreground">
            BMW S1000 RR
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            Loading 3D Superbike Model... {loadProgress > 0 ? `${loadProgress}%` : ""}
          </div>
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(12, loadProgress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Floating Interactive 360° Status Bar & Control Pills */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-auto max-w-[calc(100%-1rem)] inline-flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/90 backdrop-blur-md border border-border/80 shadow-lg text-[11px] sm:text-[12px] text-muted-foreground z-10 whitespace-nowrap">
        <div className="flex items-center gap-2 font-mono text-xs text-foreground font-semibold px-2 py-1 rounded-full bg-muted/80">
          <Compass className={`h-4 w-4 text-primary ${isInteracting || isAutoSpinning ? "animate-spin" : ""}`} />
          <span>{headingDegrees}°</span>
        </div>

        <span className="hidden sm:inline text-border/80">|</span>

        <span className="hidden sm:inline text-[11px] font-medium text-foreground/80">
          {isInteracting ? "Rotating 360°" : isAutoSpinning ? "360° Auto Turntable" : "Paused"}
        </span>

        <div className="flex items-center gap-1 border-l border-border/60 pl-2">
          {/* Auto Spin Toggle */}
          <button
            type="button"
            onClick={() => controlsRef.current?.toggleAutoSpin()}
            title={isAutoSpinning ? "Pause 360° Auto Spin" : "Start 360° Auto Spin"}
            className={`p-2 rounded-full transition-colors ${isAutoSpinning ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {isAutoSpinning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => controlsRef.current?.zoomIn()}
            title="Zoom In"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => controlsRef.current?.zoomOut()}
            title="Zoom Out"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* Reset View */}
          <button
            type="button"
            onClick={() => controlsRef.current?.resetView()}
            title="Reset to Hero 3/4 Angle (Double click)"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Futuristic Telemetry HUD Badge (Top Right) */}
      <div className="absolute top-10 right-3 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-card/85 backdrop-blur-md border border-border/80 text-xs shadow-sm pointer-events-none z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono text-xs text-foreground/90 font-medium">999cc // 205 HP</span>
      </div>

      {/* Floating Marketplace Pill Card (Top Left) */}
      <div className="absolute top-10 left-3 hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-card/85 backdrop-blur-md border border-border/80 shadow-md pointer-events-none text-left z-10">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Available Today</div>
          <div className="text-xs font-bold text-foreground">₹750 <span className="text-[10px] font-normal text-muted-foreground">/ day</span></div>
        </div>
      </div>

      {/* Subtle Marketplace Connection Badges (Bottom Left & Right) */}
      <div className="absolute bottom-20 left-3 hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-md border border-border/70 text-[11px] shadow-sm pointer-events-none text-left z-10">
        <span className="h-2 w-2 rounded-full bg-cyan-500" />
        <div>
          <span className="font-semibold text-foreground">Bike Owner:</span>{" "}
          <span className="text-muted-foreground">List idle bike → Earn ₹</span>
        </div>
      </div>

      <div className="absolute bottom-20 right-3 hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-md border border-border/70 text-[11px] shadow-sm pointer-events-none text-left z-10">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <div>
          <span className="font-semibold text-foreground">Renter:</span>{" "}
          <span className="text-muted-foreground">Instant booking</span>
        </div>
      </div>

      {/* WebGL Graceful Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-card/80 backdrop-blur-md border border-border rounded-2xl text-center z-20">
          <Sparkles className="h-10 w-10 text-primary mb-3" />
          <h4 className="text-base font-semibold text-foreground">BMW S1000 RR 3D Preview</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Interactive 3D model is ready. Click below to retry rendering.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <RotateCw className="h-4 w-4" />
            Reload 3D View
          </button>
        </div>
      )}
    </div>
  );
}
