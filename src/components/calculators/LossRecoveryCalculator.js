import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

const LossRecoveryCalculator = () => {
  const { 
    toggleHistoryModal, 
    toggleSaveModal, 
    saveCalculation,
    getCalculationsForType, 
    loadedCalculation, 
    clearLoadedCalculation,
    editingCalculationId
  } = useCalculatorStore();
  
  const savedCalculations = getCalculationsForType('loss-recovery');
  const [sharesOwned, setSharesOwned] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentLossPercentage, setCurrentLossPercentage] = useState('');
  const [recoveryPercentage, setRecoveryPercentage] = useState('');
  const [result, setResult] = useState(null);
  const [currentStockName, setCurrentStockName] = useState('');
  
  // Error states for each field
  const [errors, setErrors] = useState({
    sharesOwned: '',
    averagePrice: '',
    currentLossPercentage: '',
    recoveryPercentage: '',
    general: ''
  });

  // Your exact calculation function
  const calculateLossCoverFromRecoverPercent = (Q1, P1, currentLossPercent, recoverPercent) => {
    // Step 1: Calculate final loss after recovery
    const targetLossPercent = currentLossPercent - recoverPercent;

    // Step 2: Convert loss percent to current price
    const P2 = P1 * (1 - currentLossPercent / 100);

    // Step 3: Calculate the target average price
    const P_avg = P2 / (1 - targetLossPercent / 100);

    // Step 4: Calculate additional shares to buy
    const Q2 = (Q1 * (P1 - P_avg)) / (P_avg - P2);

    // Step 5: Total investment needed
    const totalInvestment = Q2 * P2;

    return {
      currentPrice: P2.toFixed(2),
      newAveragePrice: P_avg.toFixed(2),
      finalLossPercent: targetLossPercent.toFixed(2),
      additionalShares: Q2.toFixed(3),
      investmentAmount: totalInvestment.toFixed(2)
    };
  };

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      setSharesOwned(loadedCalculation.sharesOwned || '');
      setAveragePrice(loadedCalculation.averagePrice || '');
      setCurrentLossPercentage(loadedCalculation.currentLossPercentage || '');
      setRecoveryPercentage(loadedCalculation.recoveryPercentage || '');
      setResult(loadedCalculation);
      setCurrentStockName(loadedCalculation.stockName || '');
      clearLoadedCalculation();
      setErrors({
        sharesOwned: '',
        averagePrice: '',
        currentLossPercentage: '',
        recoveryPercentage: '',
        general: ''
      });
    }
  }, [loadedCalculation, clearLoadedCalculation]);

  // Clear errors when user starts typing
  const clearFieldError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: '',
      general: ''
    }));
  };

  // Validate recovery percentage against current loss percentage
  const validateRecoveryPercentage = () => {
    if (currentLossPercentage && recoveryPercentage) {
      const currentLoss = parseFloat(currentLossPercentage);
      const recovery = parseFloat(recoveryPercentage);
      
      if (recovery >= currentLoss) {
        setErrors(prev => ({
          ...prev,
          recoveryPercentage: `Recovery percentage (${recovery}%) must be less than current loss percentage (${currentLoss}%)`
        }));
        return false;
      } else {
        setErrors(prev => ({
          ...prev,
          recoveryPercentage: ''
        }));
        return true;
      }
    }
    return true;
  };

  // Validate when current loss percentage changes
  useEffect(() => {
    if (currentLossPercentage && recoveryPercentage) {
      validateRecoveryPercentage();
    }
  }, [currentLossPercentage, recoveryPercentage]);

  const calculateRecovery = () => {
    // Reset all errors first
    setErrors({
      sharesOwned: '',
      averagePrice: '',
      currentLossPercentage: '',
      recoveryPercentage: '',
      general: ''
    });

    let hasErrors = false;
    const newErrors = {
      sharesOwned: '',
      averagePrice: '',
      currentLossPercentage: '',
      recoveryPercentage: '',
      general: ''
    };

    // Validate inputs
    if (!sharesOwned || isNaN(parseFloat(sharesOwned)) || parseFloat(sharesOwned) <= 0) {
      newErrors.sharesOwned = 'Please enter a valid positive number';
      hasErrors = true;
    }

    if (!averagePrice || isNaN(parseFloat(averagePrice)) || parseFloat(averagePrice) <= 0) {
      newErrors.averagePrice = 'Please enter a valid positive number';
      hasErrors = true;
    }

    if (!currentLossPercentage || isNaN(parseFloat(currentLossPercentage)) || parseFloat(currentLossPercentage) <= 0) {
      newErrors.currentLossPercentage = 'Please enter a valid positive percentage';
      hasErrors = true;
    }

    if (!recoveryPercentage || isNaN(parseFloat(recoveryPercentage)) || parseFloat(recoveryPercentage) <= 0) {
      newErrors.recoveryPercentage = 'Please enter a valid positive percentage';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const Q1 = parseFloat(sharesOwned);
    const P1 = parseFloat(averagePrice);
    const currentLoss = parseFloat(currentLossPercentage);
    const recoverPercent = parseFloat(recoveryPercentage);
    
    // Check if recovery percentage is valid
    if (recoverPercent >= currentLoss) {
      newErrors.recoveryPercentage = `Recovery percentage (${recoverPercent}%) must be less than current loss percentage (${currentLoss}%)`;
      hasErrors = true;
    }

    if (currentLoss >= 100) {
      newErrors.currentLossPercentage = 'Current loss percentage cannot be 100% or more';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Use your exact calculation function
    const calculationResult = calculateLossCoverFromRecoverPercent(Q1, P1, currentLoss, recoverPercent);

    setResult({
      sharesOwned: Q1,
      averagePrice: P1.toFixed(2),
      currentLossPercentage: currentLoss.toFixed(2),
      recoveryPercentage: recoverPercent.toFixed(2),
      currentPrice: calculationResult.currentPrice,
      newAveragePrice: calculationResult.newAveragePrice,
      finalLossPercent: calculationResult.finalLossPercent,
      additionalShares: calculationResult.additionalShares,
      investmentAmount: calculationResult.investmentAmount,
      stockName: currentStockName
    });
  };

  const resetCalculator = () => {
    setSharesOwned('');
    setAveragePrice('');
    setCurrentLossPercentage('');
    setRecoveryPercentage('');
    setResult(null);
    setCurrentStockName('');
    setErrors({
      sharesOwned: '',
      averagePrice: '',
      currentLossPercentage: '',
      recoveryPercentage: '',
      general: ''
    });
  };

  const handleSave = () => {
    if (editingCalculationId && result && currentStockName) {
      saveCalculation({
        ...result,
        sharesOwned,
        averagePrice,
        currentLossPercentage,
        recoveryPercentage,
        stockName: currentStockName
      }, 'loss-recovery');
    } else {
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
              title={` ${currentStockName}`} 
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

      {/* Number of Shares Input */}
      <View style={styles.inputSection}>
        <CommonText
          title="Number of Shares You Own"
          textStyle={[16, '600', '#333']}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors.sharesOwned ? styles.inputError : null
            ]}
            placeholder="Enter number of shares you own"
            keyboardType="numeric"
            value={sharesOwned}
            onChangeText={(text) => {
              setSharesOwned(text);
              clearFieldError('sharesOwned');
            }}
          />
          {errors.sharesOwned ? (
            <View style={styles.errorContainer}>
              <CommonText
                title={`❌ ${errors.sharesOwned}`}
                textStyle={[12, '500', '#d32f2f']}
              />
            </View>
          ) : null}
        </View>
      </View>

      {/* Average Price Input */}
      <View style={styles.inputSection}>
        <CommonText
          title="Average Price"
          textStyle={[16, '600', '#333']}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors.averagePrice ? styles.inputError : null
            ]}
            placeholder="Enter your average price"
            keyboardType="numeric"
            value={averagePrice}
            onChangeText={(text) => {
              setAveragePrice(text);
              clearFieldError('averagePrice');
            }}
          />
          {errors.averagePrice ? (
            <View style={styles.errorContainer}>
              <CommonText
                title={`❌ ${errors.averagePrice}`}
                textStyle={[12, '500', '#d32f2f']}
              />
            </View>
          ) : null}
        </View>
      </View>

      {/* Current Loss Percentage Input */}
      <View style={styles.inputSection}>
        <CommonText
          title="Current Loss Percentage"
          textStyle={[16, '600', '#333']}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors.currentLossPercentage ? styles.inputError : null
            ]}
            placeholder="Enter current loss percentage (e.g., 20 for 20%)"
            keyboardType="numeric"
            value={currentLossPercentage}
            onChangeText={(text) => {
              setCurrentLossPercentage(text);
              clearFieldError('currentLossPercentage');
            }}
          />
          {errors.currentLossPercentage ? (
            <View style={styles.errorContainer}>
              <CommonText
                title={`❌ ${errors.currentLossPercentage}`}
                textStyle={[12, '500', '#d32f2f']}
              />
            </View>
          ) : null}
        </View>
      </View>

      {/* Recovery Percentage Input */}
      <View style={styles.inputSection}>
        <CommonText 
          title="How Much to Recover (Percentage)" 
          textStyle={[16, '600', '#333']} 
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors.recoveryPercentage ? styles.inputError : null
            ]}
            placeholder="Enter recovery percentage (e.g., 17 for 17%)"
            keyboardType="numeric"
            value={recoveryPercentage}
            onChangeText={(text) => {
              setRecoveryPercentage(text);
              clearFieldError('recoveryPercentage');
            }}
          />
          {errors.recoveryPercentage ? (
            <View style={styles.errorContainer}>
              <CommonText
                title={`❌ ${errors.recoveryPercentage}`}
                textStyle={[12, '500', '#d32f2f']}
              />
            </View>
          ) : null}
        </View>
        <View style={styles.helpTextContainer}>
          <CommonText 
            title="💡 Recovery percentage must be less than current loss percentage" 
            textStyle={[12, 'normal', '#666']} 
          />
        </View>
      </View>

      {/* General Error Message */}
      {errors.general ? (
        <View style={styles.generalErrorContainer}>
          <CommonText
            title={`⚠️ ${errors.general}`}
            textStyle={[14, '500', '#d32f2f']}
          />
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateRecovery}>
          <CommonText title="Calculate Recovery Plan" textStyle={[16, 'bold', 'white']} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
          <CommonText title="Reset" textStyle={[16, '600', '#666']} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <View style={{width: '70%', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CommonText title="" textStyle={[22, 'bold', '#333']} />
              <CommonText
                title="Loss Recovery Calculator"
                textStyle={[22, 'bold', '#333']}
              />
            </View>
            <TouchableOpacity style={styles.saveResultButton} onPress={handleSave}>
              <CommonText title={editingCalculationId ? " Update" : " Save"} textStyle={[14, '600', '#4caf50']} />
            </TouchableOpacity>
          </View>

          {/* Results Display */}
          <View style={styles.resultsDisplay}>
            <View style={styles.resultItem}>
              <CommonText title="Current Price (P₂):" textStyle={[16, '600', '#333']} />
              <CommonText title={`₹${result.currentPrice}`} textStyle={[20, 'bold', '#2196F3']} />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="New Average Price:" textStyle={[16, '600', '#333']} />
              <CommonText title={`₹${result.newAveragePrice}`} textStyle={[20, 'bold', '#4caf50']} />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Final Loss After Recovery:" textStyle={[16, '600', '#333']} />
              <CommonText title={`${result.finalLossPercent}%`} textStyle={[20, 'bold', '#ff9800']} />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Additional Shares to Buy:" textStyle={[16, '600', '#333']} />
              <CommonText title={result.additionalShares} textStyle={[20, 'bold', '#9c27b0']} />
            </View>
            
            <View style={styles.resultItem}>
              <CommonText title="Investment Amount Needed:" textStyle={[16, '600', '#333']} />
              <CommonText title={`₹${result.investmentAmount}`} textStyle={[20, 'bold', '#d32f2f']} />
            </View>
          </View>
        </View>
      )}

      {/* Save Modal */}
      <SaveModal calculationData={{ ...result, sharesOwned, averagePrice, currentLossPercentage, recoveryPercentage }} reset={resetCalculator}/>
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
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  inputContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  helpTextContainer: {
    marginTop: 8,
    paddingHorizontal: 5,
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
  resultsDisplay: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
    backgroundColor: '#ffebee',
  },
  errorContainer: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  generalErrorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
});

export default LossRecoveryCalculator; 