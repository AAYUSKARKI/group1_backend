import * as React from "react"
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  RotateCcw, 
  Terminal, 
  Globe, 
  Info,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check
} from "lucide-react"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/Sidebar"
import { useDispatch, useSelector } from "react-redux";
import { fetchAuditLogs } from "@/store/auditLogSlice"

export default function AuditLogPage() {
    const dispatch = useDispatch();
    const { loading, error, logs } = useSelector((state) => state.auditLog);
   console.log(loading,error,logs)
     React.useEffect(() => {
        dispatch(fetchAuditLogs());
    
        const interval = setInterval(() => {
          if (document.visibilityState === "visible" && !loading) {
            dispatch(fetchAuditLogs());
          }
        }, 30000);
    
        return () => clearInterval(interval);
      }, [dispatch]); 
  // --- STATE ---
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedAction, setSelectedAction] = React.useState("ALL")
  const [dateRange, setDateRange] = React.useState(undefined)
  
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  
  // Copy Feedback State
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // --- HELPERS ---
  const handleCopy = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }


  // --- FILTERING LOGIC ---
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        !searchTerm ||
        log.resourceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesAction = selectedAction === "ALL" || log.action === selectedAction

      const logDate = new Date(log.createdAt)
      const matchesDate = !dateRange?.from || !dateRange?.to || 
        isWithinInterval(logDate, { 
          start: startOfDay(dateRange.from), 
          end: endOfDay(dateRange.to) 
        })

      return matchesSearch && matchesAction && matchesDate
    })
  }, [searchTerm, selectedAction, dateRange])

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(start, start + itemsPerPage)
  }, [filteredLogs, currentPage, itemsPerPage])

  // Reset to page 1 on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedAction, dateRange, itemsPerPage])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6 max-w-7xl mx-auto pb-20">
          {/* HEADER */}
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-2 text-primary mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Terminal className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Security Hub</Badge>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Audit Logs</CardTitle>
              <CardDescription className="text-base text-slate-500">
                Track and monitor administrative activities across the system for security and compliance.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* FILTER BAR */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10 border-slate-200" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-50 border-slate-200">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Action" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Events</SelectItem>
                <SelectItem value="PAYMENT_SUCCESS">Payments</SelectItem>
                <SelectItem value="DELETE">Deletions</SelectItem>
                <SelectItem value="ORDER_STATUS_CHANGE">Status</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-70 justify-start border-slate-200">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {dateRange?.from ? (
                    dateRange.to ? <>{format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}</> 
                    : format(dateRange.from, "LLL dd, y")
                  ) : <span>Filter by Date</span>}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(""); setSelectedAction("ALL"); setDateRange(undefined) }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* TABLE */}
          <Card className="overflow-hidden border-slate-200 shadow-xl bg-white rounded-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-50 pl-6 text-slate-500 font-semibold text-xs">TIMESTAMP</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs">ACTOR</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs">ACTION</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs">TARGET</TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs">DETAILS</TableHead>
                    <TableHead className="text-right pr-6 text-slate-500 font-semibold text-xs">NETWORK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50 transition-all">
                        <TableCell className="font-mono text-[11px] pl-6 text-slate-500">
                          {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col text-sm">
                              <span className="font-semibold text-slate-700">{log.user?.name || "System"}</span>
                              <span className="text-[10px] text-slate-400">{log.user?.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-bold text-[10px] px-2 py-0")}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col group">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                              {log.resourceType}
                            </span>
                            <button 
                              onClick={() => handleCopy(log.resourceId || "")}
                              className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 w-fit hover:bg-slate-200 transition-colors group"
                            >
                              {log.resourceId}
                              {copiedId === log.resourceId ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="secondary" size="sm" className="h-7 text-[10px] bg-slate-100">
                                <Info className="h-3.5 w-3.5 mr-1.5" /> Inspect
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-0 shadow-2xl border-slate-200 overflow-hidden">
                              <div className="bg-slate-900 p-3 flex items-center justify-between">
                                <span className="text-slate-400 text-[10px] font-mono tracking-widest">JSON PAYLOAD</span>
                              </div>
                              <pre className="text-[11px] bg-slate-950 text-emerald-400 p-4 overflow-auto max-h-80 font-mono">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                              <Globe className="h-3 w-3 text-primary/60" /> {log.ip}
                            </span>
                            <span className="text-[10px] text-slate-400 max-w-30 truncate italic text-xs">
                              {log.userAgent}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertCircle className="h-8 w-8 text-slate-300" />
                          <p className="text-slate-500 font-medium">No logs found matching your criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* PAGINATION FOOTER */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500">Show</p>
                  <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="h-8 w-17.5 border-slate-200">
                      <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500 italic ml-2">
                    Displaying {Math.min(filteredLogs.length, itemsPerPage * currentPage)} of {filteredLogs.length} logs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 border-slate-200" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-semibold text-slate-900">{currentPage}</span>
                    <span className="text-sm text-slate-400">/</span>
                    <span className="text-sm text-slate-400">{totalPages || 1}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 border-slate-200"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}