import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { COLORS } from '../data/constants';

// ── AISLE LINE (yellow tape on floor) ──
export function AisleLine({ x1, z1, x2, z2, color = '#facc15', width = 0.18 }) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  return (
    <mesh position={[(x1 + x2) / 2, 0.025, (z1 + z2) / 2]}
      rotation={[0, -Math.atan2(dz, dx), 0]}>
      <boxGeometry args={[len, 0.02, width]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

// ── ZONE BORDER TAPE ──
export function ZoneTape({ position, size, color }) {
  const [w, d] = size;
  const y = 0.03;
  const t = 0.2;
  return (
    <group position={position}>
      <mesh position={[0, y, -d / 2]}><boxGeometry args={[w, 0.02, t]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, y, d / 2]}><boxGeometry args={[w, 0.02, t]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[-w / 2, y, 0]}><boxGeometry args={[t, 0.02, d]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[w / 2, y, 0]}><boxGeometry args={[t, 0.02, d]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

// ── DOCK DOOR (Industrial Portón) ──
export function DockDoor({ position, rotation = [0, 0, 0], label = 'MUELLE', color = '#3b82f6' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Steel Frame */}
      <mesh position={[-2.1, 2.2, 0]} castShadow>
        <boxGeometry args={[0.3, 4.4, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[2.1, 2.2, 0]} castShadow>
        <boxGeometry args={[0.3, 4.4, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[4.5, 0.3, 0.5]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rubber Side Curtains (Black) */}
      <mesh position={[-1.7, 2, 0.1]}>
        <boxGeometry args={[0.6, 4, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>
      <mesh position={[1.7, 2, 0.1]}>
        <boxGeometry args={[0.6, 4, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>

      {/* Sectional Door (Metallic) */}
      <group position={[0, 3.0, -0.05]}>
        {[0, 0.8, 1.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[3.2, 0.75, 0.1]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
        {/* Door handle */}
        <mesh position={[0, 0.1, 0.1]}>
          <boxGeometry args={[0.5, 0.05, 0.1]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Dock Leveler / Floor Transition */}
      <mesh position={[0, 0.05, 1.2]} rotation={[-0.05, 0, 0]}>
        <planeGeometry args={[3.4, 2.4]} />
        <meshStandardMaterial color="#475569" roughness={1} />
      </mesh>

      {/* Hazard Stripes */}
      {[-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 1.2]} rotation={[-Math.PI/2, 0, 0.5]}>
          <planeGeometry args={[0.2, 2.4]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#facc15" : "#111827"} />
        </mesh>
      ))}

      <Text position={[0, 4.8, 0.1]} fontSize={0.5} color="#f8fafc" anchorX="center" outlineWidth={0.05} outlineColor="#000">
        {label}
      </Text>
    </group>
  );
}

// ── RACK WITH CATEGORY SIGN ──
const CATEGORY_COLORS = {
  standard: '#475569',
  fragile: '#3b82f6',
  flammable: '#ef4444',
  electronic: '#8b5cf6',
};
const CATEGORY_LABELS = {
  standard: 'ESTÁNDAR',
  fragile: '⚠ FRÁGIL',
  flammable: '🔥 INFLAMABLE',
  electronic: '⚡ ELECTRÓNICO',
};

export function Rack({ position, rotation = [0, 0, 0], width = 1.4, height = 2.4, depth = 0.55, category = 'standard', color, showSign = true, label = '' }) {
  // All racks use blue structure
  const col = '#2563eb';
  // All boxes use cardboard colors
  const bColors = ['#d97706', '#b45309', '#92400e'];

  return (
    <group position={position} rotation={rotation}>
      {/* Uprights */}
      {[[-width / 2 + 0.04, 0, -depth / 2 + 0.04], [width / 2 - 0.04, 0, -depth / 2 + 0.04],
        [-width / 2 + 0.04, 0, depth / 2 - 0.04], [width / 2 - 0.04, 0, depth / 2 - 0.04]].map((p, i) => (
        <mesh key={i} position={[p[0], height / 2, p[2]]} castShadow>
          <boxGeometry args={[0.06, height, 0.06]} />
          <meshStandardMaterial color={col} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Shelf levels */}
      {[0, 0.75, 1.5, 2.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[width - 0.06, 0.04, depth - 0.06]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} />
        </mesh>
      ))}
      {/* Boxes: HIGH rotation at bottom (level 0), LOW at top (level 2) */}
      {/* Boxes (No shadows for performance) */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[width * 0.8, 0.36, depth * 0.7]} />
        <meshStandardMaterial color={bColors[0]} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.97, 0]}>
        <boxGeometry args={[width * 0.75, 0.38, depth * 0.65]} />
        <meshStandardMaterial color={bColors[1]} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[width * 0.65, 0.34, depth * 0.6]} />
        <meshStandardMaterial color={bColors[2]} roughness={0.9} />
      </mesh>
      {/* Category sign at front top */}
      {showSign && label !== '' && (
        <group position={[0, height + 0.3, depth / 2 + 0.05]}>
          <mesh>
            <boxGeometry args={[width * 0.85, 0.28, 0.04]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <Text position={[0, 0, 0.03]} fontSize={0.11} color="#e2e8f0" anchorX="center" maxWidth={width * 0.8}>
            {label}
          </Text>
        </group>
      )}
      {/* Row number */}
    </group>
  );
}

// ── CONVEYOR BELT (Refined) ──
export function ConveyorBelt({ position, size = [10, 0.8], rotation = [0, 0, 0], speed = 1 }) {
  const [width, depth] = size;
  const boxRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    boxRefs.current.forEach((ref, i) => {
      if (ref) {
        // Correct modulo for negative numbers to keep boxes within [-width/2, width/2]
        const offset = (t + i * 2.5);
        ref.position.x = (((offset % width) + width) % width) - width / 2;
      }
    });
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Bed / Frame */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[width, 0.15, depth]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>
      {/* Rollers / Belt Surface */}
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[width - 0.1, depth - 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Support Legs */}
      {Array.from({ length: Math.ceil(width / 3) + 1 }).map((_, i) => (
        <group key={i} position={[-width / 2 + i * 3, 0.2, 0]}>
          <mesh position={[0, 0, -depth / 2 + 0.05]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0, depth / 2 - 0.05]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}
      {/* Moving boxes */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (boxRefs.current[i] = el)}
          position={[0, 0.65, (i % 2 === 0 ? 0.1 : -0.1)]}
          castShadow
        >
          <boxGeometry args={[0.45, 0.3, 0.35]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#d97706' : '#b45309'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── PACKING STATION ──
export function PackingStation({ position }) {
  return (
    <group position={position}>
      {/* Table */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.4, 0.06, 0.8]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[[-0.6, 0, -0.3], [0.6, 0, -0.3], [-0.6, 0, 0.3], [0.6, 0, 0.3]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.22, p[2]]}>
          <boxGeometry args={[0.05, 0.44, 0.05]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
      ))}
      {/* Box on table */}
      <mesh position={[0.1, 0.58, 0]} castShadow>
        <boxGeometry args={[0.4, 0.28, 0.35]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} />
      </mesh>
      {/* Tape dispenser */}
      <mesh position={[-0.4, 0.58, 0.1]}>
        <boxGeometry args={[0.15, 0.2, 0.1]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} />
      </mesh>
      {/* Scale */}
      <mesh position={[0.5, 0.52, -0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.25]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} />
      </mesh>
    </group>
  );
}

// ── OFFICE AREA ──
export function OfficeArea({ position }) {
  return (
    <group position={position}>
      {/* Floor rug */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      
      {/* Desks (two rows of two) */}
      {[[-2, -1], [2, -1], [-2, 1.5], [2, 1.5]].map((p, i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          {/* Desk top */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.8, 0.05, 0.8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          {/* Desk legs */}
          {[[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]].map((leg, j) => (
            <mesh key={j} position={[leg[0], 0.375, leg[1]]}>
              <boxGeometry args={[0.05, 0.75, 0.05]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          ))}
          {/* Chair */}
          <mesh position={[0, 0.45, 0.6]} castShadow>
            <boxGeometry args={[0.4, 0.1, 0.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.7, 0.75]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Monitor */}
          <mesh position={[0, 1.0, -0.2]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.85, -0.25]}>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}
      <Text position={[0, 2, 0]} fontSize={0.5} color="#1e293b" anchorX="center" rotation={[-Math.PI / 4, 0, 0]}>
        OFICINA DE RECEPCIÓN
      </Text>
    </group>
  );
}

// ── RFID PORTAL ──
export function RFIDPortal({ position }) {
  const glowRef = useRef();
  useFrame((s) => {
    if (glowRef.current) glowRef.current.material.emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 3) * 0.3;
  });
  return (
    <group position={position}>
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 2.4, 0.15]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}
      <mesh ref={glowRef} position={[0, 2.45, 0]}>
        <boxGeometry args={[2.0, 0.18, 0.15]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
      </mesh>
      <Text position={[0, 2.85, 0]} fontSize={0.28} color="#06b6d4" anchorX="center">RFID PORTAL</Text>
    </group>
  );
}

// ── PICK-TO-LIGHT STATION ──
export function PickStation({ position }) {
  const lightRef = useRef();
  useFrame((s) => {
    if (lightRef.current)
      lightRef.current.material.emissiveIntensity = 0.4 + Math.abs(Math.sin(s.clock.elapsedTime * 2.5 + position[0])) * 1.0;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.1, 0.8, 0.55]} />
        <meshStandardMaterial color="#0e7490" roughness={0.6} />
      </mesh>
      <mesh ref={lightRef} position={[0, 0.88, 0.29]}>
        <boxGeometry args={[0.7, 0.14, 0.04]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// ── REALISTIC FORKLIFT ──
export function Forklift({ groupRef, boxRef }) {
  return (
    <group ref={groupRef}>
      {/* Chassis (Lower body) */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.4, 0.4, 0.8]} />
        <meshStandardMaterial color="#facc15" metalness={0.6} roughness={0.2} />
      </mesh>
      
      {/* Engine Cover / Seat Base */}
      <mesh position={[-0.2, 0.55, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.7]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Seat */}
      <mesh position={[-0.3, 0.75, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Steering Column */}
      <mesh position={[0.2, 0.65, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0.28, 0.85, 0]} rotation={[Math.PI / 2, -0.4, 0]}>
        <torusGeometry args={[0.12, 0.02, 8, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Safety Cage (Vertical Pillars) */}
      {[[-0.55, 0.3], [-0.55, -0.3], [0.15, 0.3], [0.15, -0.3]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.9, pos[1]]}>
          <boxGeometry args={[0.06, 1.3, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}
      {/* Cage Top */}
      <mesh position={[-0.2, 1.55, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Mast (Vertical rails for forks) */}
      <group position={[0.7, 0.8, 0]}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 1.4, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 1.4, 0.08]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        
        {/* Forks */}
        <group position={[0.1, -0.6, 0]}>
          <mesh position={[0.4, 0, -0.15]}>
            <boxGeometry args={[0.8, 0.04, 0.12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          <mesh position={[0.4, 0, 0.15]}>
            <boxGeometry args={[0.8, 0.04, 0.12]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          {/* Cardboard box on forks */}
          <mesh ref={boxRef} position={[0.5, 0.2, 0]} visible={false}>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color="#d97706" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Wheels */}
      {[[-0.45, 0.15, 0.35], [-0.45, 0.15, -0.35], [0.45, 0.15, 0.35], [0.45, 0.15, -0.35]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}

      {/* Driver (Simplified) */}
      <group position={[-0.3, 0.7, 0]}>
        {/* Torso */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.35, 0.25]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
        {/* Head with helmet */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 8]} />
          <meshStandardMaterial color="#facc15" metalness={0.2} />
        </mesh>
        {/* Arms holding steering wheel */}
        <mesh position={[0.2, 0.3, 0.12]} rotation={[0, 0, -Math.PI/4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#fb923c" />
        </mesh>
        <mesh position={[0.2, 0.3, -0.12]} rotation={[0, 0, -Math.PI/4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3]} />
          <meshStandardMaterial color="#fb923c" />
        </mesh>
      </group>
    </group>
  );
}


export function AGV({ groupRef, color = "#2563eb", boxRef }) {
  const beaconRef = useRef();
  useFrame((s) => { if (beaconRef.current) beaconRef.current.rotation.y = s.clock.elapsedTime * 2.5; });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 8]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.2} />
      </mesh>
      {[[-0.32, 0.07, -0.32], [0.32, 0.07, -0.32], [-0.32, 0.07, 0.32], [0.32, 0.07, 0.32]].map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.07, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0.38]}>
        <boxGeometry args={[0.55, 0.05, 0.02]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
      </mesh>
      {/* Cardboard box on top when carrying */}
      <mesh ref={boxRef} position={[0, 0.55, 0]} visible={false}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── SEATED EMPLOYEE AGENT (for desk workers) ──
export function SeatedEmployeeAgent({ position, rotation = [0, 0, 0], color = '#f8fafc', helmetColor = '#facc15' }) {
  // Placed directly at world position, sitting at chair height
  return (
    <group position={[position[0], 0.42, position[2]]} rotation={rotation} scale={[1.6, 1.6, 1.6]}>
      {/* Torso leaning slightly forward */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.22, 0.36, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.48, -0.04]} castShadow>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.6} />
      </mesh>
      {/* Hard hat */}
      <mesh position={[0, 0.57, -0.04]}>
        <cylinderGeometry args={[0.12, 0.1, 0.08, 8]} />
        <meshStandardMaterial color={helmetColor} metalness={0.2} />
      </mesh>
      {/* Left thigh (horizontal, going forward) */}
      <mesh position={[-0.07, 0.02, 0.14]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Right thigh */}
      <mesh position={[0.07, 0.02, 0.14]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Left shin (hanging down from knee) */}
      <mesh position={[-0.07, -0.19, 0.27]}>
        <boxGeometry args={[0.08, 0.28, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Right shin */}
      <mesh position={[0.07, -0.19, 0.27]}>
        <boxGeometry args={[0.08, 0.28, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Arms resting forward on desk */}
      <mesh position={[-0.13, 0.2, -0.18]} rotation={[0.5, 0, 0.15]}>
        <boxGeometry args={[0.06, 0.26, 0.06]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      <mesh position={[0.13, 0.2, -0.18]} rotation={[0.5, 0, -0.15]}>
        <boxGeometry args={[0.06, 0.26, 0.06]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
    </group>
  );
}

// ── EMPLOYEE AGENT ──
export function EmployeeAgent({ groupRef, color = '#f8fafc', carryBox = true, helmetColor = '#facc15' }) {
  const armRef = useRef();
  const legLRef = useRef();
  const legRRef = useRef();
  const bodyRef = useRef();

  useFrame((s) => {
    const t = s.clock.elapsedTime * 8;
    const isMoving = true; // They are always controlled by AgentController

    if (isMoving) {
      // Bobbing body
      if (bodyRef.current) bodyRef.current.position.y = 0.48 + Math.sin(t) * 0.02;
      // Swinging legs
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t) * 0.4;
      if (legRRef.current) legRRef.current.rotation.x = -Math.sin(t) * 0.4;
      // Swinging arms
      if (armRef.current) {
        if (carryBox) {
          armRef.current.rotation.x = Math.PI / 2 + Math.sin(t) * 0.1;
        } else {
          armRef.current.rotation.x = Math.sin(t) * 0.3;
        }
      }
    }
  });

  return (
    <group ref={groupRef} scale={[1.6, 1.6, 1.6]}>
      <group ref={bodyRef}>
        {/* Torso */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.22, 0.38, 0.14]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.6} />
        </mesh>
        {/* Hard hat */}
        <mesh position={[0, 0.37, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.08, 8]} />
          <meshStandardMaterial color={helmetColor} metalness={0.2} />
        </mesh>
        {/* Arms (with or without box) */}
        {carryBox ? (
          <group ref={armRef} position={[0, 0, 0.05]}>
            <mesh position={[-0.14, 0, 0.08]} rotation={[Math.PI / 2, 0, 0.2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.25]} />
              <meshStandardMaterial color="#1e40af" />
            </mesh>
            <mesh position={[0.14, 0, 0.08]} rotation={[Math.PI / 2, 0, -0.2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.25]} />
              <meshStandardMaterial color="#1e40af" />
            </mesh>
            <mesh position={[0, 0, 0.2]} castShadow>
              <boxGeometry args={[0.2, 0.15, 0.15]} />
              <meshStandardMaterial color="#d97706" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          <group ref={armRef} position={[0, 0, 0]}>
            <mesh position={[-0.15, -0.08, 0]} rotation={[0, 0, 0.2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.25]} />
              <meshStandardMaterial color="#1e40af" />
            </mesh>
            <mesh position={[0.15, -0.08, 0]} rotation={[0, 0, -0.2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.25]} />
              <meshStandardMaterial color="#1e40af" />
            </mesh>
          </group>
        )}
      </group>

      {/* Legs */}
      <mesh ref={legLRef} position={[-0.07, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh ref={legRRef} position={[0.07, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// ── TRUCK (Realistic) ──
export function Truck({ groupRef }) {
  return (
    <group ref={groupRef}>
      {/* Cab */}
      <mesh position={[-3.2, 1, 0]} castShadow>
        <boxGeometry args={[2.4, 2, 2.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-4.41, 1.3, 0]}>
        <boxGeometry args={[0.05, 1.2, 1.8]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.6} />
      </mesh>
      {/* Side Mirrors */}
      <mesh position={[-3.2, 1.5, 1.15]}>
        <boxGeometry args={[0.1, 0.5, 0.25]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-3.2, 1.5, -1.15]}>
        <boxGeometry args={[0.1, 0.5, 0.25]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Trailer */}
      <mesh position={[1.8, 1.6, 0]} castShadow>
        <boxGeometry args={[7.6, 3.2, 2.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      {/* Trailer door frame */}
      <mesh position={[5.6, 1.6, 0]}>
        <boxGeometry args={[0.05, 3.1, 2.3]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Chassis/Wheels — front axles (single) + rear trailer axles (dual) */}
      {/* Front cab axles: single per side */}
      {[[-3.8, 0.4, 0.9], [-3.8, 0.4, -0.9], [-2.2, 0.4, 0.9], [-2.2, 0.4, -0.9]].map((p, i) => (
        <mesh key={`fw${i}`} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.4, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}
      {/* Rear trailer axles: dual wheels (inner + outer per side) */}
      {[0, 1.2, 3, 4.2, 5.2].map((rx, ai) =>
        [0.82, 1.18, -0.82, -1.18].map((rz, wi) => (
          <mesh key={`rw${ai}-${wi}`} position={[rx, 0.4, rz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.35, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── OFFICE DESK ──
export function Desk({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Table top */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.5, 0.05, 0.8]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Legs */}
      {[[-0.7, 0.37, 0.35], [0.7, 0.37, 0.35], [-0.7, 0.37, -0.35], [0.7, 0.37, -0.35]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.03, 0.03, 0.74]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
      {/* Monitor */}
      <group position={[0, 0.95, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.4, 0.04]} />
          <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 0.15]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      {/* Chair (Simplified) */}
      <group position={[0, 0, 0.6]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.45, 0.05, 0.45]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.8, 0.2]}>
          <boxGeometry args={[0.45, 0.6, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
}

// ── LONG TABLE (Packing / Simple Desk without PC/Chair) ──
export function LongTable({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Table top */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[2.0, 0.05, 0.8]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      {/* Legs */}
      {[[-0.95, 0.37, 0.35], [0.95, 0.37, 0.35], [-0.95, 0.37, -0.35], [0.95, 0.37, -0.35]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.03, 0.03, 0.74]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}
      {/* A few boxes on top of the table to look like packing station */}
      <mesh position={[-0.5, 0.86, 0]} castShadow rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
      <mesh position={[0.2, 0.82, -0.1]} castShadow rotation={[0, -0.1, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.25]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
}

// ── ROBOTIC ARM (Automation) ──
export function RoboticArm({ position, rotation = [0, 0, 0] }) {
  const arm1 = useRef();
  const arm2 = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (arm1.current) arm1.current.rotation.y = Math.sin(t) * 0.5;
    if (arm2.current) arm2.current.rotation.x = Math.cos(t * 1.5) * 0.4 - 0.4;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Mobile platform / body */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.7, 0.28, 0.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Caster wheels (4 corners) */}
      {[[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]].map(([wx, wz], i) => (
        <group key={i} position={[wx, 0.08, wz]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.07, 10]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
            <meshStandardMaterial color="#374151" metalness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Base turret */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.12, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Rotating joint 1 */}
      <group ref={arm1} position={[0, 0.4, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#fb923c" />
        </mesh>
        {/* Joint 2 */}
        <group ref={arm2} position={[0, 0.8, 0]}>
          <mesh position={[0, 0.3, 0.2]}>
            <boxGeometry args={[0.12, 0.12, 0.6]} />
            <meshStandardMaterial color="#fb923c" />
          </mesh>
          {/* Tool / Gripper */}
          <mesh position={[0, 0.3, 0.55]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ── TABLET STAND ──
export function TabletStand({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.07, 20]} />
        <meshStandardMaterial color="#111827" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.44, 8]} />
        <meshStandardMaterial color="#111827" metalness={0.85} roughness={0.2} />
      </mesh>
      <group position={[0, 1.48, 0.04]} rotation={[-0.35, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.46, 0.34, 0.055]} />
          <meshStandardMaterial color="#111827" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <boxGeometry args={[0.40, 0.28, 0.01]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.18, -0.13, 0.035]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

// ── SECURITY CAMERA (Dome) ──
export function SecurityCamera({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.18, 0.06, 0.18]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.24, 0]}>
        <sphereGeometry args={[0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.3, 0.06]} rotation={[Math.PI / 3, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.035, 10]} />
        <meshStandardMaterial color="#030712" metalness={0.95} />
      </mesh>
      <mesh position={[0.07, -0.24, 0.07]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// ── STACK OF BOXES (Obstruction) ──
export function BoxStack({ position, rotation = [0, 0, 0], scale = 1, rows = 2, cols = 2, height = 3 }) {
  const boxes = [];
  const bColors = ['#d97706', '#b45309', '#92400e', '#a16207'];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let h = 0; h < height; h++) {
        // Add some random displacement to make it look messy
        const xOff = (Math.random() - 0.5) * 0.1;
        const zOff = (Math.random() - 0.5) * 0.1;
        const rotY = (Math.random() - 0.5) * 0.2;
        const color = bColors[Math.floor(Math.random() * bColors.length)];
        
        boxes.push(
          <mesh 
            key={`${r}-${c}-${h}`} 
            position={[r * 0.52 - (rows * 0.5) / 2 + xOff, h * 0.42 + 0.21, c * 0.52 - (cols * 0.5) / 2 + zOff]} 
            rotation={[0, rotY, 0]}
            castShadow
          >
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        );
      }
    }
  }

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {boxes}
    </group>
  );
}

// ── WOODEN PALLET ──
export function WoodenPallet({ position, rotation = [0, 0, 0], hasBoxes = false, scale = 1 }) {
  const bColors = ['#d97706', '#b45309', '#92400e'];
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Base wood boards */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#8B5A2B" roughness={1} />
      </mesh>
      {/* Box stack on top if hasBoxes */}
      {hasBoxes && (
        <group position={[0, 0.1, 0]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[(i%2)*0.5 - 0.25, Math.floor(i/2)*0.4 + 0.2, (i%2)*0.3 - 0.15]} rotation={[0, Math.random()*0.2, 0]} castShadow>
              <boxGeometry args={[0.45, 0.4, 0.45]} />
              <meshStandardMaterial color={bColors[i%3]} roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 0.8 + 0.2, 0]} rotation={[0, 0.3, 0]} castShadow>
             <boxGeometry args={[0.5, 0.4, 0.5]} />
             <meshStandardMaterial color="#a16207" />
          </mesh>
        </group>
      )}
    </group>
  );
}
