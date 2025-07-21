import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import CommonText from './CommonText';
import useCalculatorStore from '../store/calculatorStore';

const SaveModal = ({ calculationData, reset }) => {
  const { showSaveModal, toggleSaveModal, saveCalculation, editingCalculationId, selectedCalculator } = useCalculatorStore();
  const [stockName, setStockName] = useState('');

  const handleSave = () => {
    console.log('calculationData-----------------------------------------', editingCalculationId);
    if (editingCalculationId) {
      // When editing, automatically update without asking for stock name
      saveCalculation({
        ...calculationData,
        stockName: calculationData.stockName || stockName.trim() // Use existing stock name
      }, selectedCalculator?.id);
    } else {
      // Only ask for stock name when creating new calculation
      if (!stockName.trim()) {
        // You could add an alert here to warn about empty stock name
        return;
      }
      
      saveCalculation({
        ...calculationData,
        stockName: stockName.trim()
      }, selectedCalculator?.id);
    }
    
    // Reset the input
    setStockName('');
    reset();
  };

  const handleCancel = () => {
    setStockName('');
    toggleSaveModal();
  };

  // Set initial stock name when editing
  useEffect(() => {
    if (editingCalculationId && calculationData?.stockName) {
      setStockName(calculationData.stockName);
    } else {
      setStockName('');
    }
  }, [editingCalculationId, calculationData?.stockName]);

  return (
    <Modal
      visible={showSaveModal}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={handleCancel}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CommonText 
              title={editingCalculationId ? "✏️ Update Calculation" : "💾 Save Calculation"} 
              textStyle={[20, 'bold', '#333']} 
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <CommonText title="✕" textStyle={[20, 'bold', '#666']} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <CommonText 
              title={editingCalculationId 
                ? "Your changes will be automatically saved to the existing calculation." 
                : "Enter a name for this calculation to save it to your history."
              } 
              textStyle={[16, 'normal', '#666']} 
            />
            
            {!editingCalculationId && (
              <View style={styles.inputContainer}>
                <CommonText title="Stock Name" textStyle={[16, '600', '#333']} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Reliance Industries, TCS, HDFC Bank"
                  value={stockName}
                  onChangeText={setStockName}
                  autoFocus={true}
                  maxLength={50}
                />
              </View>
            )}

            {/* Preview of what will be saved */}
            {calculationData && (
              <View style={styles.previewCard}>
                <CommonText 
                  title="📊 Calculation Preview" 
                  textStyle={[16, 'bold', '#333']} 
                />
                
                {/* Average Buy Calculator Preview */}
                {calculationData.averagePrice && (
                  <>
                    <View style={styles.previewRow}>
                      <CommonText title="Average Price:" textStyle={[14, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculationData.averagePrice}`} 
                        textStyle={[14, 'bold', '#2196F3']} 
                      />
                    </View>
                    <View style={styles.previewRow}>
                      <CommonText title="Total Investment:" textStyle={[14, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculationData.totalInvestment}`} 
                        textStyle={[14, 'bold', '#333']} 
                      />
                    </View>
                    <View style={styles.previewRow}>
                      <CommonText title="P&L:" textStyle={[14, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculationData.profitLoss} (${calculationData.profitLossPercentage}%)`} 
                        textStyle={[14, 'bold', calculationData.isProfitable ? '#4caf50' : '#f44336']} 
                      />
                    </View>
                  </>
                )}
                
                {/* Share Price Match Calculator Preview */}
                {calculationData.sharesNeeded && (
                  <>
                    <View style={styles.previewRow}>
                      <CommonText title="Current Price:" textStyle={[14, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculationData.currentPrice}`} 
                        textStyle={[14, 'bold', '#2196F3']} 
                      />
                    </View>
                    <View style={styles.previewRow}>
                      <CommonText title="Target Amount:" textStyle={[14, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculationData.targetAmount}`} 
                        textStyle={[14, 'bold', '#333']} 
                      />
                    </View>
                    <View style={styles.previewRow}>
                      <CommonText title="Shares Needed:" textStyle={[14, '500', '#666']} />
                      <CommonText 
                        title={`${calculationData.sharesNeeded} shares`} 
                        textStyle={[14, 'bold', '#4caf50']} 
                      />
                    </View>
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <CommonText title="Cancel" textStyle={[16, '600', '#666']} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, !stockName.trim() && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={!stockName.trim()}
            >
              <CommonText title={editingCalculationId ? "Update" : "Save"} textStyle={[16, 'bold', 'white']} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  previewCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 15,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default SaveModal; 