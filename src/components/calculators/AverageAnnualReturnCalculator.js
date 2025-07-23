import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

const AverageAnnualReturnCalculator = () => {
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

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      setResult(loadedCalculation);
      setCurrentStockName(loadedCalculation.stockName || '');
      setInitialValue(loadedCalculation.initialValue || '');
      setFinalValue(loadedCalculation.finalValue || '');
      setYears(loadedCalculation.years || '');
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

    // Calculate CAGR (Compound Annual Growth Rate)
    const cagr = Math.pow(final / initial, 1 / yearCount) - 1;
    const cagrPercentage = cagr * 100;

    // Calculate total return
    const totalReturn = ((final - initial) / initial) * 100;

    setResult({
      averageAnnualReturn: cagrPercentage.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      initialValue: initial.toFixed(2),
      finalValue: final.toFixed(2),
      years: yearCount.toFixed(1),
      stockName: currentStockName
    });
  };

  const resetCalculator = () => {
    setInitialValue('');
    setFinalValue('');
    setYears('');
    setResult(null);
    setCurrentStockName('');
  };

  const handleSave = () => {
    if (!result) {
      Alert.alert('Error', 'Please calculate a result first.');
      return;
    }

    const calculationData = {
      ...result,
      type: 'cagr',
      timestamp: new Date().toISOString(),
      inputs: {
        initialValue,
        finalValue,
        years,
        stockName: currentStockName
      }
    };

    saveCalculation(calculationData);
    toggleSaveModal();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.inputSection}>

        <CommonText
          title="Initial Investment Value"
          textStyle={[16, 'bold', '#333']}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter initial value"
          value={initialValue}
          onChangeText={setInitialValue}
          keyboardType="numeric"
        />

        <CommonText
          title="Final Investment Value"
          textStyle={[16, 'bold', '#333']}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter final value"
          value={finalValue}
          onChangeText={setFinalValue}
          keyboardType="numeric"
        />

        <CommonText
          title="Investment Period (Years)"
          textStyle={[16, 'bold', '#333']}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter number of years"
          value={years}
          onChangeText={setYears}
          keyboardType="numeric"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateAverageAnnualReturn}
        >
          <CommonText
            title="Calculate"
            textStyle={[18, 'bold', 'white']}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetCalculator}
        >
          <CommonText
            title="Reset"
            textStyle={[18, 'bold', '#666']}
          />
        </TouchableOpacity>
      </View>

      {/* Result Section */}
      {result && (
        <View style={styles.resultSection}>
          <CommonText
            title="Results"
            textStyle={[20, 'bold', '#333']}
          />
          
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <CommonText
                title="Average Annual Return:"
                textStyle={[16, 'bold', '#333']}
              />
              <CommonText
                title={`${result.averageAnnualReturn}%`}
                textStyle={[18, 'bold', '#2196F3']}
              />
            </View>

            <View style={styles.resultRow}>
              <CommonText
                title="Total Return:"
                textStyle={[16, 'bold', '#333']}
              />
              <CommonText
                title={`${result.totalReturn}%`}
                textStyle={[18, 'bold', '#4CAF50']}
              />
            </View>

            <View style={styles.resultRow}>
              <CommonText
                title="Initial Value:"
                textStyle={[16, 'bold', '#333']}
              />
              <CommonText
                title={`₹${result.initialValue}`}
                textStyle={[16, 'normal', '#666']}
              />
            </View>

            <View style={styles.resultRow}>
              <CommonText
                title="Final Value:"
                textStyle={[16, 'bold', '#333']}
              />
              <CommonText
                title={`₹${result.finalValue}`}
                textStyle={[16, 'normal', '#666']}
              />
            </View>

            <View style={styles.resultRow}>
              <CommonText
                title="Investment Period:"
                textStyle={[16, 'bold', '#333']}
              />
              <CommonText
                title={`${result.years} years`}
                textStyle={[16, 'normal', '#666']}
              />
            </View>
          </View>

          {/* Save and History Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <CommonText
                title="Save Calculation"
                textStyle={[16, 'bold', 'white']}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.historyButton}
              onPress={toggleHistoryModal}
            >
              <CommonText
                title="View History"
                textStyle={[16, 'bold', '#2196F3']}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Save Modal */}
      <SaveModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calculateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  resultSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
});

export default AverageAnnualReturnCalculator; 