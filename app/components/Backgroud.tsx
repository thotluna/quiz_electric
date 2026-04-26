export function Backgroud() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-background transition-colors duration-300">
      {/* Hexagonal Mesh - More visible and technical */}
      <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.3]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='50' viewBox='0 0 28 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 33L0 25L0 8L14 0L28 8L28 25L14 33L14 50' fill='none' stroke='oklch(0.45 0.12 250)' stroke-opacity='0.15' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '28px 50px'
      }} />
      {/* Subtle Focal Glow - More vibrant in light mode */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--neon-color)_0%,transparent_80%)]" />
      {/* Ultra-fine Noise for material feel */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
    </div>
  )
}