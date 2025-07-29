"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Vote } from "lucide-react"
import { cloudflareClient } from "@/lib/cloudflare-client"
import { useAuth } from "@/lib/auth"

interface TaskOption {
  id: string
  text: string
  is_correct: boolean
  order_index: number
}

interface Task {
  id: string
  title: string
  type: "quiz" | "voting"
  voting_mode: "single" | "multi"
  time_limit: number
  votes_required: number
  options: TaskOption[]
}

interface TaskModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  userVoteBalance: number
  onVoteBalanceUpdate: (newBalance: number) => void
}

export function TaskModal({ task, open, onClose, userVoteBalance, onVoteBalanceUpdate }: TaskModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [votesAllocated, setVotesAllocated] = useState<Record<string, number>>({})
  const { user } = useAuth()

  useEffect(() => {
    if (!task || !open) return

    setSelectedOptions([])
    setSubmitted(false)
    setVotesAllocated({})
    setTimeLeft(task.time_limit)

    if (task.time_limit > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [task, open])

  const handleOptionSelect = (optionId: string) => {
    if (submitted) return

    if (task?.voting_mode === "single") {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      )
    }
  }

  const handleVoteAllocation = (optionId: string, votes: number) => {
    if (submitted) return

    const totalAllocated = Object.values(votesAllocated).reduce((sum, v) => sum + v, 0)
    const currentVotes = votesAllocated[optionId] || 0
    const newVotes = Math.max(0, Math.min(votes, userVoteBalance - totalAllocated + currentVotes))

    setVotesAllocated((prev) => ({
      ...prev,
      [optionId]: newVotes,
    }))

    if (newVotes > 0 && !selectedOptions.includes(optionId)) {
      setSelectedOptions((prev) => [...prev, optionId])
    } else if (newVotes === 0 && selectedOptions.includes(optionId)) {
      setSelectedOptions((prev) => prev.filter((id) => id !== optionId))
    }
  }

  const handleSubmit = async () => {
    if (!task || !user || submitted) return

    setSubmitted(true)

    try {
      const responses = selectedOptions.map(async (optionId) => {
        await cloudflareClient.submitResponse({
          user_id: user.id,
          task_id: task.id,
          option_id: optionId,
          votes_used: task.voting_mode === "multi" ? votesAllocated[optionId] || 1 : 1,
        })
      })

      await Promise.all(responses)

      // Update vote balance
      const totalVotesUsed = selectedOptions.reduce(
        (sum, optionId) => sum + (task.voting_mode === "multi" ? votesAllocated[optionId] || 1 : 1),
        0,
      )
      const newBalance = userVoteBalance - totalVotesUsed

      await cloudflareClient.updateVoteBalance(user.id, task.event_id, newBalance)
      onVoteBalanceUpdate(newBalance)

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error submitting response:", error)
      setSubmitted(false)
    }
  }

  const canSubmit = selectedOptions.length > 0 && !submitted
  const totalVotesAllocated = Object.values(votesAllocated).reduce((sum, v) => sum + v, 0)

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={() => !submitted && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl md:text-2xl">{task.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={task.type === "quiz" ? "default" : "secondary"}>
                {task.type === "quiz" ? "Quiz" : "Vote"}
              </Badge>
              {task.voting_mode === "multi" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Vote className="h-3 w-3" />
                  {userVoteBalance - totalVotesAllocated} left
                </Badge>
              )}
            </div>
          </div>
          {task.time_limit > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Progress value={(timeLeft / task.time_limit) * 100} className="flex-1" />
              <span className="text-sm font-mono">{timeLeft}s</span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-3">
          {task.options.map((option) => (
            <div key={option.id} className="space-y-2">
              <Button
                variant={selectedOptions.includes(option.id) ? "default" : "outline"}
                className="w-full h-auto p-4 text-left justify-start text-wrap"
                onClick={() => handleOptionSelect(option.id)}
                disabled={submitted}
              >
                <span className="text-lg">{option.text}</span>
              </Button>

              {task.voting_mode === "multi" && selectedOptions.includes(option.id) && (
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm">Votes:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        size="sm"
                        variant={(votesAllocated[option.id] || 0) >= num ? "default" : "outline"}
                        onClick={() => handleVoteAllocation(option.id, num)}
                        disabled={
                          submitted || userVoteBalance - totalVotesAllocated + (votesAllocated[option.id] || 0) < num
                        }
                        className="w-8 h-8 p-0"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1 h-12 text-lg">
            {submitted ? "Submitted!" : "Submit"}
          </Button>
          {!submitted && (
            <Button variant="outline" onClick={onClose} className="h-12 bg-transparent">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
