// Map icon names to emojis
export const iconMapper: Record<string, string> = {
  layout: '🎨',
  server: '⚙️',
  database: '💾',
  mobile: '📱',
  settings: '🔧',
  'check-circle': '✅',
  wrench: '🔨',
  frontend: '🎨',
  backend: '⚙️',
  databases: '💾',
  devops: '🚀',
  testing: '✅',
  tools: '🔨',
}

export function getIconEmoji(iconName?: string): string {
  if (!iconName) return '📚'
  return iconMapper[iconName] || iconName
}
