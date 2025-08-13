import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

const CAGRCalculator = () => {
  const { 
    toggleHistoryModal, 
    toggleSaveModal, 
    saveCalculation,
    getCalculationsForType, 
    loadedCalculation, 
    clearLoadedCalculation,
    editingCalculationId
  } = useCalculatorStore();
  
  const savedCalculations = getCalculationsForType('cagr');
  const [initialValue, setInitialValue] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState(null);
  const [currentStockName, setCurrentStockName] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Track if we're in editing mode
  const [hasChanges, setHasChanges] = useState(false); // Track if changes were made

  // Wrapper functions to track changes
  const handleInitialValueChange = (value) => {
    setInitialValue(value);
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const handleFinalValueChange = (value) => {
    setFinalValue(value);
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const handleYearsChange = (value) => {
    setYears(value);
    if (isEditing) {
      setHasChanges(true);
    }
  };

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      setResult(loadedCalculation);
      setCurrentStockName(loadedCalculation.stockName || '');
      
      // Convert formatted values back to original input format
      const formatInputValue = (value) => {
        if (!value) return '';
        const num = parseFloat(value);
        return Number.isInteger(num) ? num.toString() : value;
      };
      
      setInitialValue(formatInputValue(loadedCalculation.initialValue) || '');
      setFinalValue(formatInputValue(loadedCalculation.finalValue) || '');
      setYears(formatInputValue(loadedCalculation.years) || '');
      
      // Set editing mode
      setIsEditing(true);
      setHasChanges(false);
      
      clearLoadedCalculation();
    }
  }, [loadedCalculation, clearLoadedCalculation]);

  const calculateAverageAnnualReturn = () => {
    // Validate inputs
    if (!initialValue || !finalValue || !years) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const initial = parseFloat(initialValue);
    const final = parseFloat(finalValue);
    const yearCount = parseFloat(years);

    if (isNaN(initial) || isNaN(final) || isNaN(yearCount)) {
      Alert.alert('Error', 'Please enter valid numbers.');
      return;
    }

    if (initial <= 0 || final <= 0 || yearCount <= 0) {
      Alert.alert('Error', 'All values must be greater than zero.');
      return;
    }

    if (initial >= final) {
      Alert.alert('Error', 'Final value must be greater than initial value for positive returns.');
      return;
    }

    // Calculate total return
    const totalReturn = ((final - initial) / initial) * 100;

    // Calculate CAGR (Compound Annual Growth Rate)
    const cagr = Math.pow(final / initial, 1 / yearCount) - 1;
    const cagrPercentage = cagr * 100;

    // Calculate absolute gain
    const absoluteGain = final - initial;

    // Generate yearly breakdown
    const yearlyBreakdown = [];
    let currentInvestment = initial;
    
    for (let year = 1; year <= yearCount; year++) {
      const yearValue = initial * Math.pow(1 + cagr, year);
      const yearGain = yearValue - currentInvestment;
      const yearReturn = ((yearValue - currentInvestment) / currentInvestment) * 100;
      
      yearlyBreakdown.push({
        year: year,
        investment: currentInvestment.toFixed(2),
        value: yearValue.toFixed(2),
        gain: yearGain.toFixed(2),
        return: yearReturn.toFixed(2)
      });
      
      // Update investment amount for next year (reinvest the returns)
      currentInvestment = yearValue;
    }

    setResult({
      averageAnnualReturn: cagrPercentage.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      absoluteGain: absoluteGain.toFixed(2),
      initialValue: initial.toFixed(2),
      finalValue: final.toFixed(2),
      years: yearCount.toFixed(1),
      yearlyBreakdown: yearlyBreakdown,
      stockName: currentStockName
    });
    
    // Mark that changes have been made if we're in editing mode
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const resetCalculator = () => {
    setInitialValue('');
    setFinalValue('');
    setYears('');
    setResult(null);
    setCurrentStockName('');
    setIsEditing(false); // Clear editing mode
    setHasChanges(false); // Clear changes flag
  };

  const handleSave = () => {
    console.log('handleSave called:', { editingCalculationId, currentStockName, hasResult: !!result, isEditing, hasChanges });
    
    if (isEditing && result && currentStockName) {
      // When editing and we have a stock name, automatically update without showing modal
      console.log('Auto-updating calculation with stock name:', currentStockName);
      saveCalculation({
        ...result,
        stockName: currentStockName // Use the stored stock name
      }, 'cagr');
      
      // Keep editing state but mark as no changes (button will be disabled)
      setHasChanges(false);
    } else {
      // Show modal for new calculations or when no stock name exists
      console.log('Showing modal - editingCalculationId:', editingCalculationId, 'currentStockName:', currentStockName);
      toggleSaveModal();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* History Button */}
      <View style={styles.historyButtonContainer}>
        {currentStockName && (
          <View style={styles.stockNameContainer}>
            <CommonText 
              title={`📈 ${currentStockName}`} 
              textStyle={[16, '600', '#4caf50']} 
            />
          </View>
        )}
        <TouchableOpacity style={styles.historyButton} onPress={toggleHistoryModal}>
          <CommonText 
            title={`📊 History (${savedCalculations.length})`} 
            textStyle={[16, '600', '#2196F3']} 
          />
        </TouchableOpacity>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText 
            title="Investment Details" 
            textStyle={[18, 'bold', '#333']} 
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <CommonText title="Initial Total Value" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 10000"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={initialValue}
              onChangeText={handleInitialValueChange}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <CommonText title="Final Total Value" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 15000"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={finalValue}
              onChangeText={handleFinalValueChange}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <CommonText title="Investment Period (Years)" textStyle={[14, '500', '#666']} />
                      <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              keyboardType="numeric"
              placeholderTextColor="#666"
              value={years}
              onChangeText={handleYearsChange}
            />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateAverageAnnualReturn}>
          <CommonText title="Calculate Returns" textStyle={[16, 'bold', 'white']} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
          <CommonText title="Reset" textStyle={[16, '600', '#666']} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <CommonText 
              title="📊 Results" 
              textStyle={[22, 'bold', '#333']} 
            />
            <TouchableOpacity 
              style={[
                styles.saveResultButton, 
                isEditing && !hasChanges && { opacity: 0.5 }
              ]} 
              onPress={handleSave}
              disabled={isEditing && !hasChanges}
            >
              <CommonText 
                title={
                  isEditing 
                    ? (hasChanges ? "💾 Update" : "✅ Updated") 
                    : "💾 Save"
                } 
                textStyle={[14, '600', '#4caf50']} 
              />
            </TouchableOpacity>
          </View>
          
          
      

          {/* First Section - Key Results */}
          <View style={styles.mainResultCard}>
            <View style={styles.sectionHeader}>
              <CommonText title="📊 CAGR Results" textStyle={[16, 'bold', '#333']} />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="CAGR" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`${result.averageAnnualReturn}%`} 
                textStyle={[18, 'bold', '#4caf50']} 
              />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Total Return" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`${result.totalReturn}%`} 
                textStyle={[18, 'bold', '#2196F3']} 
              />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Absolute Gain" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`₹${result.absoluteGain}`} 
                textStyle={[18, 'bold', '#ff9800']} 
              />
            </View>
          </View>

          {/* Second Section - Investment Details */}
          <View style={styles.mainResultCard}>
            <View style={styles.sectionHeader}>
              <CommonText title="📈 Investment Details" textStyle={[16, 'bold', '#333']} />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Initial Investment" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`₹${result.initialValue}`} 
                textStyle={[18, 'bold', '#333']} 
              />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Final Value" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`₹${result.finalValue}`} 
                textStyle={[18, 'bold', '#333']} 
              />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Investment Period" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`${result.years} years`} 
                textStyle={[18, 'bold', '#333']} 
              />
            </View>
          </View>

          {/* Yearly Breakdown Table */}
          <View style={styles.mainResultCard}>
            <View style={styles.sectionHeader}>
              <CommonText title="📅 Yearly Breakdown" textStyle={[16, 'bold', '#333']} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableHeaderCell, styles.yearColumn]}>
                    <CommonText title="Year" textStyle={[14, 'bold', '#333']} />
                  </View>
                  <View style={[styles.tableHeaderCell, styles.investmentColumn]}>
                    <CommonText title="Investment" textStyle={[14, 'bold', '#333']} />
                  </View>
                  <View style={[styles.tableHeaderCell, styles.valueColumn]}>
                    <CommonText title="Value" textStyle={[14, 'bold', '#333']} />
                  </View>
                  <View style={[styles.tableHeaderCell, styles.gainColumn]}>
                    <CommonText title="Gain" textStyle={[14, 'bold', '#333']} />
                  </View>
                  <View style={[styles.tableHeaderCell, styles.returnColumn]}>
                    <CommonText title="Return %" textStyle={[14, 'bold', '#333']} />
                  </View>
                </View>
                
                {result.yearlyBreakdown.map((yearData, index) => (
                  <View key={yearData.year} style={[
                    styles.tableRow, 
                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}>
                    <View style={[styles.tableCell, styles.yearColumn]}>
                      <CommonText title={`${yearData.year}`} textStyle={[14, '600', '#333']} />
                    </View>
                    <View style={[styles.tableCell, styles.investmentColumn]}>
                      <CommonText title={`₹${yearData.investment}`} textStyle={[14, 'normal', '#666']} />
                    </View>
                    <View style={[styles.tableCell, styles.valueColumn]}>
                      <CommonText title={`₹${yearData.value}`} textStyle={[14, 'normal', '#666']} />
                    </View>
                    <View style={[styles.tableCell, styles.gainColumn]}>
                      <CommonText title={`₹${yearData.gain}`} textStyle={[14, 'normal', '#4caf50']} />
                    </View>
                    <View style={[styles.tableCell, styles.returnColumn]}>
                      <CommonText title={`${yearData.return}%`} textStyle={[14, 'normal', '#2196F3']} />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Sample Result - Only show when no actual results */}
      {!result && (
        <View style={styles.formulaSection}>
          <CommonText 
            title="📊 Sample Result" 
            textStyle={[18, 'bold', '#333']} 
          />
          <View style={styles.formulaCard}>
            <CommonText 
              title="Example: If you invested ₹10,000 and it grew to ₹15,000 over 5 years" 
              textStyle={[16, '600', '#666']} 
            />
            <View style={styles.sampleResultGrid}>
              <View style={styles.sampleResultItem}>
                <CommonText title="CAGR" textStyle={[12, '500', '#666']} />
                <CommonText title="8.45%" textStyle={[16, 'bold', '#4caf50']} />
              </View>
              <View style={styles.sampleResultItem}>
                <CommonText title="Total Return" textStyle={[12, '500', '#666']} />
                <CommonText title="50.00%" textStyle={[16, 'bold', '#2196F3']} />
              </View>
              <View style={styles.sampleResultItem}>
                <CommonText title="Absolute Gain" textStyle={[12, '500', '#666']} />
                <CommonText title="₹5,000" textStyle={[16, 'bold', '#4caf50']} />
              </View>
            </View>
            <CommonText 
              title="This means your investment grew by an average of 8.45% per year" 
              textStyle={[14, 'normal', '#888']} 
            />
          </View>
        </View>
      )}

      {/* Save Modal */}
      <SaveModal calculationData={result} reset={resetCalculator} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  historyButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  stockNameContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  historyButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2196F3',
    minWidth: 120,
    alignItems: 'center',
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginTop: 5,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveResultButton: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  colorfulSummaryBanner: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryIconContainer: {
    marginRight: 15,
  },
  summaryTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorfulSummarySection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorfulSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  colorfulSummaryItem: {
    width: '100%',
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItemIcon: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryItemContent: {
  },
  quickStatsBanner: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  formulaSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  formulaCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  sampleResultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  sampleResultItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5,
  },

  tableContainer: {
    marginTop: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 500, // Set minimum width for the table
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderCell: {
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  evenRow: {
    backgroundColor: '#fafafa',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  
  // Add specific width styles for each column
  yearColumn: {
    width: 70, // Year column can be smaller
  },
  investmentColumn: {
    width: 110, // Investment column needs more space for currency
  },
  valueColumn: {
    width: 110, // Value column needs more space for currency
  },
  gainColumn: {
    width: 100, // Gain column for currency
  },
  returnColumn: {
    width: 90, // Return % column
  },
  mainResultCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 10,
  },
  sectionHeader: {
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
});

export default CAGRCalculator; 