import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AsIsWarehouse, ToBeWarehouse } from './Warehouse';
import { EmployeeAgent, SeatedEmployeeAgent, Forklift, AGV, Truck } from './Agents';
import { COLORS, STAFF } from '../data/constants';

// ══════════════════════════════════════════════════
// AISLE-FOLLOWING PATHS
// AS-IS (hw=25, hd=17.5)
// Aisle corridors:  x=-18.5 | -13.5 | -8.5 | -3.5
//                   z=-12   | -6    |  0
// ══════════════════════════════════════════════════

// Forklift aisle paths (stay on yellow lines only)
const ASIS_FORK_PATHS = [
  // Forklift 1: Reception → storage via main aisle z=-6 → down col x=-13.5
  [[-24, 0, 9], [-18.5, 0, 9], [-18.5, 0, -6], [-13.5, 0, -6], [-13.5, 0, -12],
    [-8.5, 0, -12], [-8.5, 0, -6], [5, 0, -6], [10, 0, -6], [10, 0, 0],
    [-3.5, 0, 0], [-3.5, 0, -6], [-18.5, 0, -6], [-18.5, 0, 9], [-24, 0, 9]],
  // Forklift 2: Dispatch → storage via z=-12 → x=-8.5
  [[24, 0, 9], [5, 0, 9], [5, 0, -6], [-3.5, 0, -6], [-3.5, 0, -12],
    [-8.5, 0, -12], [-8.5, 0, -6], [-8.5, 0, 0], [5, 0, 0], [24, 0, 0], [24, 0, 9]],
];

// AS-IS: trucks arrive at reception dock AND dispatch dock (chaotic = same side)
// Trucks handled in component below

// ══════════════════════════════════════════════════
// TO-BE (hw=27.5, hh=35)
// Main highway: x=-14  (vertical, z=-17 to z=17)
// Cross aisles: z=-3, z=10
// Picking aisle: z=17 (horizontal)
// ══════════════════════════════════════════════════
const TOBE_FORK_PATHS = [
  // Forklift 1: FIFO -> Storage -> FIFO
  [[-26, 0, 16], [-15, 0, 16], [-5, 0, 16], [-5, 0, 0], [-5, 0, 16], [-15, 0, 16], [-26, 0, 16]],
];

// AGV paths (TO-BE only: 2 Yellow = FIFO->Storage, 2 Blue = Storage->Picking)
const AGV_PATHS = [
  // Yellow 1: FIFO transition zone -> Zone A aisle
  [[-26, 0, 18], [-20, 0, 21], [-10, 0, 21], [-10, 0, 14], [-10, 0, 21], [-20, 0, 21], [-26, 0, 18]],
  // Yellow 2: FIFO transition zone -> Zone B aisle
  [[-26, 0, 17], [-15, 0, 22], [0, 0, 22], [0, 0, 5], [0, 0, 22], [-15, 0, 22], [-26, 0, 17]],
  // Blue 1: Zone A storage -> Picking belt
  [[-10, 0, 14], [-10, 0, 22], [26, 0, 22], [26, 0, 14], [26, 0, 22], [-10, 0, 22], [-10, 0, 14]],
  // Blue 2: Zone B storage -> Picking belt
  [[5, 0, 5], [5, 0, 22], [26, 0, 22], [26, 0, 10], [26, 0, 22], [5, 0, 22], [5, 0, 5]],
];

