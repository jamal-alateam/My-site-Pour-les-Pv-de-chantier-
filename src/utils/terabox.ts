import JSZip from 'jszip';
import { SitePV, Project } from '../types';

export interface TeraBoxSaveRecord {
  pvId: string;
  pvNumber: string;
  projectName?: string;
  savedAt: string;
  format: 'html' | 'json' | 'zip';
}

const STORAGE_KEY_TERABOX_CONFIG = 'ARCHITEXPERT_TERABOX_CONFIG';
const STORAGE_KEY_TERABOX_RECORDS = 'ARCHITEXPERT_TERABOX_RECORDS';

export interface TeraBoxConfig {
  personalFolderUrl?: string; // e.g. https://www.terabox.com/s/... or custom space
  autoOpenWebAfterDownload?: boolean;
}

export function getTeraBoxConfig(): TeraBoxConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TERABOX_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse TeraBox config', e);
  }
  return {
    personalFolderUrl: 'https://www.terabox.com/main',
    autoOpenWebAfterDownload: true,
  };
}

export function saveTeraBoxConfig(config: Partial<TeraBoxConfig>): TeraBoxConfig {
  const current = getTeraBoxConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY_TERABOX_CONFIG, JSON.stringify(updated));
  return updated;
}

export function getTeraBoxSavedRecords(): TeraBoxSaveRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TERABOX_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse TeraBox records', e);
  }
  return [];
}

export function recordTeraBoxSave(pvId: string, pvNumber: string, projectName?: string, format: 'html' | 'json' | 'zip' = 'html') {
  const records = getTeraBoxSavedRecords();
  const newRecord: TeraBoxSaveRecord = {
    pvId,
    pvNumber,
    projectName,
    savedAt: new Date().toISOString(),
    format,
  };
  const filtered = records.filter(r => r.pvId !== pvId);
  filtered.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY_TERABOX_RECORDS, JSON.stringify(filtered.slice(0, 100)));
}

/**
 * Generate a complete standalone HTML document for a PV, ready to be viewed directly from TeraBox
 */
