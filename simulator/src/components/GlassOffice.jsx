import { Text } from '@react-three/drei';

// ── GLASS OFFICE ──
// position = [x,y,z] of the front-left corner (entrance side)
// width  = dimension along x-axis
// depth  = dimension along z-axis
export function GlassOffice({ position = [0, 0, 0], width = 10, depth = 16, wallH = 2.8, label = 'OFICINA' }) {
  const baseColor  = '#3a4a5a';  // concrete tone matching warehouse walls
  const frameColor = '#b0bec5';  // aluminium frame
  const glassColor = '#a0c4ff';
  const glassOpacity = 0.18;
  const baseH  = 0.14;
  const frameT = 0.09;
  const doorW  = 1.9;            // entrance gap width

  const GlassPanel = ({ pos, args }) => (
    <mesh position={pos}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={glassColor} transparent opacity={glassOpacity} roughness={0} metalness={0.1} />
    </mesh>
  );
  const Frame = ({ pos, args }) => (
    <mesh position={pos}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
    </mesh>
  );

  const [x, , z] = position;
  const y   = 0;
  const midX = x + width / 2;
  const midZ = z + depth / 2;
  const bot  = y + baseH;
  const top  = bot + wallH;

  return (
    <group>
      {/* Concrete base slab */}
      <mesh position={[midX, y + baseH / 2, midZ]}>
        <boxGeometry args={[width + 0.1, baseH, depth + 0.1]} />
        <meshStandardMaterial color={baseColor} roughness={0.75} metalness={0.15} />
      </mesh>

      {/* ─── BACK WALL (+x side, full) ─── */}
      <GlassPanel pos={[x + width, bot + wallH / 2, midZ]} args={[frameT, wallH, depth]} />
      <Frame      pos={[x + width, bot + wallH / 2, z]}          args={[frameT, wallH, frameT]} />
      <Frame      pos={[x + width, bot + wallH / 2, z + depth]}  args={[frameT, wallH, frameT]} />
      <Frame      pos={[x + width, top, midZ]}                   args={[frameT, frameT, depth]} />
      <Frame      pos={[x + width, bot, midZ]}                   args={[frameT, frameT, depth]} />

      {/* ─── LEFT SIDE WALL (-z, full) ─── */}
      <GlassPanel pos={[midX, bot + wallH / 2, z]} args={[width, wallH, frameT]} />
      <Frame      pos={[midX, top, z]} args={[width, frameT, frameT]} />
      <Frame      pos={[midX, bot, z]} args={[width, frameT, frameT]} />

      {/* ─── RIGHT SIDE WALL (+z, full) ─── */}
      <GlassPanel pos={[midX, bot + wallH / 2, z + depth]} args={[width, wallH, frameT]} />
      <Frame      pos={[midX, top, z + depth]} args={[width, frameT, frameT]} />
      <Frame      pos={[midX, bot, z + depth]} args={[width, frameT, frameT]} />

      {/* ─── FRONT WALL (-x side) with entrance gap centred ─── */}
      {/* left panel */}
      <GlassPanel
        pos={[x, bot + wallH / 2, z + (depth / 2 - doorW / 2) / 2]}
        args={[frameT, wallH, depth / 2 - doorW / 2]}
      />
      {/* right panel */}
      <GlassPanel
        pos={[x, bot + wallH / 2, z + depth - (depth / 2 - doorW / 2) / 2]}
        args={[frameT, wallH, depth / 2 - doorW / 2]}
      />
      {/* top beam across full front */}
      <Frame pos={[x, top, midZ]} args={[frameT, frameT, depth]} />
      {/* vertical door-edge frames */}
      <Frame pos={[x, bot + wallH / 2, z + depth / 2 - doorW / 2]} args={[frameT, wallH, frameT]} />
      <Frame pos={[x, bot + wallH / 2, z + depth / 2 + doorW / 2]} args={[frameT, wallH, frameT]} />

      {/* ─── DIVIDER WALL between the two desk bays ─── */}
      <GlassPanel pos={[midX, bot + wallH / 2, midZ]} args={[width, wallH, frameT]} />
      <Frame      pos={[midX, top, midZ]} args={[width, frameT, frameT]} />
      <Frame      pos={[midX, bot, midZ]} args={[width, frameT, frameT]} />

      {/* Label above entrance */}
      <Text
        position={[x - 0.15, top + 0.3, midZ]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.5}
        color={frameColor}
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}
