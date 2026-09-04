import React, { useState } from 'react';
import {
  Printer,
  Edit,
  Copy,
  ArrowLeft,
  Calendar,
  Clock,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MapPin,
  Building,
  User,
  ExternalLink,
  Download,
  Share2,
  PenTool,
  X,
  Camera,
  HardDrive
} from 'lucide-react';
import { SitePV, Project, OfficeSettings, Participant, PhotoArrowAnnotation } from '../types';
import { BrandLogo } from './BrandLogo';
import { SignaturePad } from './SignaturePad';
import { GoogleDriveManager } from './GoogleDriveManager';
import { TeraBoxManager } from './TeraBoxManager';
import { PhotoWithAnnotations } from './PhotoWithAnnotations';
import { PhotoAnnotatorModal } from './PhotoAnnotatorModal';

interface PVDetailViewProps {
  pv: SitePV;
  project?: Project;
  office: OfficeSettings;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onSavePV?: (updatedPv: SitePV) => void;
}

export const PVDetailView: React.FC<PVDetailViewProps> = ({
  pv,
  project,
  office,
  onBack,
  onEdit,
  onDuplicate,
  onSavePV
}) => {
  const [isCompactA4, setIsCompactA4] = useState<boolean>(true);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [showTeraBoxModal, setShowTeraBoxModal] = useState<boolean>(false);
  const [annotatorModalOpen, setAnnotatorModalOpen] = useState<boolean>(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const handleOpenPhotoAnnotator = (index: number) => {
    setSelectedPhotoIndex(index);
    setAnnotatorModalOpen(true);
  };

  const handleUpdatePhotoAnnotations = (photoIndex: number, newAnnotations: PhotoArrowAnnotation[]) => {
    if (!pv.galleryPhotos) return;
    const updatedPhotos = [...pv.galleryPhotos];
    if (updatedPhotos[photoIndex]) {
      updatedPhotos[photoIndex] = {
        ...updatedPhotos[photoIndex],
        annotations: newAnnotations
      };
      const updatedPv: SitePV = {
        ...pv,
        galleryPhotos: updatedPhotos,
        updatedAt: new Date().toISOString()
      };
      if (onSavePV) {
        onSavePV(updatedPv);
      }
    }
  };

  // Digital Signature Pad Modal State
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [activeSignerName, setActiveSignerName] = useState<string>('');
  const [tempSignatureUrl, setTempSignatureUrl] = useState<string>('');

  // Fallback participants list if pv.participants is empty
  const displayParticipants: Participant[] = (pv.participants && pv.participants.length > 0)
    ? pv.participants
    : [
        { id: 'p_arch', name: office.name || 'Abdelali Miman', organization: office.brand || 'ARCHITEXPERT', role: 'Architecte', status: 'Présent' },
        { id: 'p_client', name: project?.client || "Maître d'Ouvrage", organization: 'Client', role: "Maître d'Ouvrage", status: 'Présent' },
        { id: 'p_contractor', name: project?.lots?.[0]?.companyName || 'Entrepreneur Principal', organization: project?.lots?.[0]?.companyName || 'Entreprise', role: 'Entrepreneur Principal', status: 'Présent' }
      ];

  const getSignatureForParticipant = (p: Participant, idx: number) => {
    if (!pv.signatures) return undefined;
    if (pv.signatures[p.id]) return pv.signatures[p.id];
    if (pv.signatures[p.name]) return pv.signatures[p.name];

    const roleLower = (p.role || '').toLowerCase();
    if (roleLower.includes('arch') && pv.signatures.architect) return pv.signatures.architect;
    if ((roleLower.includes('maître') || roleLower.includes('client') || roleLower.includes('moa')) && pv.signatures.client) return pv.signatures.client;
    if ((roleLower.includes('entrepr') || roleLower.includes('entreprise') || roleLower.includes('moe')) && pv.signatures.contractor) return pv.signatures.contractor;

    if (idx === 0 && pv.signatures.architect) return pv.signatures.architect;
    if (idx === 1 && pv.signatures.client) return pv.signatures.client;
    if (idx === 2 && pv.signatures.contractor) return pv.signatures.contractor;

    return undefined;
  };

  const openSignatureModalForParticipant = (p: Participant, idx: number) => {
    const currentSig = getSignatureForParticipant(p, idx);
    setActiveParticipant(p);
    setActiveSignerName(currentSig?.signerName || p.name);
    setTempSignatureUrl(currentSig?.dataUrl || '');
  };

  const handleSaveDigitalSignature = () => {
    if (!activeParticipant) return;
    const now = new Date().toLocaleDateString('fr-FR');
    const roleName = `${activeParticipant.role} (${activeParticipant.organization})`;

    const sigObj = {
      signerName: activeSignerName || activeParticipant.name,
      roleName: roleName,
      dataUrl: tempSignatureUrl,
      date: now
    };

    const updatedSignatures = {
      ...pv.signatures,
      [activeParticipant.id]: sigObj,
      [activeParticipant.name]: sigObj
    };

    const rLower = (activeParticipant.role || '').toLowerCase();
    if (rLower.includes('arch')) updatedSignatures.architect = sigObj;
    if (rLower.includes('maître') || rLower.includes('client')) updatedSignatures.client = sigObj;
    if (rLower.includes('entrepr')) updatedSignatures.contractor = sigObj;

    const updatedPv: SitePV = {
      ...pv,
      signatures: updatedSignatures,
      updatedAt: new Date().toISOString()
    };

    if (onSavePV) {
      onSavePV(updatedPv);
    }
    setActiveParticipant(null);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Ensoleillé': return '☀️';
      case 'Nuageux': return '⛅';
      case 'Pluvieux': return '🌧️';
      case 'Venteux': return '💨';
      default: return '🌤️';
    }
  };

  const handlePrintPDF = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Native window.print failed, opening print window:', err);
      openDedicatedPrintWindow();
    }
  };

  const openDedicatedPrintWindow = () => {
    const printSheet = document.querySelector('.print-sheet');
    if (!printSheet) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    const headHtml = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    const contentHtml = printSheet.outerHTML;

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PV_Chantier_${pv.number}_${project?.name || ''}</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${headHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
            html, body {
              background-color: #ffffff !important;
              color: #161514 !important;
              padding: 0 !important;
              margin: 0 !important;
              font-family: 'Inter', sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              height: auto !important;
              min-height: 100% !important;
              overflow: visible !important;
            }
            .print-sheet {
              box-shadow: none !important;
              border: none !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 12px !important;
              margin: 0 !important;
              height: auto !important;
              box-sizing: border-box !important;
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; }
              html, body, .print-sheet { height: auto !important; overflow: visible !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin: 10px; padding: 12px 18px; background: #0B1F3A; color: white; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-family: system-ui, sans-serif;">
            <div>
              <div style="font-weight: bold; font-size: 14px;">Impression 1 Page A4 Strict — PV ${pv.number}</div>
              <div style="font-size: 12px; color: #C9A24B; margin-top: 2px;">Format optimisé pour tenir exactement sur 1 page A4 sans débordement.</div>
            </div>
            <button onclick="window.print()" style="background: #C9A24B; color: #0B1F3A; border: none; padding: 8px 16px; font-weight: bold; font-size: 12px; border-radius: 4px; cursor: pointer;">
              🖨️ Lancer l'Impression / Télécharger PDF
            </button>
          </div>
          ${contentHtml}
          <script>
            setTimeout(() => {
              window.print();
            }, 400);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const aFaireCount = pv.observations.filter(o => o.status === 'À faire' || o.status === 'Ouvert').length;
  const inProgressCount = pv.observations.filter(o => o.status === 'En cours').length;
  const urgentCount = pv.observations.filter(o => o.status === 'Urgent').length;
  const acheveCount = pv.observations.filter(o => o.status === 'Achevé' || o.status === 'Terminé').length;

  return (
    <div className="space-y-6">
      {/* Action bar (Hidden when printing) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-[#e2ded2] shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#565048] hover:text-[#161514] px-3 py-1.5 rounded hover:bg-[#f6f4ef] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux PV
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* A4 Format Toggle */}
          <button
            onClick={() => setIsCompactA4(!isCompactA4)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition border ${
              isCompactA4
                ? 'bg-[#e1efe6] text-[#2c6b4d] border-[#2c6b4d]/30'
                : 'bg-white text-[#565048] border-[#c9c3b1] hover:bg-[#f6f4ef]'
            }`}
            title="Active/désactive le format compact conçu pour tenir exactement sur 1 seule page A4"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isCompactA4 ? 'Format 1 Page A4 (Actif)' : 'Mode Détaillé (Multi-pages)'}
          </button>

          <button
            onClick={() => openSignatureModalForParticipant(displayParticipants[0], 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4ecd6] text-[#9c7a2e] border border-[#9c7a2e]/40 font-bold text-xs rounded hover:bg-[#ebdcae] transition shadow-2xs"
            title="Ouvrir le pad de signature tactile / stylet pour émarger"
          >
            <PenTool className="w-3.5 h-3.5" /> Signer au Stylet / Pad
          </button>

          <button
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#c9c3b1] text-[#161514] font-medium text-xs rounded hover:bg-[#f6f4ef] transition"
          >
            <Copy className="w-3.5 h-3.5 text-[#0B1F3A]" /> Dupliquer
          </button>

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#c9c3b1] text-[#161514] font-medium text-xs rounded hover:bg-[#f6f4ef] transition"
          >
            <Edit className="w-3.5 h-3.5 text-[#0B1F3A]" /> Modifier
          </button>

          <button
            onClick={() => setShowDriveModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4285F4] text-white hover:bg-[#3367d6] font-bold text-xs rounded transition shadow-2xs cursor-pointer"
            title="Exporter ce PV directement vers Google Drive"
          >
            <HardDrive className="w-3.5 h-3.5 text-white" /> Google Drive
          </button>

          <button
            onClick={() => setShowTeraBoxModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0084FF] text-white hover:bg-[#0073e6] font-bold text-xs rounded transition shadow-2xs cursor-pointer"
            title="Enregistrer ce PV sur le site TeraBox (1024 Go gratuits)"
          >
            <Cloud className="w-3.5 h-3.5 text-white" /> TeraBox (1024 Go)
          </button>

          <button
            onClick={openDedicatedPrintWindow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#f6f4ef] font-semibold text-xs rounded transition"
            title="Fenêtre d'impression isolée sur 1 page A4"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0B1F3A]" /> Vue Dédiée 1 Page
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0B1F3A] text-white font-bold text-xs rounded hover:bg-[#123356] transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#C9A24B]" /> Imprimer en PDF
          </button>
        </div>
      </div>

      {/* Google Drive Export Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-[#c9c3b1] dark:border-[#475569] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2ded2] dark:border-[#334155] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F3A] dark:text-[#f1f5f9] flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#4285F4]" /> Exportation Google Drive — PV N° {pv.number}
              </h3>
              <button
                onClick={() => setShowDriveModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <GoogleDriveManager
              pvs={[pv]}
              projects={project ? [project] : []}
              selectedPvId={pv.id}
              onClose={() => setShowDriveModal(false)}
            />
          </div>
        </div>
      )}

      {/* TeraBox Cloud Export Modal */}
      {showTeraBoxModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-[#c9c3b1] dark:border-[#475569] p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e2ded2] dark:border-[#334155] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F3A] dark:text-[#f1f5f9] flex items-center gap-2">
                <Cloud className="w-5 h-5 text-[#0084FF]" /> Sauvegarde TeraBox Cloud — PV N° {pv.number}
              </h3>
              <button
                onClick={() => setShowTeraBoxModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TeraBoxManager
              pvs={[pv]}
              projects={project ? [project] : []}
              selectedPvId={pv.id}
              onClose={() => setShowTeraBoxModal(false)}
            />
          </div>
        </div>
      )}

      {/* Official Document Sheet */}
      <div className="a4-compact mx-auto max-w-4xl">
        <div className={`print-sheet bg-white rounded-md border border-[#e2ded2] shadow-sm ${
          isCompactA4 ? 'p-5 md:p-6 space-y-3 text-[11px]' : 'p-8 md:p-10 space-y-6 text-xs'
        }`}>
        {/* Dedicated Header Section with Prominent Brand Logo */}
        <div className={`border-b-2 border-[#0B1F3A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          isCompactA4 ? 'pb-3' : 'pb-5'
        }`}>
          {/* Header Brand & Logo Block */}
          <div className="flex items-center gap-3.5">
            <div className="p-1 bg-[#f6f4ef] rounded-lg border border-[#e2ded2] flex-shrink-0 shadow-2xs">
              {office.logoUrl ? (
                <img
                  src={office.logoUrl}
                  alt="Logo"
                  className={isCompactA4 ? "w-14 h-14 sm:w-16 sm:h-16 object-contain rounded" : "w-16 h-16 sm:w-20 sm:h-20 object-contain rounded"}
                />
              ) : (
                <BrandLogo className={isCompactA4 ? "w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0" : "w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"} />
              )}
            </div>
            <div>
              <h1 className="font-serif font-bold text-[#0B1F3A] uppercase tracking-wide text-lg sm:text-2xl leading-tight">
                {office.brand}
              </h1>
              <div className="text-xs font-bold text-[#161514] mt-0.5">{office.name} — {office.title}</div>
              <div className="text-[10px] text-[#565048] mt-0.5 font-medium">
                {office.address} • {office.city} | Tél: {office.phone}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-l-2 sm:border-l-0 border-[#C9A24B] pl-2 sm:pl-0">
            <div className="font-serif text-[10px] uppercase tracking-widest text-[#565048] font-bold">
              Procès-Verbal de Chantier
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
              {pv.number}
            </div>
            <div className="text-[11px] text-[#565048] font-semibold flex items-center gap-1 justify-start sm:justify-end mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#0B1F3A]" /> Date: {new Date(pv.date).toLocaleDateString('fr-FR')} {pv.time && `à ${pv.time}`}
            </div>
            <div className="text-[10px] text-[#565048] font-medium">
              Météo: {getWeatherIcon(pv.weather)} {pv.weather}
            </div>
          </div>
        </div>

        {/* Project & Client Banner */}
        <div className={`bg-[#f6f4ef] rounded border border-[#e2ded2] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs ${
          isCompactA4 ? 'p-2.5 text-[10.5px]' : 'p-4'
        }`}>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#565048]">
              Chantier / Projet
            </div>
            <div className="font-serif font-bold text-sm text-[#0B1F3A]">
              {project?.name || 'Projet non spécifié'}
            </div>
            <div className="text-[#565048] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#a8481f]" /> {project?.address || 'N/A'}, {project?.city}
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-[#e2ded2] pt-2 md:pt-0 md:pl-3">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#565048]">
              Intervenants Clés
            </div>
            <div className="font-semibold text-[#161514]">
              Maître d'Ouvrage: <span className="font-normal">{project?.client || 'N/A'}</span>
            </div>
            <div className="font-semibold text-[#161514] flex items-center gap-2">
              Avancement:
              <span className="font-mono font-bold bg-[#0B1F3A] text-white px-1.5 py-0.2 rounded text-[10px]">
                {pv.overallProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* General Notes if present */}
        {pv.generalNotes && (
          <div className={`border-l-3 border-[#0B1F3A] bg-[#e9edf3]/50 rounded-r text-[#161514] ${
            isCompactA4 ? 'p-2 text-[10px]' : 'p-3 text-xs'
          }`}>
            <span className="font-bold uppercase tracking-wider text-[9px] text-[#0B1F3A] block">
              Ordre du jour & Note Globale :
            </span>
            {pv.generalNotes}
          </div>
        )}

        {/* SECTION 1: PARTICIPANTS */}
        <div>
          <h3 className="font-serif font-bold text-xs text-[#0B1F3A] uppercase tracking-wider border-b border-[#0B1F3A] pb-0.5 mb-1.5">
            1. Participants & Présences
          </h3>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f4ef] border-y border-[#e2ded2] text-[#565048] font-bold uppercase text-[9px]">
                <th className="p-1 border-r border-[#e2ded2]">Nom & Prénom</th>
                <th className="p-1 border-r border-[#e2ded2]">Organisme / Entreprise</th>
                <th className="p-1 border-r border-[#e2ded2]">Rôle</th>
                <th className="p-1 text-center w-20">Présence</th>
              </tr>
            </thead>
            <tbody>
              {pv.participants.map((p, idx) => (
                <tr key={p.id || idx} className="border-b border-[#e2ded2]">
                  <td className="p-1 border-r border-[#e2ded2] font-semibold text-[#161514] text-[10px]">
                    {p.name}
                  </td>
                  <td className="p-1 border-r border-[#e2ded2] text-[#565048] text-[10px]">
                    {p.organization}
                  </td>
                  <td className="p-1 border-r border-[#e2ded2] text-[#565048] text-[10px]">
                    {p.role}
                  </td>
                  <td className="p-1 text-center font-bold">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] ${
                        p.status === 'Présent'
                          ? 'bg-[#e1efe6] text-[#2c6b4d]'
                          : p.status === 'Excusé'
                          ? 'bg-[#f4ecd6] text-[#9c7a2e]'
                          : 'bg-[#f5e4da] text-[#a8481f]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 2: OBSERVATIONS TABLE */}
        <div>
          <div className="flex justify-between items-end border-b border-[#0B1F3A] pb-0.5 mb-1.5">
            <h3 className="font-serif font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
              2. Observations, Constats & Directives
            </h3>
            <div className="text-[10px] font-mono flex flex-wrap gap-2">
              <span className="text-[#a8481f] font-bold">● {aFaireCount} À faire</span>
              <span className="text-[#9c7a2e] font-bold">● {inProgressCount} En cours</span>
              <span className="text-[#c5221f] font-extrabold bg-red-50 px-1 rounded">● {urgentCount} Urgent</span>
              <span className="text-[#2c6b4d] font-bold bg-[#e1efe6] px-1 rounded">● {acheveCount} Achevé</span>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f6f4ef] border-y border-[#e2ded2] text-[#565048] font-bold uppercase text-[9px]">
                <th className="p-1 border-r border-[#e2ded2] w-7 text-center">N°</th>
                <th className="p-1 border-r border-[#e2ded2] w-24">Lot / Localisation</th>
                <th className="p-1 border-r border-[#e2ded2]">Observation</th>
                <th className="p-1 border-r border-[#e2ded2] w-24">Responsable</th>
                <th className="p-1 border-r border-[#e2ded2] w-20 text-center">Délai</th>
                <th className="p-1 w-16 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {pv.observations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-2 text-center text-[#565048] italic text-[10px]">
                    Aucune observation enregistrée dans ce procès-verbal.
                  </td>
                </tr>
              ) : (
                pv.observations.map((obs, idx) => {
                  const displayStatus = obs.status === 'Ouvert' ? 'À faire' : (obs.status === 'Terminé' || obs.status === 'Achevé') ? 'Achevé' : obs.status;
                  return (
                    <tr key={obs.id || idx} className="border-b border-[#e2ded2]">
                      <td className="p-1 border-r border-[#e2ded2] text-center font-mono font-bold text-[#0B1F3A] text-[10px]">
                        {obs.number || idx + 1}
                      </td>
                      <td className="p-1 border-r border-[#e2ded2] text-[10px]">
                        <div className="font-bold text-[#161514]">{obs.lot}</div>
                        <div className="text-[9px] text-[#565048]">{obs.location}</div>
                      </td>
                      <td className="p-1 border-r border-[#e2ded2] text-[10px]">
                        <div className="text-[#161514] leading-tight">{obs.text}</div>
                      </td>
                      <td className="p-1 border-r border-[#e2ded2] font-medium text-[#161514] text-[10px]">
                        {obs.assignedTo || '—'}
                      </td>
                      <td className="p-1 border-r border-[#e2ded2] text-center font-mono text-[9.5px] text-[#565048]">
                        {obs.dueDate ? new Date(obs.dueDate).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="p-1 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${
                            displayStatus === 'Urgent'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : displayStatus === 'En cours'
                              ? 'bg-[#f4ecd6] text-[#9c7a2e]'
                              : displayStatus === 'Achevé'
                              ? 'bg-[#e1efe6] text-[#2c6b4d] border border-[#2c6b4d]/30'
                              : 'bg-[#f5e4da] text-[#a8481f]'
                          }`}
                        >
                          {displayStatus === 'Achevé' ? '✓ Achevé' : displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* GALERIE PHOTOS GÉNÉRALE DU CHANTIER (16:9) AVEC FLÈCHES & COMMENTAIRES */}
        {pv.galleryPhotos && pv.galleryPhotos.length > 0 && (
          <div className="pt-2 border-t border-[#0B1F3A] break-inside-avoid print:break-inside-avoid">
            <div className="flex justify-between items-center border-b border-[#0B1F3A] pb-0.5 mb-2">
              <h3 className="font-serif font-bold text-xs text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#0B1F3A]" />
                3. Galerie Photos & Repérages Chantier (16:9) ({pv.galleryPhotos.length})
              </h3>
              <span className="text-[9px] text-[#565048] font-mono italic">
                Format Panoramique 16:9 — Cliquer pour naviguer (← →) et annoter avec flèches
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 print:grid-cols-2">
              {pv.galleryPhotos.map((photo, gIdx) => (
                <div
                  key={photo.id || gIdx}
                  className="border border-[#c9c3b1] rounded-md bg-[#f6f4ef] p-2 flex flex-col justify-between hover:border-[#0B1F3A] transition shadow-2xs break-inside-avoid print:break-inside-avoid"
                >
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#e2ded2]">
                    <span className="font-mono font-bold text-[9.5px] text-[#0B1F3A] bg-[#e9edf3] px-1.5 py-0.2 rounded">
                      Photo N°{gIdx + 1} {photo.lot ? `— ${photo.lot}` : ''}
                    </span>
                    <span className="text-[8.5px] text-[#565048] font-mono">
                      {photo.date || new Date(pv.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Photo with SVG Arrows & Comment Badges */}
                  <div
                    onClick={() => handleOpenPhotoAnnotator(gIdx)}
                    className="relative cursor-pointer group mb-1.5"
                  >
                    <PhotoWithAnnotations
                      photo={photo}
                      className="aspect-video w-full rounded border border-[#c9c3b1] group-hover:border-[#0B1F3A] transition"
                      showCommentBadges={true}
                    />
                    <div className="no-print absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded font-medium opacity-90 group-hover:opacity-100 shadow-sm flex items-center gap-1">
                      🔍 Agrandir & Annoter (Flèches)
                    </div>
                  </div>

                  {photo.caption && (
                    <div className="text-[10px] text-[#161514] leading-tight font-medium">
                      {photo.caption}
                    </div>
                  )}

                  {/* Comments summary under photo */}
                  {photo.annotations && photo.annotations.length > 0 && (
                    <div className="mt-1.5 pt-1 border-t border-[#e2ded2] space-y-0.5">
                      <div className="text-[8.5px] font-bold uppercase text-[#0B1F3A] flex items-center justify-between">
                        <span>Flèches & Commentaires ({photo.annotations.length}) :</span>
                        <span className="text-[8px] text-[#565048] font-normal no-print">Cliquer pour éditer</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {photo.annotations.map((ann, aIdx) => (
                          <span
                            key={ann.id || aIdx}
                            className="inline-flex items-center gap-1 text-[8.5px] px-1.5 py-0.2 rounded bg-white border font-medium text-[#161514] shadow-2xs"
                            style={{ borderColor: ann.color || '#DC2626' }}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full text-[7px] font-bold text-white flex items-center justify-center shrink-0"
                              style={{ backgroundColor: ann.color || '#DC2626' }}
                            >
                              {aIdx + 1}
                            </span>
                            <span className="truncate max-w-[150px]">{ann.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROCHAINE RÉUNION */}
        {pv.nextMeetingDate && (
          <div className="bg-[#f6f4ef] p-2 rounded border border-[#e2ded2] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0B1F3A]" />
              <span className="font-bold text-[#0B1F3A] uppercase tracking-wider text-[9.5px]">
                Prochaine réunion :
              </span>
              <span className="font-semibold text-[#161514]">
                Le {new Date(pv.nextMeetingDate).toLocaleDateString('fr-FR')} {pv.nextMeetingTime && `à ${pv.nextMeetingTime}`}
              </span>
            </div>
            <span className="text-[9px] text-[#565048] italic">
              Présence obligatoire des entreprises
            </span>
          </div>
        )}

        {/* SIGNATURES SECTION */}
        <div className="pt-2 border-t border-[#0B1F3A] break-inside-avoid">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="font-serif font-bold text-xs text-[#0B1F3A] uppercase tracking-wider">
              {pv.galleryPhotos && pv.galleryPhotos.length > 0 ? '5' : '4'}. Émargement & Signatures Numériques ({displayParticipants.length} participant{displayParticipants.length > 1 ? 's' : ''})
            </h3>
            <span className="no-print text-[9px] text-[#0B1F3A] font-semibold bg-[#0B1F3A]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <PenTool className="w-3 h-3 text-[#0B1F3A]" /> Cliquer sur un cadre pour signer sur Pad
            </span>
          </div>

          <div className={`grid gap-2 text-[10px] ${
            displayParticipants.length <= 3 ? 'grid-cols-3' : displayParticipants.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          }`}>
            {displayParticipants.map((p, idx) => {
              const sig = getSignatureForParticipant(p, idx);
              return (
                <div
                  key={p.id || idx}
                  onClick={() => openSignatureModalForParticipant(p, idx)}
                  className={`sig-card border border-[#c9c3b1] rounded bg-[#f6f4ef] flex flex-col justify-between cursor-pointer hover:border-[#0B1F3A] hover:shadow-xs transition group ${
                    isCompactA4 ? 'p-2 h-26' : 'p-3 h-36'
                  }`}
                  title={`Cliquer pour signer ou modifier la signature numérisée pour ${p.name}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-bold uppercase tracking-wider text-[8.5px] text-[#0B1F3A] truncate">
                        {p.role || 'Participant'}
                      </div>
                      <span className={`text-[7.5px] px-1 py-0.2 rounded font-bold ${
                        p.status === 'Présent' ? 'bg-[#e1efe6] text-[#2c6b4d]' : p.status === 'Excusé' ? 'bg-[#f4ecd6] text-[#9c7a2e]' : 'bg-[#f5e4da] text-[#a8481f]'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="font-semibold text-[#161514] truncate text-[9.5px]">
                      {p.name}
                    </div>
                    <div className="text-[8px] text-[#565048] truncate font-mono">
                      {p.organization}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center my-0.5">
                    {sig?.dataUrl ? (
                      <img
                        src={sig.dataUrl}
                        alt={`Signature ${p.name}`}
                        className="max-h-10 max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-1 text-center">
                        <PenTool className="w-3.5 h-3.5 text-[#0B1F3A] mb-0.5 group-hover:scale-110 transition" />
                        <span className="text-[8px] font-bold text-[#0B1F3A] underline decoration-dotted">
                          Signer au Stylet / Pad
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono pt-1 border-t border-[#e2ded2]/50">
                    <span className="no-print font-semibold text-[#0B1F3A] group-hover:underline">
                      {sig?.dataUrl ? '✎ Modifier' : '✍️ Pad tactile'}
                    </span>
                    <span>{sig?.date || new Date(pv.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer legal mention */}
        <div className="text-[9px] text-[#565048] text-center border-t border-[#e2ded2] pt-1.5 font-mono">
          {office.legalMention || 'Document officiel ARCHITEXPERT. Tout retard fera l\'objet des pénalités prévues aux marchés.'}
        </div>
      </div>
    </div>

      {/* Interactive Signature Pad Modal Overlay */}
      {activeParticipant && (
        <div className="no-print fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-5 space-y-4 border border-[#0B1F3A]">
            <div className="flex items-center justify-between border-b border-[#e2ded2] pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#0B1F3A]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#0B1F3A]">
                    Pad de Signature Numérisée
                  </h3>
                  <p className="text-xs text-[#565048]">
                    Émargement de <span className="font-bold text-[#0B1F3A]">{activeParticipant.name}</span> — {activeParticipant.role} ({activeParticipant.organization})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveParticipant(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1">
                Nom du signataire :
              </label>
              <input
                type="text"
                value={activeSignerName}
                onChange={e => setActiveSignerName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#c9c3b1] rounded text-xs font-semibold text-[#161514] focus:outline-none focus:border-[#0B1F3A]"
                placeholder="Nom du signataire..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-1">
                Dessiner la signature au stylet, au doigt ou à la souris :
              </label>
              <SignaturePad
                title={`Signature : ${activeParticipant.name}`}
                signerName={activeSignerName || activeParticipant.name}
                initialValue={tempSignatureUrl}
                onSave={url => setTempSignatureUrl(url)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e2ded2]">
              <button
                type="button"
                onClick={() => setActiveParticipant(null)}
                className="px-4 py-2 border border-[#c9c3b1] text-xs font-semibold rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveDigitalSignature}
                className="px-5 py-2 bg-[#0B1F3A] text-white text-xs font-bold rounded hover:bg-[#123356] shadow transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C9A24B]" /> Valider & Apposer la Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interactive Photo Lightbox with Arrow Annotation & Navigation */}
      {pv.galleryPhotos && pv.galleryPhotos.length > 0 && (
        <PhotoAnnotatorModal
          photos={pv.galleryPhotos}
          initialIndex={selectedPhotoIndex}
          isOpen={annotatorModalOpen}
          onClose={() => setAnnotatorModalOpen(false)}
          onUpdatePhotoAnnotations={handleUpdatePhotoAnnotations}
        />
      )}
    </div>
  );
};
