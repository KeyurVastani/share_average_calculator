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
      showHistoryModal: false,
      showSaveModal: false,
      savedCalculations: [],
      loadedCalculation: null,
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setModalVisible: (visible) => {
        set({ isModalVisible: visible });
      },
      
      setInfoModalVisible: (visible) => {
        set({ showInfoModal: visible });
      },

      setHistoryModalVisible: (visible) => {
        set({ showHistoryModal: visible });
      },

      setSaveModalVisible: (visible) => {
        set({ showSaveModal: visible });
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

      toggleHistoryModal: () => {
        const { showHistoryModal } = get();
        set({ showHistoryModal: !showHistoryModal });
      },

      toggleSaveModal: () => {
        const { showSaveModal } = get();
        set({ showSaveModal: !showSaveModal });
      },

      // History functions
      saveCalculation: (calculationData) => {
        const { savedCalculations } = get();
        const newCalculation = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...calculationData
        };
        set({ 
          savedCalculations: [newCalculation, ...savedCalculations],
          showSaveModal: false
        });
      },

      deleteCalculation: (id) => {
        const { savedCalculations } = get();
        set({ 
          savedCalculations: savedCalculations.filter(calc => calc.id !== id)
        });
      },

      clearAllHistory: () => {
        set({ savedCalculations: [] });
      },

      // Load calculation back to calculator
      loadCalculation: (calculationData) => {
        set({ 
          loadedCalculation: calculationData,
          showHistoryModal: false
        });
      },

      // Clear loaded calculation
      clearLoadedCalculation: () => {
        set({ loadedCalculation: null });
      },
      
      // Reset state
      resetState: () => {
        set({
          selectedCalculator: null,
          isLoading: false,
          isModalVisible: false,
          showInfoModal: false,
          showHistoryModal: false,
          showSaveModal: false,
          loadedCalculation: null,
        });
      },
    }),
    {
      name: 'calculator-storage', // unique name for the storage key
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for persistence
      partialize: (state) => ({
        selectedCalculator: state.selectedCalculator, // only persist selectedCalculator
        savedCalculations: state.savedCalculations, // persist saved calculations
      }),
    }
  )
);

export default useCalculatorStore; 