// ══════════════════════════════════════════════════
// EMPLOYEE PATHS (structured per zone)
// ══════════════════════════════════════════════════
// AS-IS: same people, chaotic routes crossing aisles
const ASIS_EMP_PATHS = [
  // Reception workers (7) — chaotic, cross into storage
  [[-23, 0, 9], [-18.5, 0, 6], [-13.5, 0, 0], [-8.5, 0, -6], [-23, 0, 9]],
  [[-22, 0, 11], [-3.5, 0, 0], [10, 0, -3], [-22, 0, 11]],
  [[-21, 0, 8], [-13.5, 0, -12], [-8.5, 0, -6], [5, 0, -2], [-21, 0, 8]],
  [[-23, 0, 12], [-18.5, 0, -6], [-3.5, 0, -12], [-23, 0, 12]],
  [[-22, 0, 7], [-8.5, 0, 0], [10, 0, -6], [-22, 0, 7]],
  [[-23, 0, 14], [-3.5, 0, -6], [-13.5, 0, -12], [-23, 0, 14]],
  [[-20, 0, 10], [-18.5, 0, -6], [-3.5, 0, 0], [10, 0, -3], [-20, 0, 10]],
  // Storage workers (5) — roam entire warehouse
  [[-18.5, 0, -6], [-13.5, 0, -12], [-8.5, 0, -6], [-3.5, 0, 0], [-18.5, 0, -6]],
  [[-13.5, 0, -6], [-8.5, 0, -12], [-3.5, 0, -6], [-13.5, 0, 0], [-13.5, 0, -6]],
  [[-18.5, 0, 0], [-18.5, 0, -12], [-3.5, 0, -12], [-3.5, 0, 0], [-18.5, 0, 0]],
  [[-8.5, 0, -6], [-13.5, 0, 0], [5, 0, -6], [-8.5, 0, -6]],
  [[-3.5, 0, -6], [5, 0, 0], [10, 0, -6], [-3.5, 0, -6]],
  // Picking workers (3)
  [[10, 0, -4], [15, 0, -2], [10, 0, 0], [8, 0, -4], [10, 0, -4]],
  [[12, 0, -2], [16, 0, -4], [12, 0, 0], [12, 0, -2]],
  [[8, 0, 0], [14, 0, -6], [10, 0, -2], [8, 0, 0]],
  // Packing workers (2)
  [[11, 0, -3], [14, 0, -1], [11, 0, -3]],
  [[13, 0, -5], [16, 0, -3], [13, 0, -5]],
  // Dispatch workers (3) — also cross to reception
  [[22, 0, 9], [5, 0, -6], [22, 0, 9]],
  [[22, 0, 12], [22, 0, 6], [22, 0, 12]],
  [[20, 0, 10], [20, 0, 5], [20, 0, 10]],
];

// TO-BE: 19 walking employees + 1 forklift driver = 20 total
// Reception:3, Storage:4 walking(5th=forklift), Picking/Packing:8, Dispatch:4
const TOBE_EMP_PATHS = [
  // 1. Reception workers (3)
  [[-33, 0, -22], [-33, 0, -5], [-33, 0, -22]],
  [[-25, 0, -22], [-22, 0, -8], [-25, 0, -22]],
  [[-30, 0, -15], [-20, 0, -5], [-30, 0, -15]],
  // 2. Storage workers walking (4) - 5th is forklift driver
  [[-9.75, 0, -18], [-9.75, 0, 8], [-9.75, 0, -18]],
  [[4.25, 0, -20], [4.25, 0, 5], [4.25, 0, -20]],
  [[-2.5, 0, -8], [-2.5, 0, 18], [-2.5, 0, -8]],
  [[12.5, 0, -18], [12.5, 0, 8], [12.5, 0, -18]],
  // 3. Picking & Packing workers (8)
  [[32.5, 0, 10]],
  [[32.5, 0, 18]],
  [[26, 0, 18], [29, 0, 18], [26, 0, 18]],
  [[26, 0, 12], [29, 0, 12], [26, 0, 12]],
  [[26, 0, 6], [29, 0, 6], [26, 0, 6]],
  [[28, 0, 20], [35, 0, 20], [28, 0, 20]],
  [[28, 0, 14], [35, 0, 14], [28, 0, 14]],
  [[33, 0, 8], [36, 0, 8], [33, 0, 8]],
  // 4. Dispatch workers (4)
  [[26, 0, -10], [34, 0, -10], [26, 0, -10]],
  [[26, 0, -18], [34, 0, -18], [26, 0, -18]],
  [[30, 0, -15], [36, 0, -15], [30, 0, -15]],
  [[30, 0, -22], [36, 0, -22], [30, 0, -22]],
];


// ── ANIMATED AGENT CONTROLLER ──
function AgentController({ groupRef, path, speed = 2, delay = 0 }) {
  const idxRef = useRef(0);

  useEffect(() => {
    if (!groupRef?.current || !path?.length) return;
    const mesh = groupRef.current;
    mesh.position.set(path[0][0], path[0][1], path[0][2]);
    
    // If the path only has one point, the agent is static
    if (path.length === 1) return;

    const animateStep = () => {
      const i = idxRef.current;
      const next = path[(i + 1) % path.length];
      const curr = path[i];
      const dist = Math.hypot(next[0] - curr[0], next[2] - curr[2]);
      if (dist < 0.01) { idxRef.current = (i + 1) % path.length; animateStep(); return; }
      const angle = Math.atan2(next[0] - curr[0], next[2] - curr[2]);
      mesh.rotation.y = angle;
      gsap.to(mesh.position, {
        x: next[0], z: next[2],
        duration: dist / speed,
        ease: 'none',
        delay: i === 0 ? delay : 0,
        onComplete: () => {
          idxRef.current = (i + 1) % path.length;
          animateStep();
        },
      });
    };
    animateStep();
    return () => gsap.killTweensOf(mesh.position);
  }, [path, speed, delay]);

  return null;
}

