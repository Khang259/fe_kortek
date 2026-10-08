import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  label: string
  value: string
}

interface FilterSelectProps {
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
  label: string
  className?: string
}

/** Select đã bind sẵn label/value, luôn có giá trị mặc định nên không cần placeholder. */
export function FilterSelect({
  value,
  options,
  onChange,
  label,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(String(next))}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue>
          {(selected) =>
            options.find((option) => option.value === selected)?.label ?? label
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
