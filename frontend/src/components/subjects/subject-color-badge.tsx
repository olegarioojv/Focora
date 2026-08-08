interface SubjectColorBadgeProps {
  name: string
  color: string
  imageUrl?: string | null
  size?: number
}

export function SubjectColorBadge({
  name,
  color,
  imageUrl,
  size = 32,
}: SubjectColorBadgeProps) {
  const initials = name.slice(0, 2).toUpperCase()

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="shrink-0 rounded-lg object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      {initials}
    </span>
  )
}
