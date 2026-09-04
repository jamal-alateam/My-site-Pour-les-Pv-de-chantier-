import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building,
  FileCheck,
  Settings,
  Plus,
  Menu,
  X,
  FileText,
  User,
  Sparkles,
  Download,
  Upload,
  Database,
  CheckCircle2,
  Clock,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Cloud
} from 'lucide-react';
import {
  Project,
  SitePV,
  OfficeSettings,
  ViewType,
  UserProfile
} from './types';
import {
  initialOfficeSettings,
  initialProjects,
  initialPVs,
  initialProfiles
} from './data/mockData';
import { getItem, setItem, recordSnapshot, restoreSnapshot } from './utils/storage';
import {
  subscribeToPVs,
  subscribeToProjects,
  subscribeToOfficeSettings,
  subscribeToProfiles,
  savePVToCloud,
  deletePVFromCloud,
  saveProjectToCloud,
  deleteProjectFromCloud,
  saveOfficeToCloud,
  saveProfileToCloud,
  deleteProfileFromCloud,
  pushAllLocalDataToCloud,
  fetchCloudPVsCount
} from './utils/cloudSync';
import { autoSyncPVToDrive } from './utils/googleDrive';
import { BrandLogo } from './components/BrandLogo';
import { ProjectModal } from './components/ProjectModal';
import { PVFormWizard } from './components/PVFormWizard';
import { PVDetailView } from './components/PVDetailView';
import { ProfileSwitcherModal } from './components/ProfileSwitcherModal';
import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { PVsView } from './views/PVsView';
import { SettingsView } from './views/SettingsView';

const STORAGE_KEY = 'architexpert_db_v2';

