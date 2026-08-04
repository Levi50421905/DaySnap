'use client'

interface SettingsItemProps {
  label: string
  sublabel?: string
  value?: string
  danger?: boolean
  onClick?: () => void
  children?: React.ReactNode
  border?: boolean
}

export function SettingsItem({
  label, sublabel, value, danger, onClick, children, border = true
}: SettingsItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 ${border ? 'border-b border-white/6 last:border-0' : ''} ${onClick ? 'cursor-pointer hover:bg-white/3 transition-colors' : ''}`}
    >
      <div>
        <p className={`text-sm ${danger ? 'text-red-400' : 'text-[#E8E6E1]'}`}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-[#6B6A66] mt-0.5">{sublabel}</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {value && (
          <span className="text-xs font-mono text-[#6B6A66]">{value}</span>
        )}
        {children}
        {onClick && !children && (
          <span className="text-[#4A4A4E] text-sm">›</span>
        )}
      </div>
    </div>
  )
}