interface SectionSetupProps {
  title: string
  children: React.ReactNode
}

export function SectionSetup({ title, children }: SectionSetupProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[9px]">1</span>
        {title}
      </h2>
      {children}
    </section>
  )
}