// ── TRUCK CONTROLLER ──
function TruckController({ groupRef, dockX, dockZ, inFromX, inFromZ, delay = 0, reverse = false }) {
  useEffect(() => {
    if (!groupRef?.current) return;
    const m = groupRef.current;
    
    const tl = gsap.timeline({ delay, repeat: -1, repeatDelay: 6 });

    if (inFromZ !== undefined) {
      m.position.set(dockX, 0, inFromZ);
      m.rotation.y = inFromZ < dockZ ? Math.PI / 2 : -Math.PI / 2;
      if (reverse) m.rotation.y += Math.PI;
      
      tl.to(m.position, { z: dockZ, duration: 5, ease: 'power2.inOut' });
      tl.to(m.position, { z: dockZ, duration: 8 }); // docked
      tl.to(m.position, { z: inFromZ, duration: 5, ease: 'power2.inOut' });
    } else {
      m.position.set(inFromX, 0, dockZ);
      // If moving LEFT (inFromX > dockX) and reverse: cab points RIGHT (PI)
      // If moving RIGHT (inFromX < dockX) and reverse: cab points LEFT (0)
      m.rotation.y = inFromX < dockX ? 0 : Math.PI;
      if (!reverse) m.rotation.y += Math.PI;

      tl.to(m.position, { x: dockX, duration: 5, ease: 'power2.inOut' });
      tl.to(m.position, { x: dockX, duration: 8 }); // docked
      tl.to(m.position, { x: inFromX, duration: 5, ease: 'power2.inOut' });
    }
    
    return () => tl.kill();
  }, [dockX, dockZ, inFromX, inFromZ, delay, reverse]);
  return null;
}

// ── FORKLIFT CONTROLLER (aisle-following) ──
function ForkliftController({ groupRef, boxRef, path, speed = 3, delay = 0, isYellowAGV, isBlueAGV, isForklift }) {
  const idxRef = useRef(0);
  useEffect(() => {
    if (!groupRef?.current || !path?.length) return;
    const m = groupRef.current;
    m.position.set(path[0][0], 0, path[0][2]);

    const step = () => {
      const i = idxRef.current;
      
      // Toggle box visibility based on waypoints
      if (boxRef && boxRef.current) {
        if (isYellowAGV) {
          // Yellow: get box at FIFO (i=0), drop at storage (i=3)
          if (i === 0) boxRef.current.visible = true;
          if (i === 3) boxRef.current.visible = false;
        } else if (isBlueAGV) {
          // Blue: get box at storage (i=0), drop at picking (i=3)
          if (i === 0) boxRef.current.visible = true;
          if (i === 3) boxRef.current.visible = false;
        } else if (isForklift) {
          // Forklift: get box at FIFO (i=0), drop at storage (i=3)
          if (i === 0) boxRef.current.visible = true;
          if (i === 3) boxRef.current.visible = false;
        }
      }

      const next = path[(i + 1) % path.length];
      const curr = path[i];
      const dist = Math.hypot(next[0] - curr[0], next[2] - curr[2]);
      if (dist < 0.01) { idxRef.current = (i + 1) % path.length; step(); return; }
      // Forklift orientation: added Math.PI to fix "reversa" issue
      gsap.to(m.rotation, { y: Math.atan2(next[0] - curr[0], next[2] - curr[2]) + Math.PI * 1.5, duration: 0.25 });
      gsap.to(m.position, {
        x: next[0], z: next[2],
        duration: dist / speed,
        ease: 'none',
        delay: i === 0 ? delay : 0,
        onComplete: () => { idxRef.current = (i + 1) % path.length; step(); },
      });
    };
    step();
    return () => gsap.killTweensOf(m.position);
  }, [path, speed, delay, isYellowAGV, isBlueAGV, isForklift, boxRef]);
  return null;
}

