import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

export const PixelSpacing = ({ size = 0, left = 0 ,right = 0,top = 0,bottom = 0}) => (
  <View style={{ height: size, marginLeft: left, marginRight: right, marginTop: top, marginBottom: bottom }} />
);

const StockSplitBonusCalculator = () => {
  const { 
    toggleHistoryModal, 
    toggleSaveModal, 
    saveCalculation,
    getCalculationsForType, 
    loadedCalculation, 
    clearLoadedCalculation,
    editingCalculationId,
    corporateActionType,
    setCorporateActionType
  } = useCalculatorStore();
  
  const savedCalculations = getCalculationsForType('stock-split');
  const [currentShares, setCurrentShares] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [splitRatio, setSplitRatio] = useState('');
  const [splitDenominator, setSplitDenominator] = useState('');
  const [bonusRatio, setBonusRatio] = useState('');
  const [bonusDenominator, setBonusDenominator] = useState('');
  const [result, setResult] = useState(null);

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      setResult(loadedCalculation);
      setCurrentShares(loadedCalculation.currentShares || '');
      setCurrentPrice(loadedCalculation.currentPrice || '');
      setSplitRatio(loadedCalculation.splitRatio || '');
      setSplitDenominator(loadedCalculation.splitDenominator || '');
      setBonusRatio(loadedCalculation.bonusRatio || '');
      setBonusDenominator(loadedCalculation.bonusDenominator || '');
      setCorporateActionType(loadedCalculation.actionType || 'split');
      clearLoadedCalculation();
    }
  }, [loadedCalculation, clearLoadedCalculation]);

  const handleActionTypeChange = (type) => {
    setCorporateActionType(type);
    if (type === 'split') {
      setBonusRatio('');
      setBonusDenominator('');
    } else {
      setSplitRatio('');
      setSplitDenominator('');
    }
  };

  const validateInputs = () => {
    // Validate current shares and price
    if (!currentShares || !currentPrice) {
      Alert.alert('Error', 'Please enter current shares and price.');
      return false;
    }

    const shares = parseFloat(currentShares);
    const price = parseFloat(currentPrice);

    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) {
      Alert.alert('Error', 'Please enter valid numbers for shares and price.');
      return false;
    }

    // Validate split ratio
    if (corporateActionType === 'split') {
      if (!splitRatio || !splitDenominator) {
        Alert.alert('Error', 'Please enter both numerator and denominator for split ratio.');
        return false;
      }

      const numerator = parseFloat(splitRatio);
      const denominator = parseFloat(splitDenominator);

      if (isNaN(numerator) || isNaN(denominator) || numerator <= 0 || denominator <= 0) {
        Alert.alert('Error', 'Numerator and denominator must be positive numbers.');
        return false;
      }

      if (numerator <= denominator) {
        Alert.alert('Error', 'Numerator must be greater than denominator (e.g. 2 for 2:1 split).');
        return false;
      }
    }

    // Validate bonus ratio
    if (corporateActionType === 'bonus') {
      if (!bonusRatio || !bonusDenominator) {
        Alert.alert('Error', 'Please enter both numerator and denominator for bonus ratio.');
        return false;
      }

      const numerator = parseFloat(bonusRatio);
      const denominator = parseFloat(bonusDenominator);

      if (isNaN(numerator) || isNaN(denominator) || numerator <= 0 || denominator <= 0) {
        Alert.alert('Error', 'Numerator and denominator must be positive numbers.');
        return false;
      }
    }

    return true;
  };

  const calculateSplitAndBonus = () => {
    if (!validateInputs()) {
      return;
    }

    const shares = parseFloat(currentShares);
    const price = parseFloat(currentPrice);
    const splitNumerator = splitRatio ? parseFloat(splitRatio) : 0;
    const splitDenominatorValue = splitDenominator ? parseFloat(splitDenominator) : 0;
    const bonusNumerator = bonusRatio ? parseFloat(bonusRatio) : 0;
    const bonusDenominatorValue = bonusDenominator ? parseFloat(bonusDenominator) : 0;

    let newShares = shares;
    let extraShares = 0;
    let fractionalShares = 0;
    let totalValue = shares * price;

    // Calculate stock split effect
    if (corporateActionType === 'split' && splitNumerator > 0 && splitDenominatorValue > 0) {
      const splitRatio = splitNumerator / splitDenominatorValue;
      extraShares = (shares * splitRatio) - shares;
      newShares = shares * splitRatio;
      totalValue = newShares * (price / splitRatio);
    }

    // Calculate bonus share effect (2:3 format means 2 bonus shares for every 3 shares held)
    if (corporateActionType === 'bonus' && bonusNumerator > 0 && bonusDenominatorValue > 0) {
      // Bonus Shares = (Original Shares × Bonus Numerator) ÷ Bonus Denominator
      // For 2:3 ratio: Bonus Shares = (Original Shares × 2) ÷ 3
      extraShares = (shares * bonusNumerator) / bonusDenominatorValue;
      fractionalShares = extraShares - Math.floor(extraShares);
      newShares = shares + Math.floor(extraShares);
      totalValue = newShares * price; // Price remains the same for bonus shares
    }

    setResult({
      extraShares: extraShares.toFixed(2),
      fractionalShares: fractionalShares.toFixed(2),
      totalShares: newShares.toFixed(0),
      totalValue: totalValue.toFixed(2),
      actionType: corporateActionType,
      currentShares,
      currentPrice,
      splitRatio,
      splitDenominator,
      bonusRatio,
      bonusDenominator
    });
  };

  const resetCalculator = () => {
    setCurrentShares('');
    setCurrentPrice('');
    setSplitRatio('');
    setSplitDenominator('');
    setBonusRatio('');
    setBonusDenominator('');
    setCorporateActionType('split');
    setResult(null);
  };

  const handleSave = () => {
    if (editingCalculationId && result) {
      saveCalculation({
        ...result,
        currentShares,
        currentPrice,
        splitRatio,
        splitDenominator,
        bonusRatio,
        bonusDenominator,
        actionType: corporateActionType
      }, 'stock-split');
    } else {
      toggleSaveModal();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Holdings */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText 
            title="💰 Current Holdings" 
            textStyle={[18, 'bold', '#333']} 
          />
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <CommonText title="Current Shares" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={currentShares}
              onChangeText={setCurrentShares}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <CommonText title="Current Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 150.00"
              keyboardType="numeric"
              value={currentPrice}
              onChangeText={setCurrentPrice}
            />
          </View>
        </View>
      </View>

      {/* Action Type Selection */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText 
            title="🎯 Corporate Action Type" 
            textStyle={[18, 'bold', '#333']} 
          />
        </View>
        
        <View style={styles.actionTypeContainer}>
          <TouchableOpacity 
            style={[
              styles.actionTypeButton, 
              corporateActionType === 'split' && styles.actionTypeButtonActive
            ]} 
            onPress={() => handleActionTypeChange('split')}
          >
            <CommonText 
              title="📊 Stock Split" 
              textStyle={[14, '600', corporateActionType === 'split' ? 'white' : '#666']} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionTypeButton, 
              corporateActionType === 'bonus' && styles.actionTypeButtonActive
            ]} 
            onPress={() => handleActionTypeChange('bonus')}
          >
            <CommonText 
              title="🎁 Bonus Shares" 
              textStyle={[14, '600', corporateActionType === 'bonus' ? 'white' : '#666']} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Split and Bonus Inputs */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText 
            title={corporateActionType === 'split' ? "📊 Stock Split Details" : "🎁 Bonus Share Details"} 
            textStyle={[18, 'bold', '#333']} 
          />
        </View>
        
        {corporateActionType === 'split' ? (
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <CommonText title="Split Numerator" textStyle={[14, '500', '#666']} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 2"
                keyboardType="numeric"
                value={splitRatio}
                onChangeText={setSplitRatio}
              />
              <CommonText 
                title="Enter 2 if ration 2:1" 
                textStyle={[12, '400', '#999']} 
              />
            </View>
            
            <View style={styles.inputContainer}>
              <CommonText title="Split Denominator" textStyle={[14, '500', '#666']} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 1"
                keyboardType="numeric"
                value={splitDenominator}
                onChangeText={setSplitDenominator}
              />
              <CommonText 
                title="Enter 1 if ration 2:1" 
                textStyle={[12, '400', '#999']} 
              />
            </View>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <CommonText title="Bonus Numerator" textStyle={[14, '500', '#666']} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 2"
                keyboardType="numeric"
                value={bonusRatio}
                onChangeText={setBonusRatio}
              />
              <CommonText 
                title="Enter 2 if ration 2:3 " 
                textStyle={[12, '400', '#999']} 
              />
            </View>
            
            <View style={styles.inputContainer}>
              <CommonText title="Bonus Denominator" textStyle={[14, '500', '#666']} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 3 "
                keyboardType="numeric"
                value={bonusDenominator}
                onChangeText={setBonusDenominator}
              />
              <CommonText 
                title="Enter 3 if ration 2:3" 
                textStyle={[12, '400', '#999']} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateSplitAndBonus}>
          <CommonText title="Calculate" textStyle={[16, 'bold', 'white']} />
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
              title="📊 Calculation Results" 
              textStyle={[22, 'bold', '#333']} 
            />
          </View>
          
          {/* Simple Results Cards */}
          <View style={styles.simpleResultsGrid}>
            <View style={[styles.simpleResultItem, { backgroundColor: '#e8f5e8', borderColor: '#4caf50' }]}>
              <View style={styles.simpleResultIcon}>
                <CommonText title="🎁" textStyle={[24, 'normal', '#4caf50']} />
              </View>
              <View style={styles.simpleResultContent}>
                <CommonText 
                  title="Extra Shares" 
                  textStyle={[14, '500', '#666']} 
                />
                <CommonText 
                  title={result.extraShares} 
                  textStyle={[20, 'bold', '#4caf50']} 
                />
              </View>
            </View>

            <PixelSpacing size={18}/>
                {/* Fractional Shares Section */}
          {parseFloat(result.fractionalShares) > 0 && (
            <>
              <View style={[styles.simpleResultItem, { backgroundColor: '#fff3e0', borderColor: '#ff9800' }]}>
                <View style={styles.simpleResultIcon}>
                  <CommonText title="🔢" textStyle={[24, 'normal', '#ff9800']} />
                </View>
                <View style={styles.simpleResultContent}>
                  <CommonText 
                    title="Fractional Shares" 
                    textStyle={[14, '500', '#666']} 
                  />
                  <CommonText 
                    title={result.fractionalShares} 
                    textStyle={[20, 'bold', '#ff9800']} 
                  />
                </View>
              </View>
              <PixelSpacing size={12}/>

              {/* Red Note */}
                <CommonText 
                  title="⚠️ Note:" 
                  textStyle={[14, 'bold', '#d32f2f']} 
                />
                <View style={{marginLeft: 24}}>
                <CommonText 
                  title="The fractional value is paid in cash or ignored based on company policy." 
                  textStyle={[12,400, '#d32f2f']} 
                />
                </View>
            </>
          )}
            <PixelSpacing size={18}/>

            <View style={[styles.simpleResultItem, { backgroundColor: '#e3f2fd', borderColor: '#2196F3' }]}>
              <View style={styles.simpleResultIcon}>
                <CommonText title="📈" textStyle={[24, 'normal', '#2196F3']} />
              </View>
              <View style={styles.simpleResultContent}>
                <CommonText 
                  title="Total Shares" 
                  textStyle={[14, '500', '#666']} 
                />
                <CommonText 
                  title={result.totalShares} 
                  textStyle={[20, 'bold', '#2196F3']} 
                />
              </View>
            </View>
            <PixelSpacing size={18}/>
            
            <View style={[styles.simpleResultItem, { backgroundColor: '#f3e5f5', borderColor: '#9c27b0' }]}>
              <View style={styles.simpleResultIcon}>
                <CommonText title="💰" textStyle={[24, 'normal', '#9c27b0']} />
              </View>
              <View style={styles.simpleResultContent}>
                <CommonText 
                  title="Total Value" 
                  textStyle={[14, '500', '#666']} 
                />
                <CommonText 
                  title={`₹${result.totalValue}`} 
                  textStyle={[20, 'bold', '#9c27b0']} 
                />
              </View>
            </View>
          </View>

      
        </View>
      )}

      <SaveModal 
        calculationType="stock-split"
        calculationData={{
          ...result,
          currentShares,
          currentPrice,
          splitRatio,
          splitDenominator,
          bonusRatio,
          bonusDenominator,
          actionType: corporateActionType
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 4,
    backgroundColor: '#fafafa',
  },
  actionTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  actionTypeButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    marginBottom: 20,
  },
  simpleResultsGrid: {
    // gap: 16,
  },
  simpleResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleResultIcon: {
    marginRight: 16,
  },
  simpleResultContent: {
    flex: 1,
  },
  noteSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  redNoteSection: {
  },
});

export default StockSplitBonusCalculator; 