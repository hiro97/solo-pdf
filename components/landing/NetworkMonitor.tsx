"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, ArrowUp, Check } from "lucide-react"

interface NetworkMonitorProps {
  isActive?: boolean
  hasFile?: boolean
}

export function NetworkMonitor({ isActive = false, hasFile = false }: NetworkMonitorProps) {
  const [logs, setLogs] = useState<{ id: number; text: string; type: "info" | "success" }[]>([])
  const [uploadCount, setUploadCount] = useState(0)

  useEffect(() => {
    if (hasFile) {
      const newLogs = [
        { id: 1, text: "File detected in browser", type: "info" as const },
        { id: 2, text: "Processing locally...", type: "info" as const },
        { id: 3, text: "No network requests made", type: "success" as const },
      ]

      newLogs.forEach((log, i) => {
        setTimeout(() => {
          setLogs((prev) => [...prev, log])
        }, (i + 1) * 600)
      })

      return () => setLogs([])
    }
  }, [hasFile])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs font-mono text-muted-foreground ml-2">
            Network Monitor
          </span>
        </div>
        {isActive ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Upload counter */}
      <div className="glass rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Outbound Requests</p>
              <p className="text-xs text-muted-foreground">Files uploaded to servers</p>
            </div>
          </div>
          <motion.div
            className="text-4xl font-mono font-bold text-primary"
            key={uploadCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {uploadCount}
          </motion.div>
        </div>
      </div>

      {/* Activity log */}
      <div className="flex-1 bg-muted/30 rounded-lg p-3 font-mono text-xs overflow-hidden">
        <p className="text-muted-foreground mb-2">Activity Log:</p>
        <AnimatePresence mode="popLayout">
          {logs.length === 0 ? (
            <motion.p
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-muted-foreground italic"
            >
              Waiting for file...
            </motion.p>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 py-1 ${
                  log.type === "success" ? "text-green-600 dark:text-green-400" : ""
                }`}
              >
                {log.type === "success" && <Check className="w-3 h-3" />}
                <span>{log.text}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Status message */}
      <AnimatePresence>
        {hasFile && logs.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Your file never left your device
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