// ── FIRST PERSON CONTROLS ──
function FirstPersonControls({ sensitivity, setIsFPV, isAsIs }) {
  const { camera } = useThree();
  const speed = 12;
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'w' || e.key === 'W') keys.current.w = true;
      if (e.key === 'a' || e.key === 'A') keys.current.a = true;
      if (e.key === 's' || e.key === 'S') keys.current.s = true;
      if (e.key === 'd' || e.key === 'D') keys.current.d = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'W') keys.current.w = false;
      if (e.key === 'a' || e.key === 'A') keys.current.a = false;
      if (e.key === 's' || e.key === 'S') keys.current.s = false;
      if (e.key === 'd' || e.key === 'D') keys.current.d = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    // Set initial camera position for FPV at employee height (1.7m)
    camera.position.set(-20, 1.7, 5);
    camera.rotation.set(0, -Math.PI / 2, 0);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [camera]);

  useFrame((state, delta) => {
    const velocity = speed * delta;
    
    // Save previous position
    const oldPos = camera.position.clone();
    
    // Attempt movement
    if (keys.current.w) camera.translateZ(-velocity);
    if (keys.current.s) camera.translateZ(velocity);
    if (keys.current.a) camera.translateX(-velocity);
    if (keys.current.d) camera.translateX(velocity);
    
    const x = camera.position.x;
    const z = camera.position.z;
    let collision = false;

    // Outer boundaries
    if (isAsIs) {
      if (x < -24.5 || x > 24.5 || z < -17 || z > 17) collision = true;
      // Office
      if (x > 15 && x < 23 && z > -15 && z < -8) collision = true;
      // Racks
      const rackCols = [-21, -16, -11, -6, -1, 4, 9, 14];
      for (let cz of [-14, -9, -4, 1, 6]) {
        if (z > cz - 1.2 && z < cz + 1.2) {
          for (let cx of rackCols) {
            if (x > cx - 1.2 && x < cx + 1.2) collision = true;
          }
        }
      }
      // Obstructions (Boxes, Pallets, Tables, Aisle Racks)
      const obs = [
        [-20, 8], [-22, 11], [-19, 14], [20, 8], [22, 11],
        [-12, 15], [-4, 15], [4, 15], [12, 15],
        [-13, -16.5], [-7, -16.8], [-1, -16.5], [10, -12], [1, -7], [9, 3],
        [10, -2], [10, 2], [14, -2], [14, 2],
        // New Aisle Racks
        [-18.5, -14], [-13.5, -14], [-8.5, -14], [-8.5, -9], [-18.5, -4], [-23.5, -4],
        // New Pallets
        [0, 13], [-8, 12.5], [8, 14], [-15, 13.5]
      ];
      for (let ob of obs) {
        if (Math.hypot(x - ob[0], z - ob[1]) < 2.2) collision = true;
      }
    } else {
      if (x < -38 || x > 38 || z < -28 || z > 28) collision = true;

      // Office bounding box (x: 30.5 to 38.5, z: 7 to 21)
      if (x > 30.5 && x < 38.5 && z > 7 && z < 21) {
        // Allow entrance: x near 30.5, z between 13 and 15
        const inDoor = x > 30.0 && x < 31.0 && z > 13.0 && z < 15.0;
        const inInner = x > 31.0 && x < 38.0 && z > 7.5 && z < 20.5;
        if (!inDoor && !inInner) collision = true;
      }

      // Racks bounds: blocks of shelves
      const rackCols = [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5, 17.5];
      for (let cx of rackCols) {
        if (x > cx - 0.8 && x < cx + 0.8) {
          if ((z > -22 && z < -8) || (z > -5 && z < 7.6) || (z > 10 && z < 21)) {
             collision = true;
             break;
          }
        }
      }

      // Processing machine (-31.5 to -28.5, 0.5 to 3.5)
      if (x > -32 && x < -28 && z > 0 && z < 4) collision = true;
    }

    if (collision) {
      camera.position.x = oldPos.x;
      camera.position.z = oldPos.z;
    }

    camera.position.y = 1.7; // keep height fixed
  });

  return (
    <PointerLockControls 
      onUnlock={() => setIsFPV(false)} 
      pointerSpeed={sensitivity / 50} 
    />
  );
}

