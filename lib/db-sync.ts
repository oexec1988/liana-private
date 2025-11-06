import { Octokit } from '@octokit/rest'
import { getDb } from './db'
import { getDataStore } from './data-store'
import { createHash } from 'crypto'

export async function syncDatabaseToGit() {
  const githubToken = process.env.GITHUB_TOKEN
  const repoName = process.env.GITHUB_REPO
  const repoOwner = process.env.GITHUB_OWNER

  if (!githubToken || !repoName || !repoOwner) {
    throw new Error('GitHub configuration missing')
  }

  const octokit = new Octokit({ auth: githubToken })
  const dataStore = getDataStore()

  // Export current database state
  const dbExport = {
    timestamp: new Date().toISOString(),
    properties: dataStore.getProperties(),
    clients: dataStore.getClients(),
    showings: dataStore.getShowings(),
    adminActions: dataStore.getAdminActions(),
  }

  const content = Buffer.from(JSON.stringify(dbExport, null, 2)).toString('base64')
  const hash = createHash('sha256').update(JSON.stringify(dbExport)).digest('hex')
  const filename = `backups/db-${new Date().toISOString().split('T')[0]}.json`

  try {
    // Check if file exists
    let sha
    try {
      const { data } = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: filename,
      })
      if ('sha' in data) {
        sha = data.sha
      }
    } catch (e) {
      // File doesn't exist yet
    }

    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filename,
      message: `Database backup ${new Date().toISOString()}`,
      content,
      sha,
      committer: {
        name: 'Database Backup',
        email: 'backup@system.local',
      },
    })

    return { success: true, hash }
  } catch (error) {
    console.error('Failed to sync database:', error)
    throw error
  }
}
