'use client'

interface SettingsToggleProps {
  enabled: boolean
  onChange: (val: boolean) => void
}

export function SettingsToggle({ enabled, onChange }: SettingsToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="flex-shrink-0 transition-colors"
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        position: 'relative',
        background: enabled ? '#4ECDC4' : 'rgba(255,255,255,0.1)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: enabled ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: 8,
          background: 'white',
          transition: 'left 0.15s',
        }}
      />
    </button>
  )
}