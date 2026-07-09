import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
      
      // Global UI State
      isUploadModalOpen: false,
      setUploadModalOpen: (isOpen) => set({ isUploadModalOpen: isOpen }),
      
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Miniplayer State
      activeVideo: null,
      playVideo: (video) => set({ activeVideo: video }),
      closeVideo: () => set({ activeVideo: null }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }), // only persist sidebar state
    }
  )
);
