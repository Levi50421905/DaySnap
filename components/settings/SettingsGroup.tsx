interface SettingsGroupProps {
    label: string
    children: React.ReactNode
  }
  
  export function SettingsGroup({ label, children }: SettingsGroupProps) {
    return (
      <div className="mb-6">
        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#6B6A66] mb-2 px-1">
          {label}
        </p>
        <div className="bg-[#141416] border border-white/8 rounded-xl overflow-hidden">
          {children}
        </div>
      </div>
    )
  }