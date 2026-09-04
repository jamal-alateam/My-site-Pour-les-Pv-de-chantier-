import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SitePV, Project, OfficeSettings, UserProfile } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore Collection Names
const PVS_COLLECTION = 'pvs';
const PROJECTS_COLLECTION = 'projects';
const SETTINGS_COLLECTION = 'settings';
const PROFILES_COLLECTION = 'profiles';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

/**
 * Subscribe to real-time updates for PVs collection
 */
export function subscribeToPVs(
  onUpdate: (pvs: SitePV[]) => void,
  onError?: (err: Error) => void
) {
  const pvsRef = collection(db, PVS_COLLECTION);
  return onSnapshot(
    pvsRef,
    (snapshot) => {
      const pvs: SitePV[] = [];
      snapshot.forEach((doc) => {
        pvs.push(doc.data() as SitePV);
      });
      // Sort PVs by date descending
      pvs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(pvs);
    },
    (err) => {
      console.warn('[CloudSync] PVs listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to real-time updates for Projects collection
 */
export function subscribeToProjects(
  onUpdate: (projects: Project[]) => void,
  onError?: (err: Error) => void
) {
  const projectsRef = collection(db, PROJECTS_COLLECTION);
  return onSnapshot(
    projectsRef,
    (snapshot) => {
      const projects: Project[] = [];
      snapshot.forEach((doc) => {
        projects.push(doc.data() as Project);
      });
      onUpdate(projects);
    },
    (err) => {
      console.warn('[CloudSync] Projects listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to real-time updates for Office Settings
 */
export function subscribeToOfficeSettings(
  onUpdate: (office: OfficeSettings) => void,
  onError?: (err: Error) => void
) {
  const officeDocRef = doc(db, SETTINGS_COLLECTION, 'office');
  return onSnapshot(
    officeDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as OfficeSettings);
      }
    },
    (err) => {
      console.warn('[CloudSync] Office listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to real-time updates for Profiles collection
 */
export function subscribeToProfiles(
  onUpdate: (profiles: UserProfile[]) => void,
  onError?: (err: Error) => void
) {
  const profilesRef = collection(db, PROFILES_COLLECTION);
  return onSnapshot(
    profilesRef,
    (snapshot) => {
      const profiles: UserProfile[] = [];
      snapshot.forEach((doc) => {
        profiles.push(doc.data() as UserProfile);
      });
      if (profiles.length > 0) {
        onUpdate(profiles);
      }
    },
    (err) => {
      console.warn('[CloudSync] Profiles listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save single PV to Firestore
 */
export async function savePVToCloud(pv: SitePV): Promise<void> {
  try {
    const pvDocRef = doc(db, PVS_COLLECTION, pv.id);
    await setDoc(pvDocRef, pv, { merge: true });
  } catch (err) {
    console.error('[CloudSync] Failed to save PV to Firestore:', err);
    throw err;
  }
}

/**
 * Delete single PV from Firestore
 */
export async function deletePVFromCloud(pvId: string): Promise<void> {
  try {
    const pvDocRef = doc(db, PVS_COLLECTION, pvId);
    await deleteDoc(pvDocRef);
  } catch (err) {
    console.error('[CloudSync] Failed to delete PV from Firestore:', err);
    throw err;
  }
}

/**
 * Save single Project to Firestore
 */
export async function saveProjectToCloud(project: Project): Promise<void> {
  try {
    const projDocRef = doc(db, PROJECTS_COLLECTION, project.id);
    await setDoc(projDocRef, project, { merge: true });
  } catch (err) {
    console.error('[CloudSync] Failed to save Project to Firestore:', err);
    throw err;
  }
}

/**
 * Delete single Project from Firestore
 */
export async function deleteProjectFromCloud(projectId: string): Promise<void> {
  try {
    const projDocRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(projDocRef);
  } catch (err) {
    console.error('[CloudSync] Failed to delete Project from Firestore:', err);
    throw err;
  }
}

/**
 * Save Office Settings to Firestore
 */
export async function saveOfficeToCloud(office: OfficeSettings): Promise<void> {
  try {
    const officeDocRef = doc(db, SETTINGS_COLLECTION, 'office');
    await setDoc(officeDocRef, office, { merge: true });
  } catch (err) {
    console.error('[CloudSync] Failed to save Office Settings to Firestore:', err);
    throw err;
  }
}

/**
 * Save Profiles to Firestore
 */
export async function saveProfileToCloud(profile: UserProfile): Promise<void> {
  try {
    const profileDocRef = doc(db, PROFILES_COLLECTION, profile.id);
    await setDoc(profileDocRef, profile, { merge: true });
  } catch (err) {
    console.error('[CloudSync] Failed to save Profile to Firestore:', err);
    throw err;
  }
}

/**
 * Delete Profile from Firestore
 */
export async function deleteProfileFromCloud(profileId: string): Promise<void> {
  try {
    const profileDocRef = doc(db, PROFILES_COLLECTION, profileId);
    await deleteDoc(profileDocRef);
  } catch (err) {
    console.error('[CloudSync] Failed to delete Profile from Firestore:', err);
    throw err;
  }
}

/**
 * Mass push local data to Firestore (used for initial sync from laptop if cloud is empty)
 */
export async function pushAllLocalDataToCloud(
  pvs: SitePV[],
  projects: Project[],
  office: OfficeSettings,
  profiles: UserProfile[]
): Promise<void> {
  try {
    // 1. Office
    await saveOfficeToCloud(office);

    // 2. Projects
    for (const proj of projects) {
      await saveProjectToCloud(proj);
    }

    // 3. Profiles
    for (const prof of profiles) {
      await saveProfileToCloud(prof);
    }

    // 4. PVs
    for (const pv of pvs) {
      await savePVToCloud(pv);
    }
  } catch (err) {
    console.error('[CloudSync] Error in pushAllLocalDataToCloud:', err);
  }
}

/**
 * Fetch initial cloud state check
 */
export async function fetchCloudPVsCount(): Promise<number> {
  try {
    const pvsRef = collection(db, PVS_COLLECTION);
    const snap = await getDocs(pvsRef);
    return snap.size;
  } catch (err) {
    console.warn('[CloudSync] Error fetching cloud PVs count:', err);
    return 0;
  }
}
