import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

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
  
  const [currentPrice, setCurrentPrice] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [result, setResult] = useState(null);
  const [currentStockName, setCurrentStockName] = useState('');

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      setCurrentPrice(loadedCalculation.currentPrice || '');
      setTargetAmount(loadedCalculation.targetAmount || '');
      setResult(loadedCalculation);
      setCurrentStockName(loadedCalculation.stockName || '');
      clearLoadedCalculation();
    }
  }, [loadedCalculation, clearLoadedCalculation]);

  const calculateShares = () => {
    // Validate inputs
    if (!currentPrice || isNaN(parseFloat(currentPrice)) || parseFloat(currentPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid current share price.');
      return;
    }

    if (!targetAmount || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount.');
      return;
    }

    const price = parseFloat(currentPrice);
    const amount = parseFloat(targetAmount);
    
    // Calculate number of shares needed
    const sharesNeeded = Math.floor(amount / price);
    const actualInvestment = sharesNeeded * price;
    const remainingAmount = amount - actualInvestment;
    
    // Calculate if you can buy additional fractional shares
    const fractionalShares = (amount / price) - sharesNeeded;
    const totalSharesWithFraction = amount / price;

    setResult({
      currentPrice: price.toFixed(2),
      targetAmount: amount.toFixed(2),
      sharesNeeded: sharesNeeded,
      actualInvestment: actualInvestment.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2),
      fractionalShares: fractionalShares.toFixed(4),
      totalSharesWithFraction: totalSharesWithFraction.toFixed(4),
      canBuyFullShares: sharesNeeded > 0,
      stockName: currentStockName
    });
  };

  const resetCalculator = () => {
    setCurrentPrice('');
    setTargetAmount('');
    setResult(null);
    setCurrentStockName('');
  };

  const handleSave = () => {
    if (editingCalculationId && result && currentStockName) {
      saveCalculation({
        ...result,
        currentPrice,
        targetAmount,
        stockName: currentStockName
      }, 'share-price-match');
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


      {/* Current Share Price Input */}
      <View style={styles.inputSection}>
        <CommonText 
          title="Current Share Price" 
          textStyle={[16, '600', '#333']} 
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter current share price (e.g., 150.50)"
            keyboardType="numeric"
            value={currentPrice}
            onChangeText={setCurrentPrice}
          />
        </View>
      </View>

      {/* Target Amount Input */}
      <View style={styles.inputSection}>
        <CommonText 
          title="Target Amount to Invest" 
          textStyle={[16, '600', '#333']} 
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter amount you want to invest (e.g., 10000)"
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateShares}>
          <CommonText title="Calculate Shares" textStyle={[16, 'bold', 'white']} />
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
            <TouchableOpacity style={styles.saveResultButton} onPress={handleSave}>
              <CommonText title={editingCalculationId ? "💾 Update" : "💾 Save"} textStyle={[14, '600', '#4caf50']} />
            </TouchableOpacity>
          </View>
          
          {/* Key Metrics Card */}
          <View style={styles.keyMetricsCard}>
            <View style={styles.metricRow}>
              <View style={styles.metricLabel}>
                <CommonText title="Current Share Price" textStyle={[16, '600', '#666']} />
              </View>
              <CommonText 
                title={`₹${result.currentPrice}`} 
                textStyle={[20, 'bold', '#2196F3']} 
              />
            </View>
            
            <View style={styles.metricRow}>
              <View style={styles.metricLabel}>
                <CommonText title="Target Amount" textStyle={[16, '600', '#666']} />
              </View>
              <CommonText 
                title={`₹${result.targetAmount}`} 
                textStyle={[20, 'bold', '#333']} 
              />
            </View>
          </View>

          {/* Shares Calculation Card */}
          <View style={styles.sharesCard}>
            <CommonText 
              title="📈 Shares You Can Buy" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.sharesGrid}>
              <View style={styles.sharesItem}>
                <CommonText title="Full Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={result.sharesNeeded.toString()} 
                  textStyle={[24, 'bold', '#4caf50']} 
                />
                <CommonText title="shares" textStyle={[12, 'normal', '#999']} />
              </View>
              
              <View style={styles.sharesItem}>
                <CommonText title="Actual Investment" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${result.actualInvestment}`} 
                  textStyle={[18, 'bold', '#333']} 
                />
              </View>
            </View>
          </View>

          {/* Remaining Amount Card */}
          <View style={styles.remainingCard}>
            <CommonText 
              title="💰 Remaining Amount" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.remainingGrid}>
              <View style={styles.remainingItem}>
                <CommonText title="Unused Amount" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${result.remainingAmount}`} 
                  textStyle={[20, 'bold', '#ff9800']} 
                />
              </View>
              
              <View style={styles.remainingItem}>
                <CommonText title="Fractional Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={result.fractionalShares} 
                  textStyle={[16, 'bold', '#666']} 
                />
                <CommonText title="shares" textStyle={[12, 'normal', '#999']} />
              </View>
            </View>
          </View>

          {/* Total Shares with Fraction */}
          <View style={styles.totalSharesCard}>
            <CommonText 
              title="📊 Total Shares (Including Fraction)" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.totalSharesItem}>
              <CommonText title="Total Shares" textStyle={[14, '500', '#666']} />
              <CommonText 
                title={result.totalSharesWithFraction} 
                textStyle={[24, 'bold', '#2196F3']} 
              />
              <CommonText title="shares" textStyle={[12, 'normal', '#999']} />
            </View>
          </View>

          {/* Summary Banner */}
          <View style={styles.summaryBanner}>
            <CommonText 
              title={`With ₹${result.targetAmount}, you can buy ${result.sharesNeeded} full shares at ₹${result.currentPrice} each`} 
              textStyle={[16, '600', '#333']} 
            />
            {parseFloat(result.remainingAmount) > 0 && (
              <CommonText 
                title={`You'll have ₹${result.remainingAmount} remaining`} 
                textStyle={[14, 'normal', '#666']} 
              />
            )}
          </View>
        </View>
      )}

      {/* Formula */}
      <View style={styles.formulaSection}>
        <CommonText 
          title="Formula" 
          textStyle={[18, 'bold', '#333']} 
        />
        <View style={styles.formulaCard}>
          <CommonText 
            title="Number of Shares = Target Amount ÷ Current Share Price" 
            textStyle={[16, '600', '#666']} 
          />
          <CommonText 
            title="Full Shares = Floor(Target Amount ÷ Current Share Price)" 
            textStyle={[14, 'normal', '#888']} 
          />
          <CommonText 
            title="Remaining Amount = Target Amount - (Full Shares × Current Price)" 
            textStyle={[14, 'normal', '#888']} 
          />
        </View>
      </View>

      {/* Save Modal */}
      <SaveModal calculationData={{ ...result, currentPrice, targetAmount }} reset={resetCalculator}/>
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
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
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
    marginHorizontal: 20,
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
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
});

export default SharePriceMatchCalculator; 