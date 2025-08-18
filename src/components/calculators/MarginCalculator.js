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
  const { } = useCalculatorStore();

  const [amount, setAmount] = useState('');
  const [sharePrice, setSharePrice] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({
    intraday: false,
    delivery: false,
  });
  const [intradayLeverage, setIntradayLeverage] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to format numbers in Indian numbering system (e.g., 10,00,00,000)
  const formatIndianNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('en-IN');
  };

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
        // Intraday calculation (share-based with leverage)
        const sharesCanBuy = Math.floor((amountValue * leverage) / priceValue);
        const shareValue = priceValue / leverage; // Price per share divided by leverage
        const totalInvestment = sharesCanBuy * shareValue; // Actual investment value
        const remainingAmount = amountValue - totalInvestment; // Remaining amount

        results.intraday = {
          shares: sharesCanBuy,
          shareValue: shareValue.toFixed(2),
          totalInvestment: totalInvestment.toFixed(2),
          remainingAmount: remainingAmount.toFixed(2),
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
                    value={intradayLeverage ? formatIndianNumber(intradayLeverage) : ''}
                    onChangeText={(text) => {
                      // Remove commas and non-numeric characters for calculation
                      const numericValue = text.replace(/[^\d.]/g, '');
                      setIntradayLeverage(numericValue);
                    }}
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
              value={amount ? formatIndianNumber(amount) : ''}
              onChangeText={(text) => {
                // Remove commas and non-numeric characters for calculation
                const numericValue = text.replace(/[^\d.]/g, '');
                setAmount(numericValue);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <CommonText title="Share Price" textStyle={[14, '500', '#666']} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={sharePrice ? formatIndianNumber(sharePrice) : ''}
              onChangeText={(text) => {
                // Remove commas and non-numeric characters for calculation
                const numericValue = text.replace(/[^\d.]/g, '');
                setSharePrice(numericValue);
              }}
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
          </View>

          {/* Results Display with Field Labels */}
          <View style={styles.resultsDisplay}>
            {/* Delivery Results */}
            {result.delivery && (
              <>
                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="📦 Delivery Trading" textStyle={[14, '600', '#333']} />
                  </View>
                </View>
                
                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Total Number of Shares" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={result.delivery.shares.toString()}
                    textStyle={[20, 'bold', '#4caf50']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Total Value" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={`₹${result.delivery.value}`}
                    textStyle={[20, 'bold', '#2196F3']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Total Remaining" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={`₹${result.delivery.remaining}`}
                    textStyle={[20, 'bold', '#ff9800']}
                  />
                </View>

                {result.intraday && <View style={styles.separator} />}
              </>
            )}

            {/* Intraday Results */}
            {result.intraday && (
              <>
                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="⚡ Intraday Trading" textStyle={[14, '600', '#333']} />
                  </View>
                </View>
                
                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Total Number of Shares" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={result.intraday.shares.toString()}
                    textStyle={[20, 'bold', '#9c27b0']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Share Value (After Leverage)" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={`₹${result.intraday.shareValue}`}
                    textStyle={[20, 'bold', '#e91e63']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Total Investment" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={`₹${result.intraday.totalInvestment}`}
                    textStyle={[20, 'bold', '#9c27b0']}
                  />
                </View>

                <View style={styles.resultItem}>
                  <View style={styles.resultLabelContainer}>
                    <CommonText title="Remaining Amount" textStyle={[14, '600', '#333']} />
                  </View>
                  <CommonText
                    title={`₹${result.intraday.remainingAmount}`}
                    textStyle={[20, 'bold', '#ff5722']}
                  />
                </View>
              </>
            )}
          </View>
di
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <CommonText title="📋 Summary" textStyle={[16, 'bold', '#333']} />
            <View style={styles.summaryContent}>
              {result ? (
                <>
                  {result.delivery && (
                    <CommonText 
                      title={`• Delivery: Buy ${result.delivery.shares} shares worth ₹${result.delivery.value}`} 
                      textStyle={[14, 'normal', '#333']} 
                    />
                  )}
                  {result.intraday && (
                    <CommonText 
                      title={`• Intraday: Buy ${result.intraday.shares} shares at ₹${result.intraday.shareValue} each = ₹${result.intraday.totalInvestment} (${result.intraday.leverage}x leverage)`} 
                      textStyle={[14, 'normal', '#333']} 
                    />
                  )}
                  <CommonText 
                    title={`• Investment Amount: ₹${amount}`} 
                    textStyle={[14, 'normal', '#333']} 
                  />
                  <CommonText 
                    title={`• Share Price: ₹${sharePrice}`} 
                    textStyle={[14, 'normal', '#333']} 
                  />
                </>
              ) : (
                <CommonText 
                  title="• Enter your values and calculate to see margin results" 
                  textStyle={[14, 'normal', '#666']} 
                />
              )}
            </View>
          </View>
        </View>
      )}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resultsDisplay: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
  },
  resultLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  separator: {
    height: 16,
  },
  summaryCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  summaryContent: {
    marginTop: 10,
  },
});

export default MarginCalculator;
