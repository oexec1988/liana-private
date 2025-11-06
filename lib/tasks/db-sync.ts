import { syncDatabaseToGit } from '../db-sync'

export async function scheduleDbSync() {
  // Run sync every 6 hours
  setInterval(async () => {
    try {
      await syncDatabaseToGit()
      console.log('Database sync completed:', new Date().toISOString())
    } catch (error) {
      console.error('Database sync failed:', error)
    }
  }, 6 * 60 * 60 * 1000)
}
