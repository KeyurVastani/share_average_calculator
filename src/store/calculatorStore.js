import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCalculatorStore = create(
  persist(
    (set, get) => ({
      // State
      selectedCalculator: null,
      isLoading: false,
      isModalVisible: false,
      showInfoModal: false,
      
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setModalVisible: (visible) => {
        set({ isModalVisible: visible });
      },
      
      setInfoModalVisible: (visible) => {
        set({ showInfoModal: visible });
      },
      
      // Combined actions for better UX
      setSelectedCalculator: (item) => {
        set({ 
          selectedCalculator: item,
          isLoading: true 
        });
        
        // Simulate loading for better UX
        setTimeout(() => {
          set({ 
            isLoading: false,
            isModalVisible: false 
          });
        }, 500);
      },
      
      openCalculatorModal: () => {
        set({ isModalVisible: true });
      },
      
      closeCalculatorModal: () => {
        set({ isModalVisible: false });
      },
      
      toggleInfoModal: () => {
        const { showInfoModal } = get();
        set({ showInfoModal: !showInfoModal });
      },
      
      // Reset state
      resetState: () => {
        set({
          selectedCalculator: null,
          isLoading: false,
          isModalVisible: false,
          showInfoModal: false,
        });
      },
    }),
    {
      name: 'calculator-storage', // unique name for the storage key
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for persistence
      partialize: (state) => ({
        selectedCalculator: state.selectedCalculator, // only persist selectedCalculator
      }),
    }
  )
);

export default useCalculatorStore; 