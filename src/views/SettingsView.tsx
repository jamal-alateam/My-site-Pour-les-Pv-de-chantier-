import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  History,
  Clock,
  RotateCcw
} from 'lucide-react';
import { OfficeSettings, UserProfile, SitePV, Project } from '../types';
import { getHistorySnapshots, restoreSnapshot } from '../utils/storage';
import { UserPlus, Check, Edit2, Trash2 } from 'lucide-react';

import { compressImage } from '../utils/imageCompressor';
import { GoogleDriveManager } from '../components/GoogleDriveManager';
import { TeraBoxManager } from '../components/TeraBoxManager';

interface HistoryItem {
  id: string;
  timestamp: string;
  action: string;
  pvCount: number;
  projectCount: number;
}

interface SettingsViewProps {
  office: OfficeSettings;
  pvs?: SitePV[];
  projects?: Project[];
  onSaveOffice: (settings: OfficeSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onLoadDemoData: () => void;
  onRestoreSnapshot?: (snapshotId: string) => void;
  profiles?: UserProfile[];
  activeProfileId?: string;
  onSelectProfile?: (id: string) => void;
  onOpenProfileModal?: () => void;
  onDeleteProfile?: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  office,
  pvs = [],
  projects = [],
  onSaveOffice,
  onExportBackup,
  onImportBackup,
  onLoadDemoData,
  onRestoreSnapshot,
  profiles = [],
  activeProfileId = '',
  onSelectProfile,
  onOpenProfileModal,
  onDeleteProfile
}) => {
  const [formData, setFormData] = useState<OfficeSettings>(office);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const snaps = await getHistorySnapshots();
    setHistoryItems(snaps);
    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOffice(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedLogo = await compressImage(file, 500, 500, 0.85);
      setFormData(prev => ({ ...prev, logoUrl: compressedLogo }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-md border border-[#e2ded2] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#0B1F3A]" />
          <div>
            <h2 className="font-serif font-bold text-lg text-[#161514]">
              Configuration & En-tête Officiel
            </h2>
            <p className="text-xs text-[#565048]">
              Personnalisez les coordonnées du cabinet figurant sur vos procès-verbaux
            </p>
          </div>
        </div>

        {saveSuccess && (
          <span className="text-xs font-bold text-[#2c6b4d] bg-[#e1efe6] px-3 py-1.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Modifications enregistrées !
          </span>
        )}
      </div>

      {/* Office Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-md border border-[#e2ded2] shadow-sm p-6 space-y-6">
        <h3 className="font-serif font-bold text-base text-[#0B1F3A] border-b border-[#e2ded2] pb-2">
          Coordonnées Professionnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Nom du Cabinet / Enseigne *
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Nom & Prénom Professionnel *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Titre / Qualité *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: Dessinateur-Projeteur, Architecte DPLG..."
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Téléphone *
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Adresse Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
              Ville & Pays *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
            Adresse du Cabinet
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-1">
            Mention Légale de Bas de Page
          </label>
          <textarea
            rows={2}
            value={formData.legalMention || ''}
            onChange={e => setFormData({ ...formData, legalMention: e.target.value })}
            className="w-full px-3 py-2 border border-[#c9c3b1] rounded focus:outline-none focus:border-[#0B1F3A] text-xs font-mono"
          />
        </div>

        {/* Custom Logo Upload */}
        <div className="border-t border-[#e2ded2] pt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#565048] mb-2">
            Logo Personnalisé pour En-tête
          </label>
          <div className="flex items-center gap-4">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo Cabinet" className="w-16 h-16 object-contain border p-1 rounded" />
            ) : (
              <div className="w-16 h-16 bg-[#f6f4ef] border border-dashed border-[#c9c3b1] rounded flex items-center justify-center text-xs text-gray-400">
                Logo
              </div>
            )}
            <label className="cursor-pointer bg-[#f6f4ef] hover:bg-[#efece4] text-[#0B1F3A] px-4 py-2 border border-[#c9c3b1] rounded text-xs font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Importer un logo (PNG / JPG)
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e2ded2] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0B1F3A] text-white font-bold text-xs rounded hover:bg-[#123356] transition shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#C9A24B]" /> Enregistrer les paramètres
          </button>
        </div>
      </form>

      {/* Profils Utilisateurs & Équipe */}
      <div className="bg-white dark:bg-[#131b26] rounded-md border border-[#e2ded2] dark:border-[#233144] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e2ded2] dark:border-[#233144] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0B1F3A] text-[#C9A24B] rounded-lg flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#0B1F3A] dark:text-[#93c5fd]">
                Membres de l'Équipe & Profils Rédacteurs
              </h3>
              <p className="text-xs text-[#565048] dark:text-[#94a3b8]">
                Basculez d'utilisateur actif ou gérez les profils d'intervenants sur le chantier
              </p>
            </div>
          </div>

          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="px-3.5 py-1.5 bg-[#0B1F3A] text-white text-xs font-bold rounded-md hover:bg-[#123356] transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-[#C9A24B]" /> + Ajouter un membre
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profiles.map(p => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-lg border transition flex items-center justify-between ${
                  isActive
                    ? 'border-[#0B1F3A] bg-[#f0f4f8] dark:bg-[#1a2f4a] dark:border-[#3b82f6]'
                    : 'border-[#e2ded2] dark:border-[#233144] bg-[#f6f4ef] dark:bg-[#1a2433]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border-2 shadow-2xs shrink-0"
                      style={{ borderColor: p.color || '#0B1F3A' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0"
                      style={{ backgroundColor: p.color || '#0B1F3A' }}
                    >
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#0B1F3A] dark:text-[#f1f5f9] truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-[#565048] dark:text-[#94a3b8] truncate">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold truncate">
                      {p.organization}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isActive ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold">
                      Actif
                    </span>
                  ) : (
                    onSelectProfile && (
                      <button
                        onClick={() => onSelectProfile(p.id)}
                        className="px-2.5 py-1 border border-[#c9c3b1] bg-white dark:bg-[#131b26] hover:bg-[#0B1F3A] hover:text-white rounded text-[10px] font-bold transition"
                      >
                        Activer
                      </button>
                    )
                  )}

                  {profiles.length > 1 && !p.isDefault && onDeleteProfile && (
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le profil de ${p.name} ?`)) {
                          onDeleteProfile(p.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Drive Integration Section */}
      <GoogleDriveManager pvs={pvs} projects={projects} />

      {/* TeraBox Cloud Storage Integration Section */}
      <TeraBoxManager pvs={pvs} projects={projects} />

      {/* Data Management & Backup Section */}
      <div className="bg-white rounded-md border border-[#e2ded2] shadow-sm p-6 space-y-4">
        <h3 className="font-serif font-bold text-base text-[#0B1F3A] border-b border-[#e2ded2] pb-2">
          Gestion des Données & Sauvegardes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#f6f4ef] rounded border border-[#e2ded2] space-y-2">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#0B1F3A]" /> Sauvegarde JSON
            </h4>
            <p className="text-[11px] text-[#565048]">
              Téléchargez un fichier de sauvegarde contenant l'ensemble de vos projets et PVs.
            </p>
            <button
              onClick={onExportBackup}
              className="w-full mt-2 px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-semibold rounded hover:bg-[#123356]"
            >
              Exporter les données
            </button>
          </div>

          <div className="p-4 bg-[#f6f4ef] rounded border border-[#e2ded2] space-y-2">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#0B1F3A]" /> Restauration JSON
            </h4>
            <p className="text-[11px] text-[#565048]">
              Restaurez vos données à partir d'un fichier JSON préalablement sauvegardé.
            </p>
            <label className="block w-full text-center mt-2 px-3 py-1.5 border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white text-xs font-semibold rounded cursor-pointer transition">
              Restaurer un fichier
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={e => e.target.files?.[0] && onImportBackup(e.target.files[0])}
              />
            </label>
          </div>

          <div className="p-4 bg-[#f6f4ef] rounded border border-[#e2ded2] space-y-2">
            <h4 className="font-bold text-xs text-[#0B1F3A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" /> Données de Démo
            </h4>
            <p className="text-[11px] text-[#565048]">
              Réinitialisez et réinjectez les chantiers d'exemple (Résidence Anfa Sky, etc.).
            </p>
            <button
              onClick={onLoadDemoData}
              className="w-full mt-2 px-3 py-1.5 bg-[#C9A24B] text-[#0B1F3A] font-bold text-xs rounded hover:bg-[#b08b3a]"
            >
              Charger la Démo
            </button>
          </div>
        </div>
      </div>

      {/* Historique des Points de Sauvegarde Automatiques */}
      <div className="bg-white rounded-md border border-[#e2ded2] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e2ded2] pb-2">
          <h3 className="font-serif font-bold text-base text-[#0B1F3A] flex items-center gap-2">
            <History className="w-5 h-5 text-[#C9A24B]" />
            Historique des Modifications & Sauvegardes Automatiques
          </h3>
          <button
            onClick={loadHistory}
            className="text-xs text-[#0B1F3A] hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>

        <p className="text-xs text-[#565048]">
          Chaque création ou modification de PV et de chantier crée automatiquement un point de restauration sécurisé dans la base locale (IndexedDB).
        </p>

        {historyItems.length === 0 ? (
          <div className="p-4 bg-[#f6f4ef] border border-[#e2ded2] rounded text-center text-xs text-[#565048]">
            Aucun point d'historique antérieur enregistré. Vos modifications futures généreront des instantanés automatiques.
          </div>
        ) : (
          <div className="divide-y divide-[#e2ded2] border border-[#e2ded2] rounded-md overflow-hidden max-h-60 overflow-y-auto">
            {historyItems.map((item) => (
              <div key={item.id} className="p-3 bg-white hover:bg-[#f6f4ef] transition flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0B1F3A]/10 text-[#0B1F3A] rounded">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#161514]">{item.action}</div>
                    <div className="text-[10px] text-[#565048] font-mono">
                      {new Date(item.timestamp).toLocaleString('fr-FR')} — {item.pvCount} PV(s), {item.projectCount} Chantier(s)
                    </div>
                  </div>
                </div>

                {onRestoreSnapshot && (
                  <button
                    onClick={() => {
                      if (confirm(`Restaurer cet instantané du ${new Date(item.timestamp).toLocaleString('fr-FR')} ?`)) {
                        onRestoreSnapshot(item.id);
                      }
                    }}
                    className="px-2.5 py-1 bg-[#0B1F3A] text-white hover:bg-[#123356] rounded text-[11px] font-semibold transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-[#C9A24B]" /> Restaurer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
