import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  value: number | string
  label: string
  description?: string
}

export function StatsCard({ icon: Icon, value, label, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="rounded-lg bg-navy/10 p-2.5">
            <Icon className="h-5 w-5 text-navy" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
