import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Shared in-memory storage for development (replace with D1 in production)
// This ensures all API routes use the same data storage

// File-based persistence for development
const dataDir = join(process.cwd(), '.dev-data')
const eventsFile = join(dataDir, 'events.json')
const tasksFile = join(dataDir, 'tasks.json')
const taskOptionsFile = join(dataDir, 'task-options.json')
const usersFile = join(dataDir, 'users.json')
const userSessionsFile = join(dataDir, 'user-sessions.json')

// Ensure data directory exists
try {
  if (!existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true })
  }
} catch (error) {
  console.warn('Could not create data directory:', error)
}

// Load data from files
function loadData(file: string): Map<string, any> {
  try {
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, 'utf8'))
      return new Map(Object.entries(data))
    }
  } catch (error) {
    console.warn(`Could not load data from ${file}:`, error)
  }
  return new Map()
}

// Save data to files
function saveData(map: Map<string, any>, file: string) {
  try {
    const data = Object.fromEntries(map.entries())
    writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (error) {
    console.warn(`Could not save data to ${file}:`, error)
  }
}

export const events = loadData(eventsFile)
export const tasks = loadData(tasksFile)
export const taskOptions = loadData(taskOptionsFile)
export const users = loadData(usersFile)
export const userSessions = loadData(userSessionsFile)

// Save data when the process exits
const saveAll = () => {
  saveData(events, eventsFile)
  saveData(tasks, tasksFile)
  saveData(taskOptions, taskOptionsFile)
  saveData(users, usersFile)
  saveData(userSessions, userSessionsFile)
}

// Auto-save periodically
setInterval(saveAll, 5000) // Save every 5 seconds

// Save on process exit
process.on('exit', saveAll)
process.on('SIGTERM', saveAll)
process.on('SIGINT', saveAll)