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
      corporateActionType: 'split', // Store the selected corporate action type
      savedCalculations: {
        'average-buy': [],
        'share-price-match': [],
        'loss-recovery': [],
        'cagr': [],
        'sip': [],
        'intraday': [],
        'options-pnl': [],
        'dividend-yield': [],
        'stop-loss': [],
        'margin': [],
        'tax-brokerage': [],
        'stock-split': []
      },
      loadedCalculation: null,
      editingCalculationId: null, // Track which calculation is being edited
      
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
      
      // Corporate Action Type functions
      setCorporateActionType: (actionType) => {
        set({ corporateActionType: actionType });
      },
      
      getCorporateActionType: () => {
        const { corporateActionType } = get();
        return corporateActionType;
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
      saveCalculation: (calculationData, calculatorType) => {
        const { savedCalculations, editingCalculationId, selectedCalculator } = get();
        const currentCalculatorType = calculatorType || selectedCalculator?.id || 'average-buy';
        const currentCalculations = savedCalculations[currentCalculatorType] || [];
        
        if (editingCalculationId) {
          // Update existing calculation
          const updatedCalculations = currentCalculations.map(calc => 
            calc.id === editingCalculationId 
              ? { ...calc, ...calculationData, timestamp: new Date().toISOString() }
              : calc
          );
          set({ 
            savedCalculations: {
              ...savedCalculations,
              [currentCalculatorType]: updatedCalculations
            },
            editingCalculationId: null, // Clear editing state
            showSaveModal: false
          });
        } else {
          // Create new calculation
          const newCalculation = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            calculatorType: currentCalculatorType,
            ...calculationData
          };
          set({ 
            savedCalculations: {
              ...savedCalculations,
              [currentCalculatorType]: [newCalculation, ...currentCalculations]
            },
            showSaveModal: false
          });
        }
      },

      deleteCalculation: (id, calculatorType) => {
        const { savedCalculations, selectedCalculator } = get();
        const currentCalculatorType = calculatorType || selectedCalculator?.id || 'average-buy';
        const currentCalculations = savedCalculations[currentCalculatorType] || [];
        
        set({ 
          savedCalculations: {
            ...savedCalculations,
            [currentCalculatorType]: currentCalculations.filter(calc => calc.id !== id)
          }
        });
      },

      clearAllHistory: (calculatorType) => {
        const { savedCalculations, selectedCalculator } = get();
        const currentCalculatorType = calculatorType || selectedCalculator?.id || 'average-buy';
        
        set({ 
          savedCalculations: {
            ...savedCalculations,
            [currentCalculatorType]: []
          }
        });
      },

      // Load calculation back to calculator
      loadCalculation: (calculationData) => {
        set({ 
          loadedCalculation: calculationData,
          editingCalculationId: calculationData.id, // Track which calculation is being edited
          showHistoryModal: false
        });
      },

      // Clear loaded calculation
      clearLoadedCalculation: () => {
        set({ 
          loadedCalculation: null
          // Don't clear editingCalculationId here - it should persist until save
        });
      },

      // Get calculations for specific calculator type
      getCalculationsForType: (calculatorType) => {
        const { savedCalculations, selectedCalculator } = get();
        const currentCalculatorType = calculatorType || selectedCalculator?.id || 'average-buy';
        return savedCalculations[currentCalculatorType] || [];
      },

      // Clear editing state (call this when starting a new calculation)
      clearEditingState: () => {
        set({ editingCalculationId: null });
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
          corporateActionType: 'split',
          loadedCalculation: null,
          editingCalculationId: null,
        });
      },
    }),
    {
      name: 'calculator-storage', // unique name for the storage key
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for persistence
      partialize: (state) => ({
        selectedCalculator: state.selectedCalculator, // only persist selectedCalculator
        savedCalculations: state.savedCalculations, // persist saved calculations
        corporateActionType: state.corporateActionType, // persist corporate action type
      }),
    }
  )
);

export default useCalculatorStore; 