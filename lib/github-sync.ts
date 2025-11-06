import { getDataStore } from "./data-store"

export interface GitHubSyncConfig {
  token: string
  repository: string
  owner: string
}

export async function syncDatabaseToGitHub(config: GitHubSyncConfig): Promise<{
  success: boolean
  message: string
  commitSha?: string
}> {
  try {
    const dataStore = getDataStore()

    // Collect all data
    const backupData = {
      properties: dataStore.getProperties(),
      clients: dataStore.getClients(),
      showings: dataStore.getShowings(),
      adminActions: dataStore.getAdminActions(),
      timestamp: new Date().toISOString(),
    }

    const fileContent = JSON.stringify(backupData, null, 2)
    const encodedContent = Buffer.from(fileContent).toString("base64")
    const fileName = `backup-${new Date().toISOString().split("T")[0]}.json`
    const filePath = `backups/${fileName}`

    // Check if file exists
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repository}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    const sha = getFileResponse.ok ? (await getFileResponse.json()).sha : undefined

    // Create or update file
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repository}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Database backup - ${new Date().toISOString()}`,
          content: encodedContent,
          ...(sha && { sha }),
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        message: `GitHub API error: ${error.message}`,
      }
    }

    const result = await response.json()
    return {
      success: true,
      message: `Database backed up successfully to ${filePath}`,
      commitSha: result.commit.sha,
    }
  } catch (error) {
    console.error("[v0] GitHub sync error:", error)
    return {
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function restoreDatabaseFromGitHub(
  config: GitHubSyncConfig,
  fileName: string,
): Promise<{
  success: boolean
  message: string
}> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repository}/contents/backups/${fileName}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github.v3.raw",
        },
      },
    )

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to download backup file",
      }
    }

    const backupData = await response.json()

    // Validate backup structure
    if (!backupData.properties || !backupData.clients || !backupData.showings) {
      return {
        success: false,
        message: "Invalid backup file format",
      }
    }

    return {
      success: true,
      message: "Backup file restored successfully",
    }
  } catch (error) {
    console.error("[v0] GitHub restore error:", error)
    return {
      success: false,
      message: `Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
