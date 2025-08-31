export type DateRangeKey = "all" | "last7" | "thisMonth" | "custom"

export interface DateRangeParams {
  range?: string | null
  from?: string | null
  to?: string | null
}

export interface ResolvedDateRange {
  key: DateRangeKey
  from?: string
  to?: string
}

function formatYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function resolveDateRange(params: DateRangeParams): ResolvedDateRange {
  const rangeKey = (params.range || undefined) as DateRangeKey | undefined

  if (rangeKey === "last7") {
    const today = new Date()
    const from = new Date()
    from.setDate(today.getDate() - 6)
    return { key: "last7", from: formatYMD(from), to: formatYMD(today) }
  }

  if (rangeKey === "thisMonth") {
    const today = new Date()
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    return { key: "thisMonth", from: formatYMD(from), to: formatYMD(today) }
  }

  if (rangeKey === "custom") {
    const from = (params.from || undefined) ?? undefined
    const to = (params.to || undefined) ?? undefined
    return { key: "custom", from, to }
  }

  return { key: "all" }
}