export function generateStandalonePVHtml(pv: SitePV, project?: Project): string {
  const projectTitle = project ? `${project.name} (${project.code})` : 'Chantier';
  const client = project?.client || 'Non spécifié';
  const location = project?.address || project?.city || 'Maroc';

  // Build photo gallery HTML with annotations if any
  const galleryHtml = (pv.galleryPhotos && pv.galleryPhotos.length > 0)
    ? `
      <div class="section-title">3. GALERIE PHOTOS & REPÉRAGES CHANTIER (16:9) (${pv.galleryPhotos.length} photos)</div>
      <div class="photo-grid">
        ${pv.galleryPhotos.map((photo, pIdx) => {
          const annotations = photo.annotations || [];
          return `
            <div class="photo-card">
              <div class="photo-container">
                <img src="${photo.url}" alt="${photo.caption || `Photo ${pIdx + 1}`}" />
                ${annotations.length > 0 ? `
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="annotations-svg">
                    <defs>
                      ${annotations.map((ann, aIdx) => `
                        <marker id="arrow-${pIdx}-${aIdx}" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                          <polygon points="0 0.5, 4.5 2.5, 0 4.5, 1 2.5" fill="${ann.color || '#DC2626'}" stroke="#ffffff" stroke-width="0.3"/>
                        </marker>
                      `).join('')}
                    </defs>
                    ${annotations.map((ann, aIdx) => `
                      <line x1="${ann.startX}" y1="${ann.startY}" x2="${ann.targetX}" y2="${ann.targetY}" stroke="${ann.color || '#DC2626'}" stroke-width="1.2" marker-end="url(#arrow-${pIdx}-${aIdx})"/>
                      <circle cx="${ann.targetX}" cy="${ann.targetY}" r="1.2" fill="#ffffff" stroke="${ann.color || '#DC2626'}" stroke-width="0.5"/>
                      <circle cx="${ann.startX}" cy="${ann.startY}" r="1.5" fill="${ann.color || '#DC2626'}" stroke="#ffffff" stroke-width="0.5"/>
                    `).join('')}
                  </svg>
                  <div class="badges-overlay">
                    ${annotations.map((ann, aIdx) => `
                      <div class="badge" style="left: ${ann.startX}%; top: ${ann.startY}%; background-color: ${ann.color || '#DC2626'};">
                        [${aIdx + 1}] ${ann.text}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="photo-caption">
                <strong>Photo N°${pIdx + 1}</strong> — ${photo.caption || 'Vue chantier'}
                ${photo.lot ? `<span class="tag">${photo.lot}</span>` : ''}
              </div>
              ${annotations.length > 0 ? `
                <div class="photo-ann-list">
                  ${annotations.map((ann, aIdx) => `
                    <div class="ann-item" style="border-left: 3px solid ${ann.color || '#DC2626'}">
                      <strong>[${aIdx + 1}]</strong> ${ann.text}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PV N° ${pv.number} - ${projectTitle} | ARCHITEXPERT - TeraBox Archive</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
      padding: 24px 16px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      padding: 32px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0B1F3A;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 20px;
      color: #0B1F3A;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header-left .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .badge-terabox {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0084FF;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-box {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .meta-item strong {
      color: #0B1F3A;
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0B1F3A;
      background: #f8fafc;
      border-left: 4px solid #C9A24B;
      padding: 8px 12px;
      margin: 24px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 20px;
    }
    th {
      background: #0B1F3A;
      color: #ffffff;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 10px;
    }
    .status-todo { background: #fee2e2; color: #b91c1c; }
    .status-progress { background: #fef3c7; color: #b45309; }
    .status-done { background: #dcfce7; color: #15803d; }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 12px;
    }
    .photo-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      padding: 8px;
    }
    .photo-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 4px;
      overflow: hidden;
    }
    .photo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .annotations-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .badges-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .badge {
      position: absolute;
      transform: translate(-50%, -50%);
      color: #ffffff;
      font-size: 9px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 9999px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.8);
      white-space: nowrap;
    }
    .photo-caption {
      font-size: 11px;
      margin-top: 6px;
      color: #334155;
    }
    .photo-ann-list {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ann-item {
      font-size: 10px;
      background: #ffffff;
      padding: 3px 6px;
      border-radius: 2px;
    }
    .tag {
      background: #e2e8f0;
      color: #334155;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      margin-left: 6px;
    }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h1>PROCÈS-VERBAL DE CHANTIER N° ${pv.number}</h1>
        <div class="subtitle">Rapport de Visite Hebdomadaire & Contrôle des Travaux</div>
      </div>
      <div class="badge-terabox">
        📦 Archive TeraBox Cloud
      </div>
    </div>

    <div class="meta-box">
      <div class="meta-item">
        <strong>Chantier / Projet</strong>
        ${projectTitle}
      </div>
      <div class="meta-item">
        <strong>Date de Visite</strong>
        ${pv.date ? new Date(pv.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
      </div>
      <div class="meta-item">
        <strong>Maître d'Ouvrage</strong>
        ${client}
      </div>
      <div class="meta-item">
        <strong>Localisation</strong>
        ${location}
      </div>
      <div class="meta-item">
        <strong>Avancement Global</strong>
        ${pv.overallProgress}%
      </div>
      <div class="meta-item">
        <strong>Rédacteur</strong>
        ${pv.authorName || 'Architecte'}
      </div>
    </div>

    ${pv.generalNotes ? `
      <div class="section-title">1. Ordre du Jour & Constats Généraux</div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 4px; font-size: 12px; line-height: 1.6;">
        ${pv.generalNotes.replace(/\n/g, '<br/>')}
      </div>
    ` : ''}

    <div class="section-title">2. Observations, Réserves & Instructions (${pv.observations.length})</div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">N°</th>
          <th style="width: 120px;">Lot</th>
          <th>Description du constat</th>
          <th style="width: 100px;">Assigné à</th>
          <th style="width: 80px;">Échéance</th>
          <th style="width: 80px;">Statut</th>
        </tr>
      </thead>
      <tbody>
        ${pv.observations.map((obs, idx) => {
          let statusClass = 'status-todo';
          if (obs.status === 'En cours') statusClass = 'status-progress';
          if (obs.status === 'Terminé' || obs.status === 'Achevé') statusClass = 'status-done';

          return `
            <tr>
              <td><strong>#${obs.number || idx + 1}</strong></td>
              <td><strong>${obs.lot || 'Tous lots'}</strong></td>
              <td>
                ${obs.text}
                ${obs.location ? `<div style="font-size: 10px; color: #64748b;">Localisation: ${obs.location}</div>` : ''}
              </td>
              <td>${obs.assignedTo || '—'}</td>
              <td>${obs.dueDate || 'Immédiat'}</td>
              <td><span class="status-pill ${statusClass}">${obs.status}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    ${galleryHtml}

    <div class="footer">
      <div>Généré par ARCHITEXPERT • Format d'archivage Cloud certifié</div>
      <div>Compatible TeraBox Cloud Storage (1024 Go)</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers browser download of a Blob
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Clean string for safe filenames
 */
function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
}

/**
 * Export a single PV for TeraBox
 */
export async function exportPVToTeraBox(
  pv: SitePV,
  project?: Project,
  format: 'html' | 'json' = 'html',
  openTeraBoxWeb = true
): Promise<{ filename: string; size: number }> {
  const safeProj = sanitizeFilename(project?.name || 'Chantier');
  const safeNum = sanitizeFilename(pv.number || 'PV');
  const safeDate = pv.date ? sanitizeFilename(pv.date) : 'date';

  let blob: Blob;
  let filename: string;

  if (format === 'html') {
    const html = generateStandalonePVHtml(pv, project);
    blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    filename = `TERABOX_PV_${safeNum}_${safeProj}_${safeDate}.html`;
  } else {
    const data = {
      teraboxPackage: true,
      exportedAt: new Date().toISOString(),
      pv,
      project,
    };
    blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    filename = `TERABOX_PV_${safeNum}_${safeProj}_${safeDate}.json`;
  }

  // Trigger file download to user's computer
  triggerFileDownload(blob, filename);

  // Record save
  recordTeraBoxSave(pv.id, pv.number, project?.name, format);

  // Open TeraBox web in a new tab if requested
  if (openTeraBoxWeb) {
    const config = getTeraBoxConfig();
    const destinationUrl = config.personalFolderUrl || 'https://www.terabox.com/main';
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  }

  return { filename, size: blob.size };
}

/**
 * Export a ZIP bundle of multiple PVs for TeraBox (Pack Dossier Chantier)
 */
export async function exportAllPVsToTeraBoxZip(
  pvs: SitePV[],
  projects: Project[],
  openTeraBoxWeb = true
): Promise<{ filename: string; size: number; count: number }> {
  const zip = new JSZip();

  // Root README for TeraBox folder
  const readmeContent = `ARCHITEXPERT — ARCHIVE DES PROCÈS-VERBAUX DE CHANTIER POUR TERABOX
========================================================================
Date d'export : ${new Date().toLocaleString('fr-FR')}
Nombre de PVs : ${pvs.length}
Nombre de Projets : ${projects.length}

Instructions pour TeraBox :
1. Glissez ce dossier ou les fichiers HTML/JSON directement dans votre espace TeraBox (1024 Go gratuits).
2. Chaque fichier HTML est autonome et peut être ouvert dans n'importe quel navigateur (sur PC, Mac ou smartphone).
3. Les photos avec repérages fléchés sont incluses directement dans les rapports HTML.
`;
  zip.file('README_TERABOX.txt', readmeContent);

  // Index JSON file
  const fullBackupData = {
    archiveDate: new Date().toISOString(),
    source: 'ARCHITEXPERT Chantier',
    pvCount: pvs.length,
    pvs,
    projects,
  };
  zip.file('ARCHIVE_COMPLETE_PV.json', JSON.stringify(fullBackupData, null, 2));

  // Add individual HTML files organized by project
  pvs.forEach((pv) => {
    const proj = projects.find(p => p.id === pv.projectId);
    const projFolder = sanitizeFilename(proj?.name || 'Projets_Divers');
    const safeNum = sanitizeFilename(pv.number);
    const safeDate = sanitizeFilename(pv.date || 'date');

    const html = generateStandalonePVHtml(pv, proj);
    zip.file(`${projFolder}/PV_${safeNum}_${safeDate}.html`, html);
  });

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const filename = `TERABOX_ARCHIVE_PVS_${new Date().toISOString().slice(0, 10)}.zip`;
  triggerFileDownload(content, filename);

  // Mark all pvs as saved
  pvs.forEach((pv) => {
    const proj = projects.find(p => p.id === pv.projectId);
    recordTeraBoxSave(pv.id, pv.number, proj?.name, 'zip');
  });

  if (openTeraBoxWeb) {
    const config = getTeraBoxConfig();
    const destinationUrl = config.personalFolderUrl || 'https://www.terabox.com/main';
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  }

  return { filename, size: content.size, count: pvs.length };
}
