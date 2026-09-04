import { SitePV, Project, OfficeSettings, UserProfile } from '../types';

const DRIVE_TOKEN_KEY = 'architexpert_drive_token';
const DRIVE_TOKEN_EXPIRY = 'architexpert_drive_expiry';
const DRIVE_FOLDER_ID_KEY = 'architexpert_drive_folder_id';
const DRIVE_USER_KEY = 'architexpert_drive_user';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface DriveUser {
  email: string;
  displayName: string;
  photoURL?: string;
}

/**
 * Get stored Google Drive access token if valid
 */
export function getStoredDriveToken(): string | null {
  const token = localStorage.getItem(DRIVE_TOKEN_KEY);
  const expiry = localStorage.getItem(DRIVE_TOKEN_EXPIRY);
  if (!token || !expiry) return null;
  if (Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem(DRIVE_TOKEN_KEY);
    localStorage.removeItem(DRIVE_TOKEN_EXPIRY);
    return null;
  }
  return token;
}

/**
 * Store Google Drive access token & user info
 */
export function setStoredDriveToken(token: string, expiresInSeconds: number = 3600, user?: DriveUser) {
  const expiryTime = Date.now() + (expiresInSeconds - 60) * 1000;
  localStorage.setItem(DRIVE_TOKEN_KEY, token);
  localStorage.setItem(DRIVE_TOKEN_EXPIRY, expiryTime.toString());
  if (user) {
    localStorage.setItem(DRIVE_USER_KEY, JSON.stringify(user));
  }
}

/**
 * Disconnect Google Drive
 */
export function disconnectDrive() {
  localStorage.removeItem(DRIVE_TOKEN_KEY);
  localStorage.removeItem(DRIVE_TOKEN_EXPIRY);
  localStorage.removeItem(DRIVE_FOLDER_ID_KEY);
  localStorage.removeItem(DRIVE_USER_KEY);
}

export function googleLogout(): Promise<void> {
  disconnectDrive();
  return Promise.resolve();
}

/**
 * Initialize Drive Auth listener
 */
export function initAuth(onUser: (user: DriveUser) => void, onLogout: () => void) {
  const token = getStoredDriveToken();
  const userRaw = localStorage.getItem(DRIVE_USER_KEY);
  if (token && userRaw) {
    try {
      onUser(JSON.parse(userRaw));
    } catch {
      onLogout();
    }
  } else if (token) {
    onUser({ email: 'utilisateur@drive.google.com', displayName: 'Compte Google' });
  } else {
    onLogout();
  }
  return () => {};
}

/**
 * Request OAuth Access Token via Google Identity Services popup
 */
export function requestDriveAccessToken(clientId?: string): Promise<{ token: string; user: DriveUser }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      return reject(new Error('Le service Google Identity Services n\'est pas encore chargé dans le navigateur. Veuillez réessayer dans quelques secondes.'));
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId || '1088719273491-aistudio.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (response: any) => {
          if (response.error) {
            console.error('[GoogleDrive] OAuth error:', response);
            return reject(new Error(response.error_description || response.error));
          }
          if (response.access_token) {
            const token = response.access_token;
            let user: DriveUser = {
              email: 'architecte@google.com',
              displayName: 'Architecte Connecté'
            };

            // Attempt to fetch user profile info using the token
            try {
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                user = {
                  email: profile.email || 'architecte@google.com',
                  displayName: profile.name || profile.given_name || 'Architecte',
                  photoURL: profile.picture
                };
              }
            } catch (e) {
              console.warn('Could not fetch user profile details:', e);
            }

            setStoredDriveToken(token, response.expires_in || 3600, user);
            resolve({ token, user });
          } else {
            reject(new Error('Aucun jeton d\'accès reçu.'));
          }
        },
        error_callback: (err: any) => {
          console.error('[GoogleDrive] OAuth client error:', err);
          reject(new Error('Erreur d\'autorisation Google Drive.'));
        }
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(err);
    }
  });
}

export async function googleSignIn(): Promise<{ user: DriveUser; token: string }> {
  return requestDriveAccessToken();
}

/**
 * Find or create a dedicated folder "ARCHITEXPERT_PV_BACKUPS" in Google Drive
 */
export async function createDriveFolder(folderName = 'ARCHITEXPERT_PV_BACKUPS', accessToken?: string): Promise<string> {
  const token = accessToken || getStoredDriveToken();
  if (!token) {
    const res = await requestDriveAccessToken();
    return createDriveFolder(folderName, res.token);
  }

  const cachedFolderId = localStorage.getItem(DRIVE_FOLDER_ID_KEY);
  if (cachedFolderId) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${cachedFolderId}?fields=id,trashed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.trashed) return cachedFolderId;
      }
    } catch (e) {
      console.warn('Folder verification failed:', e);
    }
  }

  // Search for existing folder by name
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id;
      localStorage.setItem(DRIVE_FOLDER_ID_KEY, folderId);
      return folderId;
    }
  }

  // Create new folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    throw new Error('Impossible de créer le dossier Google Drive.');
  }

  const createData = await createRes.json();
  const folderId = createData.id;
  localStorage.setItem(DRIVE_FOLDER_ID_KEY, folderId);
  return folderId;
}

