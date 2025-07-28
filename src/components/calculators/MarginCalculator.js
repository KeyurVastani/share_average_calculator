import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

export const PixelSpacing = ({
  size = 0,
  left = 0,
  right = 0,
  top = 0,
  bottom = 0,
}) => (
  <View
    style={{
      height: size,
      marginLeft: left,
      marginRight: right,
      marginTop: top,
      marginBottom: bottom,
    }}
  />
);

const MarginCalculator = () => {
  const { toggleSaveModal, saveCalculation, editingCalculationId } =
    useCalculatorStore();

  const [amount, setAmount] = useState('');
  const [sharePrice, setSharePrice] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({
    intraday: false,
    delivery: false,
  });
  const [intradayLeverage, setIntradayLeverage] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionToggle = option => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const validateInputs = () => {
    if (!amount || !sharePrice) {
      Alert.alert('Error', 'Please enter both Amount and Share Price.');
      return false;
    }

    const amountValue = parseFloat(amount);
    const priceValue = parseFloat(sharePrice);

    if (
      isNaN(amountValue) ||
      isNaN(priceValue) ||
      amountValue <= 0 ||
      priceValue <= 0
    ) {
      Alert.alert(
        'Error',
        'Please enter valid positive numbers for Amount and Share Price.',
      );
      return false;
    }

    if (!selectedOptions.intraday && !selectedOptions.delivery) {
      Alert.alert(
        'Error',
        'Please select at least one option (Intraday or Delivery).',
      );
      return false;
    }

    if (
      selectedOptions.intraday &&
      (!intradayLeverage || parseFloat(intradayLeverage) <= 0)
    ) {
      Alert.alert(
        'Error',
        'Please enter a valid leverage value for Intraday trading.',
      );
      return false;
    }

    return true;
  };

  const calculateMargin = () => {
    // Clear previous results and start loading
    setResult(null);
    setIsLoading(true);

    // Validate inputs
    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    try {
      const amountValue = parseFloat(amount);
      const priceValue = parseFloat(sharePrice);
      const leverage = selectedOptions.intraday
        ? parseFloat(intradayLeverage)
        : 1;

      const results = {};

      // Calculate shares that can be bought
      const sharesCanBuy = Math.floor(amountValue / priceValue);

      if (selectedOptions.delivery) {
        // Delivery calculation (1x leverage)
        const deliveryMargin = amountValue;
        const deliveryShares = sharesCanBuy;
        const deliveryValue = deliveryShares * priceValue;
        const deliveryRemaining = amountValue - deliveryValue;

        results.delivery = {
          margin: deliveryMargin.toFixed(2),
          shares: deliveryShares,
          value: deliveryValue.toFixed(2),
          remaining: deliveryRemaining.toFixed(2),
          leverage: 1,
        };
      }

      if (selectedOptions.intraday) {
        // Intraday calculation (custom leverage)
        const intradayMargin = amountValue;
        const intradayShares = Math.floor(
          (amountValue * leverage) / priceValue,
        );
        const intradayValue = intradayShares * priceValue;
        const intradayRemaining = amountValue * leverage - intradayValue;

        results.intraday = {
          margin: intradayMargin.toFixed(2),
          shares: intradayShares,
          value: intradayValue.toFixed(2),
          remaining: intradayRemaining.toFixed(2),
          leverage: leverage,
        };
      }

      setResult(results);
    } catch (error) {
      Alert.alert(
        'Error',
        'Your entered values are wrong. Please check your inputs and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetCalculator = () => {
    setAmount('');
    setSharePrice('');
    setSelectedOptions({
      intraday: false,
      delivery: false,
    });
    setIntradayLeverage('');
    setResult(null);
    setIsLoading(false);
  };

  const handleSave = () => {
    if (editingCalculationId && result) {
      saveCalculation(
        {
          ...result,
          amount,
          sharePrice,
          selectedOptions,
          intradayLeverage,
        },
        'margin',
      );
    } else {
      toggleSaveModal();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trading Options */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText
            title="📊 Trading Options"
            textStyle={[18, 'bold', '#333']}
          />
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => handleOptionToggle('delivery')}
          >
            <View
              style={[
                styles.checkbox,
                selectedOptions.delivery && styles.checkboxSelected,
              ]}
            >
              {selectedOptions.delivery && (
                <CommonText title="✓" textStyle={[12, 'bold', 'white']} />
              )}
            </View>
            <View style={styles.optionContent}>
              <CommonText title="📦 Delivery" textStyle={[16, '600', '#333']} />
              <CommonText
                title="   Leverage: 1x"
                textStyle={[12, '400', '#666']}
              />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => handleOptionToggle('intraday')}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedOptions.intraday && styles.checkboxSelected,
                ]}
              >
                {selectedOptions.intraday && (
                  <CommonText title="✓" textStyle={[12, 'bold', 'white']} />
                )}
              </View>
              <View style={styles.optionContent}>
                <CommonText
                  title="⚡ Intraday"
                  textStyle={[16, '600', '#333']}
                />
                <CommonText
                  title="Custom Leverage"
                  textStyle={[12, '400', '#666']}
                />
              </View>
            </TouchableOpacity>

            {/* Leverage Input for Intraday */}
            {selectedOptions.intraday && (
              <View style={styles.leverageContainer}>
                <CommonText
                  title="Leverage (x)"
                  textStyle={[14, '500', '#666']}
                />
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    value={intradayLeverage}
                    onChangeText={setIntradayLeverage}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
      {/* Investment Details */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText
            title="💰 Investment Details"
            textStyle={[18, 'bold', '#333']}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <CommonText title="Amount" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 10000"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputContainer}>
            <CommonText title="Share Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={sharePrice}
              onChangeText={setSharePrice}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.calculateButton,
            isLoading && styles.calculateButtonDisabled,
          ]}
          onPress={calculateMargin}
          disabled={isLoading}
        >
          <CommonText
            title={isLoading ? 'Calculating...' : 'Calculate Margin'}
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
              title="📊 Margin Results"
              textStyle={[22, 'bold', '#333']}
            />
            <TouchableOpacity
              style={styles.saveResultButton}
              onPress={handleSave}
            >
              <CommonText
                title={editingCalculationId ? '💾 Update' : '💾 Save'}
                textStyle={[14, '600', '#4caf50']}
              />
            </TouchableOpacity>
          </View>

          {/* Delivery Results */}
          {result.delivery && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: '#e8f5e8', borderColor: '#4caf50' },
              ]}
            >
              <View style={styles.resultCardHeader}>
                <CommonText
                  title="📦 Delivery Trading"
                  textStyle={[18, 'bold', '#4caf50']}
                />
                <CommonText
                  title={`Leverage: ${result.delivery.leverage}x`}
                  textStyle={[14, '500', '#666']}
                />
              </View>

              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <CommonText
                    title="Margin Used"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={`₹${result.delivery.margin}`}
                    textStyle={[16, 'bold', '#4caf50']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <CommonText
                    title="Shares Can Buy"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={result.delivery.shares.toString()}
                    textStyle={[16, 'bold', '#4caf50']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <CommonText
                    title="Total Value"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={`₹${result.delivery.value}`}
                    textStyle={[16, 'bold', '#4caf50']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <CommonText
                    title="Remaining"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={`₹${result.delivery.remaining}`}
                    textStyle={[16, 'bold', '#4caf50']}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Intraday Results */}
          {result.intraday && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: '#fff3e0', borderColor: '#ff9800' },
              ]}
            >
              <View style={styles.resultCardHeader}>
                <CommonText
                  title="⚡ Intraday Trading"
                  textStyle={[18, 'bold', '#ff9800']}
                />
                <CommonText
                  title={`Leverage: ${result.intraday.leverage}x`}
                  textStyle={[14, '500', '#666']}
                />
              </View>

              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <CommonText
                    title="Margin Used"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={`₹${result.intraday.margin}`}
                    textStyle={[16, 'bold', '#ff9800']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <CommonText
                    title="Shares Can Buy"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={result.intraday.shares.toString()}
                    textStyle={[16, 'bold', '#ff9800']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <CommonText
                    title="Total Value"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={`₹${result.intraday.value}`}
                    textStyle={[16, 'bold', '#ff9800']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <CommonText
                    title="Remaining"
                    textStyle={[12, '500', '#666']}
                  />
                  <CommonText
                    title={`₹${result.intraday.remaining}`}
                    textStyle={[16, 'bold', '#ff9800']}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <SaveModal
        calculationType="margin"
        calculationData={{
          ...result,
          amount,
          sharePrice,
          selectedOptions,
          intradayLeverage,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionContent: {
    flex: 1,
  },
  leverageContainer: {
    marginTop: 8,
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
  resultCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default MarginCalculator;
