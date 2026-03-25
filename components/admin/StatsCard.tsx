import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  value: number | string
  label: string
  description?: string
  trend?: string
  trendUp?: boolean
}

export function StatsCard({ icon: Icon, value, label, description, trend, trendUp }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/40 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300">
      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
              {trend && (
                <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trend}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground/80">{description}</p>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-3 shadow-sm border border-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
