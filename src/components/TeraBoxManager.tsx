import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Download,
  ExternalLink,
  CheckCircle2,
  FolderArchive,
  FileText,
  Clock,
  Sparkles,
  Link2,
  Save,
  Info,
  Check,
  HardDrive
} from 'lucide-react';
import { SitePV, Project } from '../types';
import {
  exportPVToTeraBox,
  exportAllPVsToTeraBoxZip,
  getTeraBoxConfig,
  saveTeraBoxConfig,
  getTeraBoxSavedRecords,
  TeraBoxConfig,
  TeraBoxSaveRecord
} from '../utils/terabox';

interface TeraBoxManagerProps {
  pvs: SitePV[];
  projects: Project[];
  selectedPvId?: string;
  onClose?: () => void;
}

export const TeraBoxManager: React.FC<TeraBoxManagerProps> = ({
  pvs,
  projects,
  selectedPvId,
  onClose
}) => {
  const [config, setConfig] = useState<TeraBoxConfig>(getTeraBoxConfig());
  const [personalFolderInput, setPersonalFolderInput] = useState<string>(
    config.personalFolderUrl || 'https://www.terabox.com/main'
  );
  const [autoOpenWeb, setAutoOpenWeb] = useState<boolean>(
    config.autoOpenWebAfterDownload ?? true
  );
  const [savedConfigMessage, setSavedConfigMessage] = useState<boolean>(false);

  const [targetPvId, setTargetPvId] = useState<string>(
    selectedPvId || (pvs[0]?.id || '')
  );
  const [format, setFormat] = useState<'html' | 'json'>('html');
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportingZip, setExportingZip] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const [savedRecords, setSavedRecords] = useState<TeraBoxSaveRecord[]>([]);

  useEffect(() => {
    setSavedRecords(getTeraBoxSavedRecords());
  }, []);

  const handleSaveConfig = () => {
    const updated = saveTeraBoxConfig({
      personalFolderUrl: personalFolderInput.trim() || 'https://www.terabox.com/main',
      autoOpenWebAfterDownload: autoOpenWeb,
    });
    setConfig(updated);
    setSavedConfigMessage(true);
    setTimeout(() => setSavedConfigMessage(false), 3000);
  };

  const handleExportSelectedPV = async () => {
    const pv = pvs.find(p => p.id === targetPvId);
    if (!pv) {
      setStatusMessage({ type: 'error', text: 'Veuillez sélectionner un PV valide.' });
      return;
    }

    const proj = projects.find(p => p.id === pv.projectId);
    setExporting(true);
    setStatusMessage(null);

    try {
      const res = await exportPVToTeraBox(pv, proj, format, autoOpenWeb);
      setStatusMessage({
        type: 'success',
        text: `PV N° ${pv.number} prêt pour TeraBox ! Le fichier "${res.filename}" a été téléchargé ${
          autoOpenWeb ? 'et la page TeraBox a été ouverte dans un nouvel onglet.' : '.'
        } Glissez-le directement dans votre espace TeraBox.`
      });
      setSavedRecords(getTeraBoxSavedRecords());
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Erreur lors de la préparation du PV pour TeraBox.'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllZip = async () => {
    if (pvs.length === 0) {
      setStatusMessage({ type: 'error', text: 'Aucun PV à exporter.' });
      return;
    }

    setExportingZip(true);
    setStatusMessage(null);

    try {
      const res = await exportAllPVsToTeraBoxZip(pvs, projects, autoOpenWeb);
      setStatusMessage({
        type: 'success',
        text: `Pack complet de ${res.count} PVs généré ("${res.filename}") ! Glissez ce fichier ZIP ou décompressez-le directement sur le site TeraBox.`
      });
      setSavedRecords(getTeraBoxSavedRecords());
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Erreur lors de la création de l\'archive ZIP pour TeraBox.'
      });
    } finally {
      setExportingZip(false);
    }
  };

  const currentSelectedPV = pvs.find(p => p.id === targetPvId);
  const currentProject = projects.find(p => p.id === currentSelectedPV?.projectId);

  return (
    <div className="space-y-5">
      {/* Brand Hero Card */}
      <div className="bg-gradient-to-r from-[#0B1F3A] via-[#103A6B] to-[#0084FF] text-white p-5 rounded-xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" /> Stockage Cloud 1024 Go Gratuit (1 To)
            </div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Cloud className="w-6 h-6 text-sky-300" />
              Sauvegarde TeraBox Cloud (terabox.com)
            </h2>
            <p className="text-xs text-sky-100 leading-relaxed">
              Enregistrez, archivez et sécurisez l'ensemble de vos procès-verbaux de chantier et photos annotées directement sur le site <strong>TeraBox</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <a
              href={config.personalFolderUrl || 'https://www.terabox.com/main'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-[#0B1F3A] hover:bg-sky-50 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
              title="Ouvrir le site TeraBox dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4 text-[#0084FF]" />
              Accéder à TeraBox.com
            </a>
          </div>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 border transition ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-sky-50 text-sky-800 border-sky-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed flex-1">{statusMessage.text}</div>
        </div>
      )}

      {/* Two main actions columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Action 1: Single PV Export */}
        <div className="bg-white rounded-xl border border-[#e2ded2] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2ded2] pb-2">
              <h3 className="font-serif font-bold text-sm text-[#0B1F3A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0084FF]" />
                Enregistrer un PV Spécifique
              </h3>
              <span className="text-[10px] bg-sky-100 text-[#0084FF] px-2 py-0.5 rounded font-bold font-mono">
                1 Clic
              </span>
            </div>

            <p className="text-xs text-[#565048]">
              Prépare le procès-verbal avec ses photos annotées par flèches et son émargement, puis ouvre TeraBox pour le déposer.
            </p>

            {/* Select PV */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A] mb-1">
                Sélectionner le Procès-Verbal :
              </label>
              <select
                value={targetPvId}
                onChange={(e) => setTargetPvId(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-medium text-[#1e293b] focus:outline-none focus:border-[#0084FF]"
              >
                {pvs.map((p) => {
                  const proj = projects.find(pr => pr.id === p.projectId);
                  return (
                    <option key={p.id} value={p.id}>
                      PV N° {p.number} — {proj?.name || 'Projet'} ({p.date || 'Sans date'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Format choice */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A] mb-1">
                Format de fichier :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('html')}
                  className={`p-2 rounded-lg border text-xs font-semibold text-left transition ${
                    format === 'html'
                      ? 'border-[#0084FF] bg-sky-50 text-[#0B1F3A] ring-1 ring-[#0084FF]'
                      : 'border-[#cbd5e1] hover:bg-[#f8fafc] text-[#565048]'
                  }`}
                >
                  <div className="font-bold text-[#0B1F3A]">📄 Rapport HTML</div>
                  <div className="text-[10px] text-gray-500 font-normal">
                    Visible partout avec photos & flèches
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-2 rounded-lg border text-xs font-semibold text-left transition ${
                    format === 'json'
                      ? 'border-[#0084FF] bg-sky-50 text-[#0B1F3A] ring-1 ring-[#0084FF]'
                      : 'border-[#cbd5e1] hover:bg-[#f8fafc] text-[#565048]'
                  }`}
                >
                  <div className="font-bold text-[#0B1F3A]">⚙️ Données JSON</div>
                  <div className="text-[10px] text-gray-500 font-normal">
                    Sauvegarde brute pour restauration
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportSelectedPV}
            disabled={exporting || !targetPvId}
            className="w-full py-2.5 px-4 bg-[#0084FF] hover:bg-[#0073e6] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {exporting
              ? 'Préparation en cours...'
              : `Enregistrer le PV N° ${currentSelectedPV?.number || ''} sur TeraBox`}
          </button>
        </div>

        {/* Action 2: Bulk Export All PVs ZIP */}
        <div className="bg-white rounded-xl border border-[#e2ded2] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2ded2] pb-2">
              <h3 className="font-serif font-bold text-sm text-[#0B1F3A] flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-amber-600" />
                Pack Archive Complète (ZIP)
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold font-mono">
                {pvs.length} PVs
              </span>
            </div>

            <p className="text-xs text-[#565048]">
              Archive tous vos procès-verbaux de chantier organisés par sous-dossiers de projets dans un unique fichier ZIP, prêt à être sauvegardé sur TeraBox.
            </p>

            <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs space-y-1.5">
              <div className="font-bold text-[#0B1F3A]">Contenu de l'archive TeraBox :</div>
              <ul className="text-[11px] text-[#565048] list-disc list-inside space-y-1">
                <li>Dossiers séparés par projet ({projects.length} chantiers)</li>
                <li>Rapports HTML de chaque visite avec photos et annotations</li>
                <li>Fichier de base de données globale <code>ARCHIVE_COMPLETE_PV.json</code></li>
                <li>Fichier d'instructions <code>README_TERABOX.txt</code></li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportAllZip}
            disabled={exportingZip || pvs.length === 0}
            className="w-full py-2.5 px-4 bg-[#0B1F3A] hover:bg-[#123356] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-[#C9A24B]" />
            {exportingZip
              ? 'Compression ZIP en cours...'
              : `Télécharger l'Archive Globale (${pvs.length} PVs) pour TeraBox`}
          </button>
        </div>
      </div>

      {/* TeraBox Configuration & Instructions */}
      <div className="bg-white rounded-xl border border-[#e2ded2] p-5 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-sm text-[#0B1F3A] flex items-center justify-between border-b border-[#e2ded2] pb-2">
          <span className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#0084FF]" />
            Configuration de votre dossier TeraBox & Préférences
          </span>
          {savedConfigMessage && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" /> Enregistré !
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A]">
              Lien de votre compte ou dossier TeraBox :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={personalFolderInput}
                onChange={(e) => setPersonalFolderInput(e.target.value)}
                placeholder="https://www.terabox.com/main ou https://terabox.com/s/..."
                className="flex-1 px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-xs font-mono text-[#1e293b] focus:outline-none focus:border-[#0084FF]"
              />
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-3 py-1.5 bg-[#0B1F3A] hover:bg-[#123356] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#C9A24B]" /> Sauvegarder
              </button>
            </div>
            <p className="text-[11px] text-[#565048]">
              Par défaut : <code>https://www.terabox.com/main</code>. Vous pouvez coller le lien de partage direct de votre dossier chantier sur TeraBox.
            </p>
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="flex items-center gap-2.5 text-xs text-[#161514] font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoOpenWeb}
                onChange={(e) => {
                  setAutoOpenWeb(e.target.checked);
                  saveTeraBoxConfig({ autoOpenWebAfterDownload: e.target.checked });
                }}
                className="w-4 h-4 rounded text-[#0084FF] border-[#cbd5e1] focus:ring-[#0084FF]"
              />
              <span>Ouvrir automatiquement le site TeraBox après le téléchargement du PV</span>
            </label>
            <div className="text-[11px] text-[#565048]">
              Pratique pour glisser immédiatement le fichier dans votre navigateur sans chercher le site.
            </div>
          </div>
        </div>

        {/* 3 Simple Steps Banner */}
        <div className="bg-[#f0f7ff] border border-[#bae0ff] rounded-lg p-3.5 text-xs text-[#003a8c] space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-xs">
            <Info className="w-4 h-4 text-[#0084FF]" />
            Comment enregistrer vos PVs sur TeraBox en 3 étapes faciles :
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11.5px] leading-relaxed">
            <li>Cliquez sur <strong>« Enregistrer le PV sur TeraBox »</strong> ci-dessus pour générer le fichier.</li>
            <li>La page officielle <strong>terabox.com</strong> s'ouvre dans un nouvel onglet (connectez-vous si nécessaire).</li>
            <li>Glissez simplement le fichier téléchargé dans votre dossier TeraBox. Vous bénéficiez de <strong>1024 Go gratuits</strong> pour stocker des milliers de PVs et photos HD.</li>
          </ol>
        </div>
      </div>

      {/* Saved Records History */}
      {savedRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e2ded2] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#e2ded2] pb-1.5">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0084FF]" />
              Historique des exports TeraBox récents ({savedRecords.length})
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">Archivage local</span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-gray-100">
            {savedRecords.slice(0, 8).map((rec, rIdx) => (
              <div key={rIdx} className="pt-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0B1F3A]">PV N° {rec.pvNumber}</span>
                  {rec.projectName && (
                    <span className="text-[10px] text-gray-500">({rec.projectName})</span>
                  )}
                  <span className="text-[9px] font-mono uppercase bg-gray-100 px-1.5 py-0.2 rounded text-gray-600">
                    {rec.format}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {new Date(rec.savedAt).toLocaleDateString('fr-FR')} {new Date(rec.savedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