/**
 * List files in Google Drive folder
 */
export async function listDriveFiles(accessToken?: string): Promise<DriveFileItem[]> {
  const token = accessToken || getStoredDriveToken();
  if (!token) return [];

  try {
    const folderId = await createDriveFolder('ARCHITEXPERT_PV_BACKUPS', token);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.warn('[GoogleDrive] List files error:', err);
    return [];
  }
}

/**
 * Delete a file from Google Drive
 */
export async function deleteDriveFile(fileId: string, fileName?: string, accessToken?: string): Promise<boolean> {
  const token = accessToken || getStoredDriveToken();
  if (!token) return false;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.ok;
}

/**
 * Upload a single PV document to Google Drive
 */
export async function uploadPVToDrive(
  pv: SitePV,
  project: Project | undefined,
  format: 'html' | 'json' = 'json',
  accessToken?: string
): Promise<{ fileId: string; name: string; webViewLink?: string }> {
  let token = accessToken || getStoredDriveToken();
  if (!token) {
    const authRes = await requestDriveAccessToken();
    token = authRes.token;
  }

  const folderId = await createDriveFolder('ARCHITEXPERT_PV_BACKUPS', token);
  const projectName = project ? project.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Chantier';
  const extension = format === 'html' ? 'html' : 'json';
  const fileName = `PV_${pv.number || pv.id}_${projectName}_${pv.date}.${extension}`;

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
    description: `Procès-Verbal de Chantier ${pv.number} — ${project?.name || ''} (${pv.date})`
  };

  let contentBlob: Blob;
  if (format === 'html') {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PV N° ${pv.number} - ${project?.name || ''}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b; }
          h1 { color: #0B1F3A; border-bottom: 2px solid #C9A24B; pb: 10px; }
          .meta { bg-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .obs { border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>PROCÈS-VERBAL DE CHANTIER N° ${pv.number}</h1>
        <div class="meta">
          <p><strong>Chantier :</strong> ${project?.name || ''} (${project?.code || ''})</p>
          <p><strong>Date de visite :</strong> ${pv.date}</p>
          <p><strong>Avancement Global :</strong> ${pv.overallProgress}%</p>
          <p><strong>Rédacteur :</strong> ${pv.authorName || 'Architecte'}</p>
        </div>
        <h2>Observations & Remarques (${pv.observations.length})</h2>
        ${pv.observations.map((obs, idx) => `
          <div class="obs">
            <p><strong>#${obs.number || idx + 1} - ${obs.lot}</strong> — <em>Statut: ${obs.status}</em></p>
            <p>${obs.text || 'Sans description.'}</p>
            ${obs.location ? `<p><strong>Localisation :</strong> ${obs.location}</p>` : ''}
            ${obs.assignedTo ? `<p><strong>Entreprise :</strong> ${obs.assignedTo}</p>` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
    contentBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  } else {
    const fileData = {
      pv,
      project,
      exportedAt: new Date().toISOString(),
      source: 'ARCHITEXPERT Web App'
    };
    contentBlob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
  }

  // Check if file with same name exists in folder
  const query = encodeURIComponent(`name = '${fileName}' and '${folderId}' in parents and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  let existingFileId: string | null = null;
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      existingFileId = searchData.files[0].id;
    }
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
  form.append('file', contentBlob);

  let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  let method = 'POST';

  if (existingFileId) {
    uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,webViewLink`;
    method = 'PATCH';
  }

  const uploadRes = await fetch(uploadUrl, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!uploadRes.ok) {
    throw new Error('Échec du transfert du fichier vers Google Drive.');
  }

  const result = await uploadRes.json();
  return { fileId: result.id, name: result.name || fileName, webViewLink: result.webViewLink };
}

/**
 * Upload complete database backup to Google Drive
 */
export async function uploadFullBackupToDrive(
  pvs: SitePV[],
  projects: Project[],
  office: OfficeSettings,
  profiles: UserProfile[],
  accessToken?: string
): Promise<{ fileId: string; name: string; webViewLink?: string }> {
  let token = accessToken || getStoredDriveToken();
  if (!token) {
    const authRes = await requestDriveAccessToken();
    token = authRes.token;
  }

  const folderId = await createDriveFolder('ARCHITEXPERT_PV_BACKUPS', token);
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `ARCHITEXPERT_Backup_Integral_${dateStr}.json`;

  const backupData = {
    app: 'ARCHITEXPERT',
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    office,
    profiles,
    projects,
    pvs
  };

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
    description: `Sauvegarde intégrale Architexpert (${pvs.length} PVs, ${projects.length} chantiers)`
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }));

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!uploadRes.ok) {
    throw new Error('Échec de la sauvegarde complète sur Google Drive.');
  }

  const result = await uploadRes.json();
  return { fileId: result.id, name: result.name || fileName, webViewLink: result.webViewLink };
}

/**
 * Auto-sync helper when a PV is saved in App.tsx
 */
export function autoSyncPVToDrive(pv: SitePV, project?: Project) {
  const token = getStoredDriveToken();
  if (token) {
    uploadPVToDrive(pv, project, 'json', token).catch(err => {
      console.warn('[GoogleDrive] Auto-sync background notice:', err);
    });
  }
}