export default function App() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [params, setParams] = useState<Record<string, any>>({});

  const [office, setOffice] = useState<OfficeSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_office`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.logoUrl) {
          parsed.logoUrl = initialOfficeSettings.logoUrl;
        }
        return parsed;
      }
      return initialOfficeSettings;
    } catch {
      return initialOfficeSettings;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [pvs, setPvs] = useState<SitePV[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_pvs`);
      return saved ? JSON.parse(saved) : initialPVs;
    } catch {
      return initialPVs;
    }
  });

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profiles`);
      return saved ? JSON.parse(saved) : initialProfiles;
    } catch {
      return initialProfiles;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_active_profile_id`);
      return saved ? JSON.parse(saved) : (initialProfiles[0]?.id || '');
    } catch {
      return initialProfiles[0]?.id || '';
    }
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || initialProfiles[0];

  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    try {
      localStorage.setItem(`${STORAGE_KEY}_active_profile_id`, JSON.stringify(id));
      setItem(`${STORAGE_KEY}_active_profile_id`, id);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddProfile = (newP: Omit<UserProfile, 'id'>) => {
    const profileWithId: UserProfile = {
      ...newP,
      id: `user_${Date.now()}`
    };
    const updated = [...profiles, profileWithId];
    setProfiles(updated);
    handleSelectProfile(profileWithId.id);
    saveProfileToCloud(profileWithId).catch(err => console.warn(err));
    try {
      localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(updated));
      setItem(`${STORAGE_KEY}_profiles`, updated);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateProfile = (updatedP: UserProfile) => {
    const updated = profiles.map(p => p.id === updatedP.id ? updatedP : p);
    setProfiles(updated);
    saveProfileToCloud(updatedP).catch(err => console.warn(err));
    try {
      localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(updated));
      setItem(`${STORAGE_KEY}_profiles`, updated);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    deleteProfileFromCloud(id).catch(err => console.warn(err));
    if (activeProfileId === id) {
      handleSelectProfile(updated[0].id);
    }
    try {
      localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(updated));
      setItem(`${STORAGE_KEY}_profiles`, updated);
    } catch (e) {
      console.warn(e);
    }
  };

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('architexpert_dark_mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('architexpert_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Initial load from IndexedDB (fallback to localStorage / initial defaults)
  useEffect(() => {
    let isMounted = true;
    const loadFromStorage = async () => {
      try {
        const storedOffice = await getItem<OfficeSettings>(`${STORAGE_KEY}_office`, office);
        const storedProjects = await getItem<Project[]>(`${STORAGE_KEY}_projects`, projects);
        const storedPVs = await getItem<SitePV[]>(`${STORAGE_KEY}_pvs`, pvs);
        const storedProfiles = await getItem<UserProfile[]>(`${STORAGE_KEY}_profiles`, profiles);
        const storedActiveId = await getItem<string>(`${STORAGE_KEY}_active_profile_id`, activeProfileId);

        if (isMounted) {
          if (storedOffice) setOffice(storedOffice);
          if (storedProjects && Array.isArray(storedProjects)) setProjects(storedProjects);
          if (storedPVs && Array.isArray(storedPVs)) setPvs(storedPVs);
          if (storedProfiles && Array.isArray(storedProfiles) && storedProfiles.length > 0) setProfiles(storedProfiles);
          if (storedActiveId) setActiveProfileId(storedActiveId);
          setLastSavedTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (e) {
        console.warn('Storage initial load notice:', e);
      } finally {
        if (isMounted) {
          setIsStorageLoaded(true);
        }
      }
    };
    loadFromStorage();

    return () => { isMounted = false; };
  }, []);

  // Real-time Cloud Synchronization with Firestore across all devices (Laptop & Phone)
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    // 1. Subscribe to PVs in Cloud
    const unsubPVs = subscribeToPVs((cloudPVs) => {
      if (cloudPVs && cloudPVs.length > 0) {
        // Ensure default initial PVs are preserved if not in cloud
        const missingInitialPVs = initialPVs.filter(initPv => !cloudPVs.some(cpv => cpv.id === initPv.id));
        if (missingInitialPVs.length > 0) {
          missingInitialPVs.forEach(pv => savePVToCloud(pv).catch(err => console.warn(err)));
          cloudPVs = [...missingInitialPVs, ...cloudPVs];
        }
        setPvs(cloudPVs);
        setItem(`${STORAGE_KEY}_pvs`, cloudPVs);
      } else {
        // If cloud PVs list is empty, push default PVs
        initialPVs.forEach(pv => savePVToCloud(pv).catch(err => console.warn(err)));
        setPvs(initialPVs);
        setItem(`${STORAGE_KEY}_pvs`, initialPVs);
      }
    });
    unsubs.push(unsubPVs);

    // 2. Subscribe to Projects in Cloud
    const unsubProjects = subscribeToProjects((cloudProjects) => {
      if (cloudProjects && cloudProjects.length > 0) {
        // Ensure default initial projects are in cloud
        const missingInitialProjects = initialProjects.filter(initProj => !cloudProjects.some(cp => cp.id === initProj.id));
        if (missingInitialProjects.length > 0) {
          missingInitialProjects.forEach(proj => saveProjectToCloud(proj).catch(err => console.warn(err)));
          cloudProjects = [...missingInitialProjects, ...cloudProjects];
        }
        setProjects(cloudProjects);
        setItem(`${STORAGE_KEY}_projects`, cloudProjects);
      } else {
        // If cloud Projects list is empty, push default Projects
        initialProjects.forEach(proj => saveProjectToCloud(proj).catch(err => console.warn(err)));
        setProjects(initialProjects);
        setItem(`${STORAGE_KEY}_projects`, initialProjects);
      }
    });
    unsubs.push(unsubProjects);

    // 3. Subscribe to Office Settings in Cloud
    const unsubOffice = subscribeToOfficeSettings((cloudOffice) => {
      if (cloudOffice) {
        const mergedOffice = {
          ...cloudOffice,
          logoUrl: cloudOffice.logoUrl || initialOfficeSettings.logoUrl
        };
        setOffice(mergedOffice);
        setItem(`${STORAGE_KEY}_office`, mergedOffice);
      }
    });
    unsubs.push(unsubOffice);

    // 4. Subscribe to User Profiles in Cloud
    const unsubProfiles = subscribeToProfiles((cloudProfiles) => {
      if (cloudProfiles && cloudProfiles.length > 0) {
        setProfiles(cloudProfiles);
        setItem(`${STORAGE_KEY}_profiles`, cloudProfiles);
      }
    });
    unsubs.push(unsubProfiles);

    // Initial check: If cloud is completely empty, push existing local device data to cloud once
    fetchCloudPVsCount().then((count) => {
      if (count === 0) {
        try {
          const localOfficeRaw = localStorage.getItem(`${STORAGE_KEY}_office`);
          const localProjectsRaw = localStorage.getItem(`${STORAGE_KEY}_projects`);
          const localPvsRaw = localStorage.getItem(`${STORAGE_KEY}_pvs`);
          const localProfilesRaw = localStorage.getItem(`${STORAGE_KEY}_profiles`);

          if (localOfficeRaw || localPvsRaw || localProjectsRaw) {
            const parsedOffice = localOfficeRaw ? JSON.parse(localOfficeRaw) : initialOfficeSettings;
            const parsedProjects = localProjectsRaw ? JSON.parse(localProjectsRaw) : initialProjects;
            const parsedPvs = localPvsRaw ? JSON.parse(localPvsRaw) : initialPVs;
            const parsedProfiles = localProfilesRaw ? JSON.parse(localProfilesRaw) : initialProfiles;

            pushAllLocalDataToCloud(parsedPvs, parsedProjects, parsedOffice, parsedProfiles);
          }
        } catch (e) {
          console.warn('Initial push error:', e);
        }
      }
    });

    return () => {
      unsubs.forEach(u => u());
    };
  }, []);

  // Sync state to IndexedDB & localStorage ONLY AFTER initial storage load finishes
  useEffect(() => {
    if (!isStorageLoaded) return;
    setItem(`${STORAGE_KEY}_office`, office);
    setLastSavedTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  }, [office, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    setItem(`${STORAGE_KEY}_projects`, projects);
    setLastSavedTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  }, [projects, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    setItem(`${STORAGE_KEY}_pvs`, pvs);
    setLastSavedTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  }, [pvs, isStorageLoaded]);

  // Handle explicit saving of office settings and logo
  const handleSaveOffice = (updatedOffice: OfficeSettings) => {
    setOffice(updatedOffice);
    setItem(`${STORAGE_KEY}_office`, updatedOffice);
    saveOfficeToCloud(updatedOffice).catch(err => console.warn('Failed to save office to cloud:', err));
    recordSnapshot('Mise à jour coordonnées cabinet & logo', pvs, projects, updatedOffice);
  };

  // Navigation router
  const go = (newView: ViewType, newParams: Record<string, any> = {}) => {
    setView(newView);
    setParams(newParams);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Project modal handlers
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (savedProj: Project) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === savedProj.id);
      let updatedList: Project[];
      if (idx >= 0) {
        updatedList = [...prev];
        updatedList[idx] = savedProj;
      } else {
        updatedList = [savedProj, ...prev];
      }
      recordSnapshot(`Sauvegarde Chantier "${savedProj.name}"`, pvs, updatedList, office);
      return updatedList;
    });
    saveProjectToCloud(savedProj).catch(err => console.warn(err));
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce chantier ainsi que ses PVs associés ?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      const updatedPVs = pvs.filter(pv => pv.projectId !== projectId);
      setProjects(updatedProjects);
      setPvs(updatedPVs);
      deleteProjectFromCloud(projectId).catch(err => console.warn(err));
      pvs.filter(pv => pv.projectId === projectId).forEach(pv => {
        deletePVFromCloud(pv.id).catch(err => console.warn(err));
      });
      recordSnapshot(`Suppression Chantier ID ${projectId}`, updatedPVs, updatedProjects, office);
    }
  };

  // PV Handlers
  const handleSavePV = (pv: SitePV) => {
    let updatedPVs: SitePV[] = [];
    setPvs(prev => {
      const idx = prev.findIndex(item => item.id === pv.id);
      if (idx >= 0) {
        updatedPVs = [...prev];
        updatedPVs[idx] = pv;
      } else {
        updatedPVs = [pv, ...prev];
      }
      return updatedPVs;
    });

    // Automatically update the project's overall progress if provided
    const updatedProjects = projects.map(proj => {
      if (proj.id === pv.projectId) {
        const updatedProj = { ...proj, progress: pv.overallProgress };
        saveProjectToCloud(updatedProj).catch(err => console.warn(err));
        return updatedProj;
      }
      return proj;
    });
    setProjects(updatedProjects);

    // Save PV to Cloud Firestore
    savePVToCloud(pv).catch(err => console.warn(err));

    // Auto-sync PV to Google Drive if Drive token exists
    const proj = projects.find(p => p.id === pv.projectId);
    autoSyncPVToDrive(pv, proj);

    recordSnapshot(`Sauvegarde PV ${pv.number} (${pv.observations.length} obs)`, updatedPVs.length ? updatedPVs : pvs, updatedProjects, office);
    go('pv_detail', { pvId: pv.id });
  };

  const handleDeletePV = (pvId: string) => {
    if (confirm('Supprimer définitivement ce procès-verbal ?')) {
      const updated = pvs.filter(pv => pv.id !== pvId);
      setPvs(updated);
      deletePVFromCloud(pvId).catch(err => console.warn(err));
      recordSnapshot(`Suppression PV ID ${pvId}`, updated, projects, office);
    }
  };

  const handleDuplicatePV = (sourcePv: SitePV) => {
    const nextNum = `PV-${String(pvs.length + 1).padStart(3, '0')}`;
    const newPv: SitePV = {
      ...sourcePv,
      id: `pv_${Date.now()}`,
      number: nextNum,
      date: sourcePv.nextMeetingDate || new Date().toISOString().split('T')[0],
      observations: sourcePv.observations.map(obs => ({
        ...obs,
        // Carry forward unfinished observations
        status: obs.status === 'Urgent' ? 'Urgent' : 'En cours'
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPVs = [newPv, ...pvs];
    setPvs(updatedPVs);
    savePVToCloud(newPv).catch(err => console.warn(err));
    recordSnapshot(`Duplication PV ${sourcePv.number} vers ${nextNum}`, updatedPVs, projects, office);
    go('edit_pv', { pvId: newPv.id });
  };

  // Restore Snapshot Handler
  const handleRestoreSnapshot = async (snapshotId: string) => {
    const snapData = await restoreSnapshot(snapshotId);
    if (snapData) {
      if (snapData.office) setOffice(snapData.office);
      if (snapData.projects) setProjects(snapData.projects);
      if (snapData.pvs) setPvs(snapData.pvs);
      alert('Point de restauration chargé avec succès !');
      go('dashboard');
    } else {
      alert('Erreur lors du chargement de cet instantané.');
    }
  };

  // Backup & Reset Data
  const handleExportBackup = () => {
    const backupData = {
      office,
      projects,
      pvs,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architexpert_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.office) setOffice(data.office);
        if (data.projects) setProjects(data.projects);
        if (data.pvs) setPvs(data.pvs);
        alert('Restauration effectuée avec succès !');
        go('dashboard');
      } catch (err) {
        alert('Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemoData = () => {
    if (confirm('Réinitialiser les données avec le jeu de démonstration Casablanca ?')) {
      setOffice(initialOfficeSettings);
      setProjects(initialProjects);
      setPvs(initialPVs);
      go('dashboard');
    }
  };

  // Render current view
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <DashboardView
            projects={projects}
            pvs={pvs}
            onNavigate={go}
            onOpenNewProject={handleOpenNewProject}
            onLoadDemoData={handleLoadDemoData}
          />
        );

      case 'projects':
        return (
          <ProjectsView
            projects={projects}
            pvs={pvs}
            onNavigate={go}
            onOpenNewProject={handleOpenNewProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        );

      case 'pvs':
        return (
          <PVsView
            pvs={pvs}
            projects={projects}
            profiles={profiles}
            selectedProjectId={params.projectId}
            onNavigate={go}
            onDeletePV={handleDeletePV}
            onDuplicatePV={handleDuplicatePV}
          />
        );

      case 'new_pv':
        return (
          <PVFormWizard
            projects={projects}
            activeProfile={activeProfile}
            onSave={handleSavePV}
            onCancel={() => go('pvs')}
          />
        );

      case 'edit_pv': {
        const currentPv = pvs.find(p => p.id === params.pvId);
        return (
          <PVFormWizard
            initialPv={currentPv}
            projects={projects}
            activeProfile={activeProfile}
            onSave={handleSavePV}
            onCancel={() => go('pvs')}
          />
        );
      }

      case 'pv_detail': {
        const currentPv = pvs.find(p => p.id === params.pvId);
        if (!currentPv) {
          return (
            <div className="bg-white p-8 rounded text-center border border-[#e2ded2]">
              Procès-verbal non trouvé.
            </div>
          );
        }
        const currentProj = projects.find(p => p.id === currentPv.projectId);

        return (
          <PVDetailView
            pv={currentPv}
            project={currentProj}
            office={office}
            onBack={() => go('pvs')}
            onEdit={() => go('edit_pv', { pvId: currentPv.id })}
            onDuplicate={() => handleDuplicatePV(currentPv)}
            onSavePV={(updated) => setPvs(prev => prev.map(p => p.id === updated.id ? updated : p))}
          />
        );
      }

      case 'settings':
        return (
          <SettingsView
            office={office}
            pvs={pvs}
            projects={projects}
            onSaveOffice={handleSaveOffice}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onLoadDemoData={handleLoadDemoData}
            onRestoreSnapshot={handleRestoreSnapshot}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={handleSelectProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onDeleteProfile={handleDeleteProfile}
          />
        );

      default:
        return <DashboardView projects={projects} pvs={pvs} onNavigate={go} onOpenNewProject={handleOpenNewProject} onLoadDemoData={handleLoadDemoData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#161514] flex flex-col antialiased">
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="sidebar no-print hidden md:flex w-64 bg-white border-r border-[#e2ded2] flex-col sticky top-0 h-screen z-30">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#e2ded2] flex items-center gap-3">
            {office.logoUrl ? (
              <img src={office.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded" />
            ) : (
              <BrandLogo className="w-10 h-10 flex-shrink-0" />
            )}
            <div>
              <div className="font-serif font-bold text-sm tracking-wide text-[#0B1F3A]">
                {office.brand}
              </div>
              <div className="text-[10px] text-[#565048] font-medium uppercase tracking-wider truncate max-w-[140px]">
                {office.name}
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
            <button
              onClick={() => go('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition ${
                view === 'dashboard'
                  ? 'bg-[#e9edf3] text-[#0B1F3A]'
                  : 'text-[#565048] hover:bg-[#f6f4ef] hover:text-[#161514]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#C9A24B]" />
              Tableau de Bord
            </button>

            <button
              onClick={() => go('projects')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition ${
                view === 'projects'
                  ? 'bg-[#e9edf3] text-[#0B1F3A]'
                  : 'text-[#565048] hover:bg-[#f6f4ef] hover:text-[#161514]'
              }`}
            >
              <Building className="w-4 h-4 text-[#0B1F3A]" />
              Mes Chantiers ({projects.length})
            </button>

            <button
              onClick={() => go('pvs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition ${
                view === 'pvs' || view === 'pv_detail' || view === 'edit_pv' || view === 'new_pv'
                  ? 'bg-[#e9edf3] text-[#0B1F3A]'
                  : 'text-[#565048] hover:bg-[#f6f4ef] hover:text-[#161514]'
              }`}
            >
              <FileCheck className="w-4 h-4 text-[#0B1F3A]" />
              Procès-Verbaux ({pvs.length})
            </button>

            <button
              onClick={() => go('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition ${
                view === 'settings'
                  ? 'bg-[#e9edf3] text-[#0B1F3A]'
                  : 'text-[#565048] hover:bg-[#f6f4ef] hover:text-[#161514]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#0B1F3A]" />
              Configuration Cabinet
            </button>

            {/* Active Profile Switcher in Sidebar */}
            <div className="mt-3 pt-3 border-t border-[#e2ded2]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 px-1">
                Utilisateur Actif
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full text-left p-2 bg-[#f6f4ef] hover:bg-[#efece4] border border-[#e2ded2] rounded flex items-center justify-between transition cursor-pointer group"
                title="Changer de profil intervenant"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: activeProfile?.color || '#0B1F3A' }}
                  >
                    {activeProfile?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#0B1F3A] truncate group-hover:text-[#C9A24B] transition">
                      {activeProfile?.name}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {activeProfile?.title}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#0B1F3A] text-white rounded shrink-0">
                  {activeProfile?.roleTag}
                </span>
              </button>
            </div>

            {/* Dark Mode Toggle in Sidebar */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-3 py-2 mt-2 rounded text-xs font-semibold text-[#565048] bg-[#f6f4ef] hover:bg-[#efece4] border border-[#e2ded2] transition cursor-pointer"
              title={darkMode ? "Basculer en mode jour" : "Basculer en mode sombre"}
            >
              <span className="flex items-center gap-2 text-[#0B1F3A]">
                {darkMode ? <Sun className="w-4 h-4 text-[#C9A24B]" /> : <Moon className="w-4 h-4 text-[#0B1F3A]" />}
                <span>Mode {darkMode ? 'Sombre' : 'Clair'}</span>
              </span>
              <span className="text-[10px] font-bold text-[#0B1F3A] bg-white px-2 py-0.5 rounded border border-[#e2ded2]">
                {darkMode ? 'Nuit' : 'Jour'}
              </span>
            </button>
          </nav>

          {/* Quick Action Footer */}
          <div className="p-4 border-t border-[#e2ded2] space-y-2.5">
            <button
              onClick={() => go('new_pv')}
              className="w-full py-2 bg-[#0B1F3A] hover:bg-[#123356] text-white text-xs font-bold rounded shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C9A24B]" /> Nouveau PV de Chantier
            </button>

            <div className="flex items-center justify-between text-[10px] text-[#565048] bg-[#f6f4ef] px-2.5 py-1.5 rounded border border-[#e2ded2]">
              <span className="flex items-center gap-1 font-semibold text-[#2c6b4d]" title="Vos PVs sont synchronisés en temps réel sur tous vos appareils (PC, Mobile, Tablette)">
                <Cloud className="w-3.5 h-3.5 text-[#2c6b4d]" /> Sync Cloud Actif
              </span>
              <span className="font-mono text-[9px] text-gray-500">
                {lastSavedTime || 'Direct'}
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="no-print fixed inset-0 z-50 bg-black/50 md:hidden flex">
            <div className="w-72 bg-white h-full flex flex-col p-5 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#e2ded2] pb-4">
                <div className="flex items-center gap-2.5">
                  {office.logoUrl ? (
                    <img src={office.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded border border-[#e2ded2]" />
                  ) : (
                    <BrandLogo className="w-8 h-8" />
                  )}
                  <div>
                    <div className="font-serif font-bold text-sm text-[#0B1F3A]">{office.brand}</div>
                    <div className="text-[10px] text-[#565048] truncate max-w-[150px]">{office.name}</div>
                  </div>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="p-1 text-[#565048] hover:text-[#161514]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5">
                <button
                  onClick={() => { go('dashboard'); setMobileNavOpen(false); }}
                  className={`w-full text-left py-2.5 px-3 rounded text-xs font-semibold ${view === 'dashboard' ? 'bg-[#e9edf3] text-[#0B1F3A]' : 'text-[#161514] hover:bg-[#f6f4ef]'}`}
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => { go('projects'); setMobileNavOpen(false); }}
                  className={`w-full text-left py-2.5 px-3 rounded text-xs font-semibold ${view === 'projects' ? 'bg-[#e9edf3] text-[#0B1F3A]' : 'text-[#161514] hover:bg-[#f6f4ef]'}`}
                >
                  Mes Chantiers
                </button>
                <button
                  onClick={() => { go('pvs'); setMobileNavOpen(false); }}
                  className={`w-full text-left py-2.5 px-3 rounded text-xs font-semibold ${view === 'pvs' ? 'bg-[#e9edf3] text-[#0B1F3A]' : 'text-[#161514] hover:bg-[#f6f4ef]'}`}
                >
                  Registre Procès-Verbaux
                </button>
                <button
                  onClick={() => { go('settings'); setMobileNavOpen(false); }}
                  className={`w-full text-left py-2.5 px-3 rounded text-xs font-semibold ${view === 'settings' ? 'bg-[#e9edf3] text-[#0B1F3A]' : 'text-[#161514] hover:bg-[#f6f4ef]'}`}
                >
                  Configuration Cabinet
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded text-xs font-semibold text-[#161514] hover:bg-[#f6f4ef] border border-[#e2ded2] transition mt-2"
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? <Sun className="w-4 h-4 text-[#C9A24B]" /> : <Moon className="w-4 h-4 text-[#0B1F3A]" />}
                    <span>Mode {darkMode ? 'Sombre' : 'Clair'}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#0B1F3A] bg-[#f6f4ef] px-2 py-0.5 rounded border border-[#e2ded2]">
                    {darkMode ? 'Nuit' : 'Jour'}
                  </span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#e2ded2] space-y-2">
                <button
                  onClick={() => { go('new_pv'); setMobileNavOpen(false); }}
                  className="w-full py-2.5 bg-[#0B1F3A] text-white text-xs font-bold rounded shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#C9A24B]" /> + Nouveau PV de Chantier
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="flex-1 py-1.5 border border-[#c9c3b1] bg-[#f6f4ef] text-[10px] font-bold text-[#0B1F3A] rounded flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3 text-[#0B1F3A]" /> Exporter JSON
                  </button>
                  <label className="flex-1 py-1.5 border border-[#c9c3b1] bg-[#f6f4ef] text-[10px] font-bold text-[#0B1F3A] rounded flex items-center justify-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3 text-[#0B1F3A]" /> Importer
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImportBackup(file);
                          setMobileNavOpen(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="topbar no-print h-14 bg-white border-b border-[#e2ded2] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-1.5 text-[#0B1F3A] hover:bg-[#f6f4ef] rounded transition"
                title="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 md:hidden">
                {office.logoUrl ? (
                  <img src={office.logoUrl} alt="Logo" className="w-7 h-7 object-contain rounded border border-[#e2ded2]" />
                ) : (
                  <BrandLogo className="w-7 h-7" />
                )}
                <span className="font-serif font-bold text-xs text-[#0B1F3A] truncate max-w-[130px]">
                  {office.brand}
                </span>
              </div>

              <h1 className="font-serif font-bold text-sm text-[#0B1F3A] hidden sm:block">
                {view === 'dashboard' && 'Vue d\'Ensemble des Chantiers'}
                {view === 'projects' && 'Gestion des Chantiers & Entreprises'}
                {view === 'pvs' && 'Registre des Procès-Verbaux de Chantier'}
                {view === 'new_pv' && 'Rédaction de Procès-Verbal'}
                {view === 'edit_pv' && 'Modification du Procès-Verbal'}
                {view === 'pv_detail' && 'Procès-Verbal Officiel'}
                {view === 'settings' && 'Paramètres du Cabinet & En-tête'}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Badge Statut Connexion & Sauvegarde */}
              <div
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-default shadow-2xs ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                }`}
                title={
                  isOnline
                    ? "Connexion internet disponible — Vos données et PVs sont sauvegardés automatiquement sur cet appareil."
                    : "Mode Hors-ligne — Vous pouvez continuer de saisir vos PVs et photos, ils sont enregistrés localement en toute sécurité."
                }
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden xs:inline sm:inline">En ligne</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Hors-ligne</span>
                  </>
                )}
              </div>

              {/* Active Profile Pill / Switcher Button in Topbar */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 bg-[#f6f4ef] hover:bg-[#efece4] dark:bg-[#1e293b] dark:hover:bg-[#334155] border border-[#c9c3b1] dark:border-[#475569] rounded-lg transition text-left cursor-pointer shadow-2xs group"
                title="Changer d'utilisateur / Profil intervenant"
              >
                {activeProfile?.avatarUrl ? (
                  <img
                    src={activeProfile.avatarUrl}
                    alt={activeProfile.name}
                    className="w-6 h-6 rounded-full object-cover border"
                    style={{ borderColor: activeProfile.color || '#0B1F3A' }}
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: activeProfile?.color || '#0B1F3A' }}
                  >
                    {activeProfile?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden sm:block leading-tight">
                  <div className="text-[11px] font-bold text-[#0B1F3A] dark:text-[#f1f5f9] flex items-center gap-1 group-hover:text-[#C9A24B] transition">
                    <span className="truncate max-w-[110px]">{activeProfile?.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#0B1F3A] text-white rounded-xs shrink-0">
                      {activeProfile?.roleTag}
                    </span>
                  </div>
                  <div className="text-[9px] text-[#565048] dark:text-[#94a3b8] truncate max-w-[120px]">
                    {activeProfile?.title}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 border border-[#c9c3b1] bg-[#f6f4ef] hover:bg-[#efece4] text-[#0B1F3A] rounded transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={darkMode ? "Basculer en mode jour" : "Basculer en mode sombre (Confort de travail)"}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-[#C9A24B]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#0B1F3A]" />
                )}
              </button>
              <button
                onClick={() => go('new_pv')}
                className="px-3 py-1.5 bg-[#0B1F3A] text-white text-xs font-bold rounded hover:bg-[#123356] transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#C9A24B]" /> <span className="hidden sm:inline">Rédiger un PV</span>
              </button>
            </div>
          </header>

          {/* Main Body View */}
          <div className="content flex-1 p-6 max-w-7xl w-full mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modal for Projects */}
      {isProjectModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
        />
      )}

      {/* Modal for Profile Switching & Creation */}
      <ProfileSwitcherModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onAddProfile={handleAddProfile}
        onUpdateProfile={handleUpdateProfile}
        onDeleteProfile={handleDeleteProfile}
      />
    </div>
  );
}