// ── MAIN CANVAS ──
export default function SimulationCanvas({ scenario, isRunning, isFPV, setIsFPV, sensitivity }) {
  const isAsIs = scenario === 'asis';

  // GSAP global pause/resume
  useEffect(() => {
    if (isRunning) gsap.globalTimeline.resume();
    else gsap.globalTimeline.pause();
  }, [isRunning]);

  const empPaths = isAsIs ? ASIS_EMP_PATHS : TOBE_EMP_PATHS;
  const forkPaths = isAsIs ? ASIS_FORK_PATHS : TOBE_FORK_PATHS;
  const camPos = isAsIs ? [35, 50, 40] : [0, 70, 50];
  const empColors = isAsIs
    ? (i) => i < 7 ? '#fb923c' : i < 12 ? '#a3e635' : i < 15 ? '#22d3ee' : '#60a5fa'
    : (i) => i < 3 ? '#fb923c' : i < 7 ? '#4ade80' : i < 15 ? '#22d3ee' : '#60a5fa';

  // ── SUPERVISOR CONFIG ──
  // AS-IS: indices 2, 7, 14 are supervisors (white helmet, no box)
  // TO-BE: indices 3, 9, 15 are supervisors (white helmet, no box)
  const ASIS_SUPERVISORS  = new Set([2, 7, 14]);
  const TOBE_SUPERVISORS  = new Set([3, 9, 15]);
  // TO-BE: only 10 carry box; chosen as non-supervisors from indices 0-6,9-18
  const TOBE_BOX_CARRIERS = new Set([0, 1, 2, 4, 5, 6, 10, 11, 12, 13]);

  const isSupervisor = (i) => isAsIs ? ASIS_SUPERVISORS.has(i) : TOBE_SUPERVISORS.has(i);
  const doesCarryBox = (i) => {
    if (isAsIs) return !ASIS_SUPERVISORS.has(i);  // 15 carry, 3 don't
    return TOBE_BOX_CARRIERS.has(i);              // exactly 10 carry
  };

  // Agent refs
  const staffCount = isAsIs ? ASIS_EMP_PATHS.length : TOBE_EMP_PATHS.length;
  const empR = useRef(null);
  if (!empR.current || empR.current.length !== staffCount) {
    empR.current = Array.from({ length: staffCount }, () => ({ current: null }));
  }
  const f1 = useRef(null);
  const f2 = useRef(null);
  // 4 AGV refs (2 yellow, 2 blue)
  const agvRefs = useRef(Array.from({ length: 4 }, () => ({ current: null })));
  const agvBoxRefs = useRef(Array.from({ length: 4 }, () => ({ current: null })));
  const forkBoxRef1 = useRef(null);
  const forkBoxRef2 = useRef(null);
  const t1 = useRef(null);
  const t2 = useRef(null);
  const t3 = useRef(null);
  const t4 = useRef(null);

  return (
    <Canvas
      shadows
      camera={{ position: camPos, fov: isFPV ? 75 : 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      style={{ background: '#0d1117' }}
    >
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[25, 45, 25]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={250}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={90}
          shadow-camera-bottom={-90}
        />
        <pointLight position={[0, 20, 0]} intensity={0.5} color="#e0f2fe" />
        <fog attach="fog" args={['#0d1117', 90, 220]} />

        {isFPV ? (
          <FirstPersonControls sensitivity={sensitivity} setIsFPV={setIsFPV} isAsIs={isAsIs} />
        ) : (
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={20}
            maxDistance={160}
          />
        )}

      <Suspense fallback={null}>
        {isAsIs ? <AsIsWarehouse /> : <ToBeWarehouse />}

        {/* ── EMPLOYEES ── */}
        {empR.current.map((ref, i) => {
          // Indices 7 and 8 in TO-BE are desk workers
          if (!isAsIs && (i === 7 || i === 8)) return null;
          // In AS-IS, use the last two (18, 19) as desk workers
          if (isAsIs && (i === 18 || i === 19)) return null;
          const supervisor = isSupervisor(i);
          const carryBox   = doesCarryBox(i);
          return (
            <group key={`e${i}-${scenario}`}>
              <EmployeeAgent
                groupRef={ref}
                color={empColors(i)}
                carryBox={carryBox}
                helmetColor={supervisor ? '#f1f5f9' : '#facc15'}
              />
              <AgentController
                groupRef={ref}
                path={empPaths[i] || empPaths[i % empPaths.length]}
                speed={isAsIs ? 1.2 + (i % 3) * 0.3 : 1.5}
                delay={i * 0.35}
              />
            </group>
          );
        })}

        {/* Seated desk operators */}
        {isAsIs ? (
          <>
            <SeatedEmployeeAgent position={[18, 0, -13.85]} rotation={[0, 0, 0]} color="#f97316" helmetColor="#f1f5f9" />
            <SeatedEmployeeAgent position={[18, 0, -10.35]} rotation={[0, 0, 0]} color="#f97316" helmetColor="#f1f5f9" />
          </>
        ) : (
          <>
            <SeatedEmployeeAgent position={[32.4, 0, 10]} rotation={[0, Math.PI, 0]} color="#22d3ee" helmetColor="#f1f5f9" />
            <SeatedEmployeeAgent position={[32.4, 0, 18]} rotation={[0, Math.PI, 0]} color="#22d3ee" helmetColor="#f1f5f9" />
          </>
        )}


        {/* ── FORKLIFTS AND AGVs ── */}
        {isAsIs ? (
          <>
            <group key={`f1-${scenario}`}>
              <Forklift groupRef={f1} boxRef={forkBoxRef1} />
              <ForkliftController groupRef={f1} boxRef={forkBoxRef1} path={forkPaths[0]} speed={4} isForklift={true} delay={0} />
            </group>
            {/* 2nd forklift for AS-IS if path exists */}
            {forkPaths.length > 1 && (
              <group key={`f2-${scenario}`}>
                <Forklift groupRef={f2} boxRef={forkBoxRef2} />
                <ForkliftController groupRef={f2} boxRef={forkBoxRef2} path={forkPaths[1]} speed={4} isForklift={true} delay={2} />
              </group>
            )}
          </>
        ) : (
          <group key={`f1-${scenario}`}>
            <Forklift groupRef={f1} boxRef={forkBoxRef1} />
            <ForkliftController groupRef={f1} boxRef={forkBoxRef1} path={forkPaths[0]} speed={4} isForklift={true} delay={1} />
          </group>
        )}

        {/* ── AGVs: 2 Yellow (FIFO→Storage) + 2 Blue (Storage→Picking) ── */}
        {!isAsIs && agvRefs.current.map((ref, i) => (
          <group key={`agv-${i}-${scenario}`}>
            <AGV groupRef={ref} color={i < 2 ? '#facc15' : '#2563eb'} boxRef={agvBoxRefs.current[i]} />
            <ForkliftController 
              groupRef={ref} 
              boxRef={agvBoxRefs.current[i]} 
              path={AGV_PATHS[i]} 
              speed={4.5} 
              delay={i * 2} 
              isYellowAGV={i < 2} 
              isBlueAGV={i >= 2} 
            />
          </group>
        ))}

        {/* ── TRUCKS ── */}
        {isAsIs ? (
          <>
            {/* AS-IS: 2 trucks at reception dock (left wall) */}
            <group key="t1-asis"><Truck groupRef={t1} /><TruckController groupRef={t1} dockX={-25} dockZ={9} inFromX={-45} delay={0} reverse /></group>
            <group key="t2-asis"><Truck groupRef={t2} /><TruckController groupRef={t2} dockX={-25} dockZ={12} inFromX={-45} delay={6} reverse /></group>
            {/* 2 trucks at dispatch dock (right wall) */}
            <group key="t3-asis"><Truck groupRef={t3} /><TruckController groupRef={t3} dockX={25} dockZ={9} inFromX={45} delay={3} reverse /></group>
            <group key="t4-asis"><Truck groupRef={t4} /><TruckController groupRef={t4} dockX={25} dockZ={12} inFromX={45} delay={9} reverse /></group>
          </>
        ) : (
          <>
            {/* TO-BE: 2 entry trucks (top wall), 2 exit trucks (right wall) */}
            <group key="t1-tobe">
              <Truck groupRef={t1} />
              <TruckController groupRef={t1} dockX={-35} dockZ={-30.6} inFromZ={-50} delay={0} reverse />
            </group>
            <group key="t2-tobe">
              <Truck groupRef={t2} />
              <TruckController groupRef={t2} dockX={-25} dockZ={-30.6} inFromZ={-50} delay={4} reverse />
            </group>
            <group key="t3-tobe">
              <Truck groupRef={t3} />
              <TruckController groupRef={t3} dockX={26} dockZ={-30.6} inFromZ={-50} delay={2} reverse />
            </group>
            <group key="t4-tobe">
              <Truck groupRef={t4} />
              <TruckController groupRef={t4} dockX={34} dockZ={-30.6} inFromZ={-50} delay={6} reverse />
            </group>
          </>
        )}
      </Suspense>
    </Canvas>
  );
}
