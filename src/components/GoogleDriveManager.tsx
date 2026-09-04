import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FolderPlus,
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  HardDrive
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  listDriveFiles,
  uploadPVToDrive,
  createDriveFolder,
  deleteDriveFile,
  DriveFileItem
} from '../utils/googleDrive';
import { SitePV, Project } from '../types';

interface GoogleDriveManagerProps {
  pvs: SitePV[];
  projects: Project[];
  selectedPvId?: string;
  onClose?: () => void;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  pvs,
  projects,
  selectedPvId
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [targetPvId, setTargetPvId] = useState<string>(selectedPvId || (pvs[0]?.id || ''));
  const [exportFormat, setExportFormat] = useState<'html' | 'json'>('html');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        setUserName(user.displayName);
        setUserPhoto(user.photoURL);
        fetchFiles();
      },
      () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserName(null);
        setUserPhoto(null);
        setFiles([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const fileList = await listDriveFiles();
      setFiles(fileList);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Erreur lors de la récupération des fichiers Drive.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setIsAuthenticated(true);
        setUserEmail(result.user.email);
        setUserName(result.user.displayName);
        setUserPhoto(result.user.photoURL);
        setStatusMessage({ type: 'success', text: 'Connexion réussie à Google Drive !' });
        await fetchFiles();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Échec de la connexion à Google Drive.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setIsAuthenticated(false);
    setUserEmail(null);
    setFiles([]);
    setStatusMessage({ type: 'info', text: 'Déconnecté de Google Drive.' });
  };

  const handleUploadSelectedPV = async () => {
    const pv = pvs.find(p => p.id === targetPvId);
    if (!pv) {
      setStatusMessage({ type: 'error', text: 'Veuillez sélectionner un PV valide.' });
      return;
    }

    const proj = projects.find(p => p.id === pv.projectId);
    setUploading(true);
    setStatusMessage(null);

    try {
      const res = await uploadPVToDrive(pv, proj, exportFormat);
      setStatusMessage({
        type: 'success',
        text: `Le PV N° ${pv.number} a été exporté vers Google Drive avec succès ("${res.name}") !`
      });
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Échec de l\'envoi du fichier vers Google Drive.' });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDedicatedFolder = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const folderName = 'PV de Chantier — Abdelali Miman';
      const folderId = await createDriveFolder(folderName);
      setStatusMessage({
        type: 'success',
        text: `Dossier Google Drive "${folderName}" créé avec succès (ID: ${folderId.substring(0, 8)}...) !`
      });
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Échec de la création du dossier.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (file: DriveFileItem) => {
    try {
      const deleted = await deleteDriveFile(file.id, file.name);
      if (deleted) {
        setStatusMessage({ type: 'success', text: `Fichier "${file.name}" supprimé de Google Drive.` });
        setFiles(prev => prev.filter(f => f.id !== file.id));
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Erreur lors de la suppression.' });
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-[#e2ded2] dark:border-[#334155] shadow-lg p-5 space-y-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2ded2] dark:border-[#334155] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center font-bold">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A] dark:text-[#f1f5f9] flex items-center gap-2">
              Google Drive Cloud Integration
              {isAuthenticated && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e1efe6] text-[#2c6b4d] rounded-full border border-[#2c6b4d]/30 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connecté
                </span>
              )}
            </h3>
            <p className="text-xs text-[#565048] dark:text-[#94a3b8]">
              Exportez, sauvegardez et gérez vos Procès-Verbaux de Chantier directement dans votre espace Google Drive.
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 bg-[#f6f4ef] dark:bg-[#0f172a] px-3 py-1.5 rounded-lg border border-[#c9c3b1] dark:border-[#475569]">
            {userPhoto ? (
              <img src={userPhoto} alt={userName || ''} className="w-7 h-7 rounded-full border border-gray-300" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#0B1F3A] text-white text-xs font-bold flex items-center justify-center">
                {(userName || userEmail || 'U').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-xs">
              <div className="font-bold text-[#0B1F3A] dark:text-[#f1f5f9]">{userName || 'Compte Google'}</div>
              <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{userEmail}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
              title="Déconnexion de Google Drive"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="gsi-material-button inline-flex items-center justify-center cursor-pointer shadow-xs hover:shadow-md transition"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #747775',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              <div className="flex items-center gap-2">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span className="text-xs font-bold text-[#1f1f1f]">Se connecter avec Google Drive</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Notification banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-[#e1efe6] text-[#2c6b4d] border-[#2c6b4d]/30'
              : statusMessage.type === 'error'
              ? 'bg-[#fbeae8] text-[#9e2a2b] border-[#9e2a2b]/30'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs font-bold underline cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      {/* Content for authenticated user */}
      {isAuthenticated ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Box: Export PV to Google Drive */}
          <div className="md:col-span-1 bg-[#f6f4ef] dark:bg-[#0f172a] p-4 rounded-lg border border-[#e2ded2] dark:border-[#334155] space-y-4">
            <h4 className="text-xs font-bold text-[#0B1F3A] dark:text-[#f1f5f9] uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-[#C9A24B]" /> Exporter un PV vers Drive
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-[#565048] dark:text-[#94a3b8] mb-1">
                Choisir le Procès-Verbal :
              </label>
              <select
                value={targetPvId}
                onChange={e => setTargetPvId(e.target.value)}
                className="w-full p-2 bg-white dark:bg-[#1e293b] border border-[#c9c3b1] dark:border-[#475569] rounded text-xs font-medium focus:outline-none focus:border-[#0B1F3A]"
              >
                {pvs.map(pv => {
                  const proj = projects.find(p => p.id === pv.projectId);
                  return (
                    <option key={pv.id} value={pv.id}>
                      PV N° {pv.number} — {proj?.name || 'Chantier'} ({new Date(pv.date).toLocaleDateString('fr-FR')})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#565048] dark:text-[#94a3b8] mb-1">
                Format de fichier :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('html')}
                  className={`p-2 rounded border text-xs font-bold text-center cursor-pointer transition ${
                    exportFormat === 'html'
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                      : 'bg-white dark:bg-[#1e293b] text-[#565048] border-[#c9c3b1]'
                  }`}
                >
                  Document HTML
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`p-2 rounded border text-xs font-bold text-center cursor-pointer transition ${
                    exportFormat === 'json'
                      ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                      : 'bg-white dark:bg-[#1e293b] text-[#565048] border-[#c9c3b1]'
                  }`}
                >
                  Sauvegarde JSON
                </button>
              </div>
            </div>

            <button
              onClick={handleUploadSelectedPV}
              disabled={uploading || pvs.length === 0}
              className="w-full py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold rounded shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Transfert en cours...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Sauvegarder dans Google Drive
                </>
              )}
            </button>

            <div className="pt-2 border-t border-[#e2ded2] dark:border-[#334155]">
              <button
                onClick={handleCreateDedicatedFolder}
                disabled={loading}
                className="w-full py-2 bg-white dark:bg-[#1e293b] hover:bg-[#efece4] text-[#0B1F3A] dark:text-[#f1f5f9] border border-[#c9c3b1] text-xs font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <FolderPlus className="w-4 h-4 text-[#4285F4]" /> Créer Dossier Site Drive
              </button>
            </div>
          </div>

          {/* List of Files in Drive */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0B1F3A] dark:text-[#f1f5f9] uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-[#4285F4]" /> Fichiers Google Drive ({files.length})
              </h4>
              <button
                onClick={fetchFiles}
                disabled={loading}
                className="p-1.5 text-xs font-medium text-[#565048] hover:text-[#0B1F3A] dark:text-[#94a3b8] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
              </button>
            </div>

            {files.length === 0 ? (
              <div className="p-8 text-center bg-[#f6f4ef] dark:bg-[#0f172a] rounded-lg border border-dashed border-[#c9c3b1] dark:border-[#475569]">
                <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-[#565048] dark:text-[#94a3b8] font-medium">
                  {loading ? 'Chargement de vos fichiers Google Drive...' : 'Aucun fichier de PV trouvé dans votre Google Drive.'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Exportez un PV ci-contre pour le retrouver instantanément dans votre cloud Google Drive.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="p-3 bg-[#f6f4ef] dark:bg-[#0f172a] rounded-lg border border-[#e2ded2] dark:border-[#334155] flex items-center justify-between gap-3 hover:border-[#4285F4] transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-[#4285F4] shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#0B1F3A] dark:text-[#f1f5f9] truncate">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {file.modifiedTime ? `Modifié le ${new Date(file.modifiedTime).toLocaleDateString('fr-FR')}` : 'Document Drive'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white dark:bg-[#1e293b] border border-[#c9c3b1] dark:border-[#475569] hover:bg-[#4285F4] hover:text-white hover:border-[#4285F4] text-[#0B1F3A] dark:text-[#f1f5f9] text-[11px] font-bold rounded inline-flex items-center gap-1 transition"
                          title="Ouvrir dans Google Drive"
                        >
                          <ExternalLink className="w-3 h-3" /> Ouvrir
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
                        title="Supprimer de Google Drive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#f6f4ef] dark:bg-[#0f172a] rounded-xl border border-dashed border-[#c9c3b1] dark:border-[#475569] space-y-3">
          <Cloud className="w-12 h-12 text-[#4285F4] mx-auto animate-pulse" />
          <h4 className="text-sm font-bold text-[#0B1F3A] dark:text-[#f1f5f9]">
            Connectez votre compte Google pour débloquer l'export Google Drive
          </h4>
          <p className="text-xs text-[#565048] dark:text-[#94a3b8] max-w-md mx-auto">
            Sauvegardez automatiquement vos procès-verbaux de chantier sur Google Drive, organisez-les par dossiers de projets et partagez-les en un clic avec vos maîtres d'ouvrage et entreprises.
          </p>
        </div>
      )}
    </div>
  );
};
