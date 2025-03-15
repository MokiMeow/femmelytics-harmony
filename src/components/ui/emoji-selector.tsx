
import * as React from "react"
import { cn } from "@/lib/utils"

interface EmojiOptionProps extends React.HTMLAttributes<HTMLButtonElement> {
  emoji: string
  label: string
  active: boolean
  value: number
}

const EmojiOption = React.forwardRef<HTMLButtonElement, EmojiOptionProps>(
  ({ emoji, label, active, value, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all",
          active 
            ? "bg-lavender-100 text-lavender-700 dark:bg-lavender-900/50 dark:text-lavender-300 border-2 border-lavender-400 dark:border-lavender-600"
            : "border border-muted hover:bg-muted/50 dark:hover:bg-muted/20",
          className
        )}
        {...props}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="text-xs font-medium">{label}</span>
      </button>
    )
  }
)
EmojiOption.displayName = "EmojiOption"

interface EmojiSelectorProps {
  value: number
  onChange: (value: number) => void
  options: {
    emoji: string
    label: string
    value: number
  }[]
  className?: string
}

export function EmojiSelector({ 
  value, 
  onChange, 
  options,
  className
}: EmojiSelectorProps) {
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {options.map((option) => (
        <EmojiOption
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          active={value === option.value}
          value={option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  )
}
