'use client'

export interface Mode {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactElement;
}

interface ButtonModeProps {
  mode: Mode
  selected?: boolean
  onClick: (mode: string) => void
}

export function ButtonMode({ mode, onClick, selected = false }: ButtonModeProps) {
  return (
    <button
      onClick={() => onClick(mode.id)}
      className={`
                group relative p-3 rounded-xl border transition-all duration-300 text-left
                ${selected
          ? 'border-primary bg-primary/10 shadow-[0_0_20px_-5px_var(--neon-color)]'
          : 'border-border bg-card hover:border-primary/30'}
              `}
    >
      <div className={`absolute inset-0 rounded-xl transition-opacity ${selected
        ? 'bg-primary/5 opacity-100'
        : 'bg-foreground/5 opacity-0 group-hover:opacity-100'
        }`} />

      <div className="relative z-10">
        <div className={`mb-1.5 transition-colors ${selected ? 'text-primary' : 'text-foreground/20'}`}>
          <div className="w-4 h-4">{mode.icon}</div>
        </div>
        <p className="font-black text-xs text-foreground tracking-tight leading-none">{mode.title}</p>
        <p className="text-[8px] font-bold text-foreground/40 uppercase mt-1 tracking-wide">{mode.desc}</p>
      </div>
    </button>
  )
}