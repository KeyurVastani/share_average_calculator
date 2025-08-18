import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

export const PixelSpacing = ({ size = 0, left = 0, right = 0, top = 0, bottom = 0 }) => (
  <View style={{ height: size, marginLeft: left, marginRight: right, marginTop: top, marginBottom: bottom }} />
);

// Profit Loss Calculation Function
const calculateProfitLoss = (buyPrice, sellPrice, quantity) => {
  const result = (sellPrice - buyPrice) * quantity;

  if (result > 0) {
    return {
      type: 'Profit',
      amount: result,
      percentage: ((sellPrice - buyPrice) / buyPrice) * 100
    };
  } else if (result < 0) {
    return {
      type: 'Loss',
      amount: Math.abs(result),
      percentage: ((sellPrice - buyPrice) / buyPrice) * 100
    };
  } else {
    return {
      type: 'No Profit No Loss',
      amount: 0,
      percentage: 0
    };
  }
};

const ProfitLossCalculator = () => {
  const {
    toggleSaveModal,
    saveCalculation,
    editingCalculationId
  } = useCalculatorStore();

  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to format numbers in Indian numbering system (e.g., 10,00,00,000)
  const formatIndianNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('en-IN');
  };

  const validateInputs = () => {
    if (!buyPrice || !sellPrice || !quantity) {
      Alert.alert('Error', 'Please enter all values (Buy Price, Sell Price, and Quantity).');
      return false;
    }

    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    const qty = parseFloat(quantity);

    if (isNaN(buy) || isNaN(sell) || isNaN(qty) || buy <= 0 || sell <= 0 || qty <= 0) {
      Alert.alert('Error', 'Please enter valid positive numbers for all fields.');
      return false;
    }

    return true;
  };

  const calculateProfitLossResult = () => {
    // Clear previous results and start loading
    setResult(null);
    setIsLoading(true);

    // Validate inputs
    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    try {
      const buy = parseFloat(buyPrice);
      const sell = parseFloat(sellPrice);
      const qty = parseFloat(quantity);

      const calculation = calculateProfitLoss(buy, sell, qty);

      setResult({
        type: calculation.type,
        amount: calculation.amount.toFixed(2),
        percentage: calculation.percentage.toFixed(2),
        buyPrice,
        sellPrice,
        quantity,
        totalBuyValue: (buy * qty).toFixed(2),
        totalSellValue: (sell * qty).toFixed(2)
      });

    } catch (error) {
      Alert.alert('Error', 'Your entered values are wrong. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCalculator = () => {
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
    setResult(null);
    setIsLoading(false);
  };

  const handleSave = () => {
    if (editingCalculationId && result) {
      saveCalculation({
        ...result,
        buyPrice,
        sellPrice,
        quantity
      }, 'profit-loss');
    } else {
      toggleSaveModal();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trade Details */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText
            title="💰 Trade Details"
            textStyle={[18, 'bold', '#333']}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <CommonText title="Buy Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={buyPrice ? formatIndianNumber(buyPrice) : ''}
              onChangeText={(text) => {
                // Remove commas and non-numeric characters for calculation
                const numericValue = text.replace(/[^\d.]/g, '');
                setBuyPrice(numericValue);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <CommonText title="Sell Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 120"
              keyboardType="numeric"
              value={sellPrice ? formatIndianNumber(sellPrice) : ''}
              onChangeText={(text) => {
                // Remove commas and non-numeric characters for calculation
                const numericValue = text.replace(/[^\d.]/g, '');
                setSellPrice(numericValue);
              }}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <CommonText title="Shares Quantity" textStyle={[14, '500', '#666']} />
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            keyboardType="numeric"
                          value={quantity ? formatIndianNumber(quantity) : ''}
              onChangeText={(text) => {
                // Remove commas and non-numeric characters for calculation
                const numericValue = text.replace(/[^\d.]/g, '');
                setQuantity(numericValue);
              }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.calculateButton,
            isLoading && styles.calculateButtonDisabled
          ]}
          onPress={calculateProfitLossResult}
          disabled={isLoading}
        >
          <CommonText
            title={isLoading ? "Calculating..." : "Calculate P&L"}
            textStyle={[16, 'bold', 'white']}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetCalculator}
          disabled={isLoading}
        >
          <CommonText title="Reset" textStyle={[16, '600', '#666']} />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.resultSection}>
          <View style={styles.loadingContainer}>
            <CommonText
              title="🔄 Calculating..."
              textStyle={[18, 'bold', '#666']}
            />
            <CommonText
              title="Please wait while we process your calculation"
              textStyle={[14, '400', '#999']}
            />
          </View>
        </View>
      )}

      {/* Results */}
      {result && !isLoading && (
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

          {/* Main Result Card */}
          <View style={[styles.simpleResultItem, {
            backgroundColor: result.type === 'Profit' ? '#e8f5e8' : result.type === 'Loss' ? '#ffebee' : '#f5f5f5',
            borderColor: result.type === 'Profit' ? '#4caf50' : result.type === 'Loss' ? '#f44336' : '#666'
          }]}>
            <View style={styles.simpleResultIcon}>
              <CommonText
                title={result.type === 'Profit' ? "📈" : result.type === 'Loss' ? "📉" : "➖"}
                textStyle={[24, 'normal', result.type === 'Profit' ? '#4caf50' : result.type === 'Loss' ? '#f44336' : '#666']}
              />
            </View>
            <View style={styles.simpleResultContent}>
              <CommonText
                title={result.type}
                textStyle={[14, '500', '#666']}
              />
              <CommonText
                title={`₹${result.amount}`}
                textStyle={[20, 'bold', result.type === 'Profit' ? '#4caf50' : result.type === 'Loss' ? '#f44336' : '#666']}
              />
            </View>
          </View>

          <PixelSpacing size={12} />

          {/* Percentage Result */}
          <View style={[styles.simpleResultItem, { backgroundColor: '#e3f2fd', borderColor: '#2196F3' }]}>
            <View style={styles.simpleResultIcon}>
              <CommonText title="📊" textStyle={[24, 'normal', '#2196F3']} />
            </View>
            <View style={styles.simpleResultContent}>
              <CommonText
                title="Percentage"
                textStyle={[14, '500', '#666']}
              />
              <CommonText
                title={`${result.percentage}%`}
                textStyle={[20, 'bold', '#2196F3']}
              />
            </View>
          </View>

          <PixelSpacing size={12} />

          {/* Trade Summary */}
          <View style={styles.tradeSummarySection}>
            <CommonText
              title="📋 Trade Summary"
              textStyle={[18, 'bold', '#333']}
            />
            <PixelSpacing size={12} />

            <View style={styles.tradeSummaryGrid}>
              <View style={[styles.tradeSummaryItem, { backgroundColor: '#fff3e0', borderColor: '#ff9800' }]}>
                <CommonText title="Total Buy Value" textStyle={[12, '500', '#666']} />
                <CommonText title={`₹${result.totalBuyValue}`} textStyle={[16, 'bold', '#ff9800']} />
              </View>

              <View style={[styles.tradeSummaryItem, { backgroundColor: '#f3e5f5', borderColor: '#9c27b0' }]}>
                <CommonText title="Total Sell Value" textStyle={[12, '500', '#666']} />
                <CommonText title={`₹${result.totalSellValue}`} textStyle={[16, 'bold', '#9c27b0']} />
              </View>
            </View>
          </View>
        </View>
      )}

      <SaveModal
        calculationType="profit-loss"
        calculationData={{
          ...result,
          buyPrice,
          sellPrice,
          quantity
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
    marginBottom: 16,
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
  calculateButtonDisabled: {
    backgroundColor: '#a0d7e7',
    opacity: 0.7,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeSummarySection: {
    marginTop: 16,
  },
  tradeSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tradeSummaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
});

export default ProfitLossCalculator; 