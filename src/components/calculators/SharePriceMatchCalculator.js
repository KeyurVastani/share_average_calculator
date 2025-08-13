import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Dimensions } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SharePriceMatchCalculator = () => {
  const {
    toggleHistoryModal,
    toggleSaveModal,
    saveCalculation,
    getCalculationsForType,
    loadedCalculation,
    clearLoadedCalculation,
    editingCalculationId
  } = useCalculatorStore();

  const savedCalculations = getCalculationsForType('share-price-match');

  const [sharesOwned, setSharesOwned] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [targetAveragePrice, setTargetAveragePrice] = useState('');
  const [result, setResult] = useState(null);
  const [currentStockName, setCurrentStockName] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Track if we're in editing mode
  const [hasChanges, setHasChanges] = useState(false); // Track if changes were made
  
  // Error states for each field
  const [errors, setErrors] = useState({
    sharesOwned: '',
    averagePrice: '',
    currentPrice: '',
    targetAveragePrice: '',
    general: ''
  });

  // Wrapper functions to track changes
  const handleSharesOwnedChange = (text) => {
    setSharesOwned(text);
    clearFieldError('sharesOwned');
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const handleAveragePriceChange = (text) => {
    setAveragePrice(text);
    clearFieldError('averagePrice');
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const handleCurrentPriceChange = (text) => {
    setCurrentPrice(text);
    clearFieldError('currentPrice');
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const handleTargetAveragePriceChange = (text) => {
    setTargetAveragePrice(text);
    clearFieldError('targetAveragePrice');
    if (isEditing) {
      setHasChanges(true);
    }
  };

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      setSharesOwned(loadedCalculation.sharesOwned || '');
      setAveragePrice(loadedCalculation.averagePrice || '');
      setCurrentPrice(loadedCalculation.currentPrice || '');
      setTargetAveragePrice(loadedCalculation.targetAveragePrice || '');
      setResult(loadedCalculation);
      setCurrentStockName(loadedCalculation.stockName || '');
      
      // Set editing mode
      setIsEditing(true);
      setHasChanges(false);
      
      clearLoadedCalculation();
      // Clear errors when loading saved calculation
      setErrors({
        sharesOwned: '',
        averagePrice: '',
        currentPrice: '',
        targetAveragePrice: '',
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

  const calculateShares = () => {
    // Reset all errors first
    setErrors({
      sharesOwned: '',
      averagePrice: '',
      currentPrice: '',
      targetAveragePrice: '',
      general: ''
    });

    let hasErrors = false;
    const newErrors = {
      sharesOwned: '',
      averagePrice: '',
      currentPrice: '',
      targetAveragePrice: '',
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

    if (!currentPrice || isNaN(parseFloat(currentPrice)) || parseFloat(currentPrice) <= 0) {
      newErrors.currentPrice = 'Please enter a valid positive number';
      hasErrors = true;
    }

    if (!targetAveragePrice || isNaN(parseFloat(targetAveragePrice)) || parseFloat(targetAveragePrice) <= 0) {
      newErrors.targetAveragePrice = 'Please enter a valid positive number';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const owned = parseFloat(sharesOwned);
    const avgPrice = parseFloat(averagePrice);
    const current = parseFloat(currentPrice);
    const target = parseFloat(targetAveragePrice);
    
    // Check if target average is achievable
    if (target >= avgPrice) {
      newErrors.targetAveragePrice = `Target (₹${target}) must be less than current average (₹${avgPrice})`;
      hasErrors = true;
    }

    if (target <= current) {
      newErrors.targetAveragePrice = `Target (₹${target}) must be greater than current price (₹${current})`;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Calculate additional shares needed to achieve target average
    // Formula: (Owned Shares × Current Average + Additional Shares × Current Price) ÷ (Owned Shares + Additional Shares) = Target Average
    // Solving for Additional Shares:
    // (Owned × Current Average + Additional × Current Price) = Target Average × (Owned + Additional)
    // Owned × Current Average + Additional × Current Price = Target Average × Owned + Target Average × Additional
    // Owned × Current Average - Target Average × Owned = Target Average × Additional - Additional × Current Price
    // Owned × (Current Average - Target Average) = Additional × (Target Average - Current Price)
    // Additional = [Owned × (Current Average - Target Average)] ÷ (Target Average - Current Price)
    
    const additionalSharesNeeded = (owned * (avgPrice - target)) / (target - current);
    
    // Calculate the investment needed
    const investmentNeeded = additionalSharesNeeded * current;
    
    // Calculate total shares after purchase
    const totalSharesAfter = owned + additionalSharesNeeded;
    
    // Verify the new average price
    const newAveragePrice = ((owned * avgPrice) + investmentNeeded) / totalSharesAfter;
    
    // Calculate percentage reduction
    const priceReduction = ((avgPrice - target) / avgPrice) * 100;
    const costReduction = (avgPrice - target) * owned;

    setResult({
      sharesOwned: owned,
      averagePrice: avgPrice.toFixed(2),
      currentPrice: current.toFixed(2),
      targetAveragePrice: target.toFixed(2),
      additionalSharesNeeded: Math.ceil(additionalSharesNeeded),
      investmentNeeded: investmentNeeded.toFixed(2),
      totalSharesAfter: Math.ceil(totalSharesAfter),
      newAveragePrice: newAveragePrice.toFixed(2),
      priceReduction: priceReduction.toFixed(2),
      costReduction: costReduction.toFixed(2),
      stockName: currentStockName
    });
    
    // Mark that changes have been made if we're in editing mode
    if (isEditing) {
      setHasChanges(true);
    }
  };

  const resetCalculator = () => {
    setSharesOwned('');
    setAveragePrice('');
    setCurrentPrice('');
    setTargetAveragePrice('');
    setResult(null);
    setCurrentStockName('');
    setIsEditing(false); // Clear editing mode
    setHasChanges(false); // Clear changes flag
    setErrors({
      sharesOwned: '',
      averagePrice: '',
      currentPrice: '',
      targetAveragePrice: '',
      general: ''
    });
  };

  const handleSave = () => {
    console.log('handleSave called:', { editingCalculationId, currentStockName, hasResult: !!result, isEditing, hasChanges });
    
    if (isEditing && result && currentStockName) {
      // When editing and we have a stock name, automatically update without showing modal
      console.log('Auto-updating calculation with stock name:', currentStockName);
      saveCalculation({
        ...result,
        sharesOwned,
        averagePrice,
        currentPrice,
        targetAveragePrice,
        stockName: currentStockName
      }, 'share-price-match');
      
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

        {/* Row 1: Shares Owned and Average Price */}
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <CommonText title="Total Shares Owned" textStyle={[14, '500', '#666']} />
            <TextInput
              style={[
                styles.input,
                errors.sharesOwned ? styles.inputError : null
              ]}
              placeholder="e.g., 100"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={sharesOwned}
              onChangeText={handleSharesOwnedChange}
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
          
          <View style={styles.inputContainer}>
            <CommonText title="Current Average Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={[
                styles.input,
                errors.averagePrice ? styles.inputError : null
              ]}
              placeholder="e.g., 50.00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={averagePrice}
              onChangeText={handleAveragePriceChange}
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

        {/* Row 2: Current Price and Target Average */}
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <CommonText title="Current Share Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={[
                styles.input,
                errors.currentPrice ? styles.inputError : null
              ]}
              placeholder="e.g., 45.00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={currentPrice}
              onChangeText={handleCurrentPriceChange}
            />
            {errors.currentPrice ? (
              <View style={styles.errorContainer}>
                <CommonText
                  title={`❌ ${errors.currentPrice}`}
                  textStyle={[12, '500', '#d32f2f']}
                />
              </View>
            ) : null}
          </View>
          
          <View style={styles.inputContainer}>
            <CommonText title="Target Average Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={[
                styles.input,
                errors.targetAveragePrice ? styles.inputError : null
              ]}
              placeholder="e.g., 43.00"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={targetAveragePrice}
              onChangeText={handleTargetAveragePriceChange}
            />
            {errors.targetAveragePrice ? (
              <View style={styles.errorContainer}>
                <CommonText
                  title={`❌ ${errors.targetAveragePrice}`}
                  textStyle={[12, '500', '#d32f2f']}
                />
              </View>
            ) : null}
          </View>
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
        <TouchableOpacity style={styles.calculateButton} onPress={calculateShares}>
          <CommonText title="Calculate Additional Shares" textStyle={[16, 'bold', 'white']} />
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
              <CommonText title="📊" textStyle={[22, 'bold', '#333']} />
              <CommonText
                title="Result"
                textStyle={[22, 'bold', '#333']}
              />
            </View>
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

     

          {/* Target Card */}
          <View style={styles.targetCard}>
            <CommonText 
              title="🎯 Your Target" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.targetItem}>
              <CommonText title="Target Average Price" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={`₹${result.targetAveragePrice}`} 
                textStyle={[24, 'bold', '#9c27b0']} 
              />
            </View>
          </View>

          {/* Solution Card */}
          <View style={styles.solutionCard}>
            <CommonText 
              title="📈 Solution to Achieve Target" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.solutionGrid}>
              <View style={[styles.solutionItem,{marginBottom: 10}]}>
                <CommonText title="Additional Shares Needed" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={result.additionalSharesNeeded.toString() + " shares"} 
                  textStyle={[24, 'bold', '#2196F3']} 
                />
              </View>
              
              <View style={styles.solutionItem}>
                <CommonText title="Investment Required" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${result.investmentNeeded}`} 
                  textStyle={[20, 'bold', '#4caf50']} 
                />
              </View>
            </View>
          </View>

          {/* After Purchase Card */}
          <View style={styles.afterPurchaseCard}>
            <CommonText 
              title="📊 After Additional Purchase" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.afterPurchaseGrid}>
              <View style={styles.afterPurchaseItem}>
                <CommonText title="Total Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={result.totalSharesAfter.toString()} 
                  textStyle={[20, 'bold', '#333']} 
                />
                <CommonText title="shares" textStyle={[12, 'normal', '#999']} />
              </View>
              
              <View style={styles.afterPurchaseItem}>
                <CommonText title="New Average Price" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${result.newAveragePrice}`} 
                  textStyle={[20, 'bold', '#4caf50']} 
                />
              </View>
            </View>
          </View>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <CommonText 
              title="💰 Benefits" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitItem}>
                <CommonText title="Price Reduction" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`${result.priceReduction}%`} 
                  textStyle={[20, 'bold', '#ff5722']} 
                />
              </View>
              
              <View style={styles.benefitItem}>
                <CommonText title="Cost Reduction on Existing Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${result.costReduction}`} 
                  textStyle={[16, 'bold', '#4caf50']} 
                />
              </View>
            </View>
          </View>

          {/* Summary Banner */}
          <View style={styles.summaryBanner}>
            <CommonText 
              title={`Buy ${result.additionalSharesNeeded} shares at ₹${result.currentPrice} to achieve average price of ₹${result.targetAveragePrice}`} 
              textStyle={[16, '600', '#333']} 
            />
            <CommonText 
              title={`Total investment needed: ₹${result.investmentNeeded}`} 
              textStyle={[14, 'normal', '#666']} 
            />
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
              title="Example: If you own 100 shares at ₹50 average and want to achieve ₹43 average at ₹45 current price" 
              textStyle={[16, '600', '#666']} 
            />
            <View style={styles.sampleResultContainer}>
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Current Situation:" textStyle={[14, '600', '#666']} />
                <CommonText title={`100 shares`} textStyle={[16, 'bold', '#2196F3']} numberOfLines={2}/>
              </View>
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Current Average Price:" textStyle={[14, '600', '#666']} />
                <CommonText title={`₹50`} textStyle={[16, 'bold', '#2196F3']} numberOfLines={2}/>
              </View>
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Target:" textStyle={[14, '600', '#666']} />
                <CommonText title="₹43 avg price / share" textStyle={[16, 'bold', '#9c27b0']} />
              </View>
              <View style={styles.sampleDivider} />
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Additional Shares Needed:" textStyle={[14, '600', '#666']} />
                <CommonText title="150 shares" textStyle={[16, 'bold', '#4caf50']} />
              </View>
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Investment Required:" textStyle={[14, '600', '#666']} />
                <CommonText title="₹6,750" textStyle={[16, 'bold', '#ff9800']} />
              </View>
              <View style={styles.sampleDivider} />
              <View style={styles.samplePurchaseRow}>
                <CommonText title="New Average Price:" textStyle={[14, '600', '#666']} />
                <CommonText title="₹43.00" textStyle={[16, 'bold', '#4caf50']} />
              </View>
            </View>
            <CommonText 
              title="Buy 150 shares at ₹45 to achieve your target average of ₹43" 
              textStyle={[14, 'normal', '#888']} 
            />
          </View>
        </View>
      )}

      {/* Save Modal */}
      <SaveModal calculationData={{ ...result, sharesOwned, averagePrice, currentPrice, targetAveragePrice }} reset={resetCalculator}/>
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
    paddingHorizontal: Math.min(20, screenWidth * 0.08),
  },
  stockNameContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: Math.min(15, screenWidth * 0.04),
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4caf50',
    flex: 1,
    marginRight: 10,
  },
  historyButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: Math.min(20, screenWidth * 0.05),
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2196F3',
    minWidth: Math.min(120, screenWidth * 0.3),
    alignItems: 'center',
  },
  inputSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 5,
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
    marginBottom: Math.min(20, screenHeight * 0.025),
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Math.min(15, screenHeight * 0.02),
  },
  inputContainer: {
    flex: 1,
    marginRight: Math.min(10, screenWidth * 0.025),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Math.min(12, screenWidth * 0.03),
    fontSize: Math.min(16, screenWidth * 0.04),
    backgroundColor: 'white',
    marginTop: 5,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal:5,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: Math.min(15, screenHeight * 0.02),
    borderRadius: 8,
    alignItems: 'center',
    marginRight: Math.min(10, screenWidth * 0.025),
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: Math.min(15, screenHeight * 0.02),
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal:5,
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
  keyMetricsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricLabel: {
    flex: 1,
    marginRight: 10,
  },
  sharesCard: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  sharesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  sharesItem: {
    width: '48%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  remainingCard: {
    backgroundColor: '#fff3e0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  remainingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  remainingItem: {
    width: '48%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  totalSharesCard: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  totalSharesItem: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    marginTop: 15,
  },
  summaryBanner: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  formulaSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal:5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formulaCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  sampleResultContainer: {
    marginVertical: 15,
  },
  samplePurchaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  sampleDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  currentSituationCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  situationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  situationItem: {
    width: '30%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  situationRows: {
    marginTop: 15,
  },
  situationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  solutionCard: {
    backgroundColor: '#e3f2fd',
    padding: Math.min(20, screenWidth * 0.05),
    borderRadius: 12,
    marginBottom: Math.min(20, screenHeight * 0.025),
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  solutionGrid: {
    justifyContent: 'space-between',
    marginTop: Math.min(15, screenHeight * 0.02),
  },
  solutionItem: {
    width: '100%',
    padding: Math.min(15, screenWidth * 0.04),
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  afterPurchaseCard: {
    backgroundColor: '#f0f9ff',
    padding: Math.min(20, screenWidth * 0.05),
    borderRadius: 12,
    marginBottom: Math.min(20, screenHeight * 0.025),
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  afterPurchaseGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Math.min(15, screenHeight * 0.02),
  },
  afterPurchaseItem: {
    width: '48%',
    padding: Math.min(15, screenWidth * 0.04),
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  benefitsCard: {
    backgroundColor: '#fff3e0',
    padding: Math.min(20, screenWidth * 0.05),
    borderRadius: 12,
    marginBottom: Math.min(20, screenHeight * 0.025),
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Math.min(15, screenHeight * 0.02),
  },
  benefitItem: {
    width: '48%',
    padding: Math.min(15, screenWidth * 0.04),
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  targetCard: {
    backgroundColor: '#f3e5f5',
    padding: Math.min(20, screenWidth * 0.05),
    borderRadius: 12,
    marginBottom: Math.min(20, screenHeight * 0.025),
    borderWidth: 1,
    borderColor: '#9c27b0',
  },
  targetItem: {
    padding: Math.min(15, screenWidth * 0.04),
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    marginTop: Math.min(15, screenHeight * 0.02),
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

export default SharePriceMatchCalculator; 