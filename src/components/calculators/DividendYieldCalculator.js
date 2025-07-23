import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import CommonText from '../CommonText';

const DividendYieldCalculator = () => {
  const [sharePrice, setSharePrice] = useState('');
  const [dividendYield, setDividendYield] = useState('');
  const [result, setResult] = useState(null);
  
  // Error states for validation
  const [errors, setErrors] = useState({
    sharePrice: '',
    dividendYield: '',
    general: ''
  });

  // Clear errors when user starts typing
  const clearFieldError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: '',
      general: ''
    }));
  };

  const calculateDividend = () => {
    // Reset all errors first
    setErrors({
      sharePrice: '',
      dividendYield: '',
      general: ''
    });

    let hasErrors = false;
    const newErrors = {
      sharePrice: '',
      dividendYield: '',
      general: ''
    };

    // Validate inputs
    if (!sharePrice || isNaN(parseFloat(sharePrice)) || parseFloat(sharePrice) <= 0) {
      newErrors.sharePrice = 'Please enter a valid positive share price';
      hasErrors = true;
    }

    if (!dividendYield || isNaN(parseFloat(dividendYield)) || parseFloat(dividendYield) < 0) {
      newErrors.dividendYield = 'Please enter a valid dividend yield percentage';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const price = parseFloat(sharePrice);
    const yieldPercentage = parseFloat(dividendYield);
    
    // Calculate dividend amount: (dividend yield / 100) * share price
    const dividendAmount = (yieldPercentage / 100) * price;

    setResult({
      sharePrice: price.toFixed(2),
      dividendYield: yieldPercentage.toFixed(2),
      dividendAmount: dividendAmount.toFixed(2),
      annualDividend: dividendAmount.toFixed(2) // Same as dividend amount for this calculation
    });
  };

  const resetCalculator = () => {
    setSharePrice('');
    setDividendYield('');
    setResult(null);
    setErrors({
      sharePrice: '',
      dividendYield: '',
      general: ''
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Share Price Input */}
      <View style={styles.inputSection}>
        <CommonText
          title="Share Price (₹)"
          textStyle={[16, '600', '#333']}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors.sharePrice ? styles.inputError : null
            ]}
            placeholder="Enter current share price (e.g., 100.00)"
            keyboardType="numeric"
            value={sharePrice}
            onChangeText={(text) => {
              setSharePrice(text);
              clearFieldError('sharePrice');
            }}
          />
          {errors.sharePrice ? (
            <View style={styles.errorContainer}>
              <CommonText
                title={`❌ ${errors.sharePrice}`}
                textStyle={[12, '500', '#d32f2f']}
              />
            </View>
          ) : null}
        </View>
      </View>

      {/* Dividend Yield Input */}
      <View style={styles.inputSection}>
        <CommonText
          title="Dividend Yield (%)"
          textStyle={[16, '600', '#333']}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              errors.dividendYield ? styles.inputError : null
            ]}
            placeholder="Enter dividend yield percentage (e.g., 3.5)"
            keyboardType="numeric"
            value={dividendYield}
            onChangeText={(text) => {
              setDividendYield(text);
              clearFieldError('dividendYield');
            }}
          />
          {errors.dividendYield ? (
            <View style={styles.errorContainer}>
              <CommonText
                title={`❌ ${errors.dividendYield}`}
                textStyle={[12, '500', '#d32f2f']}
              />
            </View>
          ) : null}
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
        <TouchableOpacity style={styles.calculateButton} onPress={calculateDividend}>
          <CommonText title="Calculate Dividend" textStyle={[16, 'bold', 'white']} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
          <CommonText title="Reset" textStyle={[16, '600', '#666']} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <View style={styles.resultHeaderContent}>
              <CommonText title="💰" textStyle={[22, 'bold', '#333']} />
              <CommonText
                title="Dividend Calculation Result"
                textStyle={[20, 'bold', '#333']}
              />
            </View>
          </View>

          {/* Main Result Card */}
          <View style={styles.mainResultCard}>
            <CommonText 
              title="💵 Dividend Amount" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.dividendAmountContainer}>
              <CommonText 
                title={`₹${result.dividendAmount}`} 
                textStyle={[32, 'bold', '#4caf50']} 
              />
              <CommonText 
                title="per share annually" 
                textStyle={[14, 'normal', '#666']} 
              />
            </View>
          </View>

          {/* Input Summary Card */}
          <View style={styles.summaryCard}>
            <CommonText 
              title="📊 Calculation Summary" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <CommonText title="Share Price" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${result.sharePrice}`} 
                  textStyle={[18, 'bold', '#2196F3']} 
                />
              </View>
              
              <View style={styles.summaryItem}>
                <CommonText title="Dividend Yield" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`${result.dividendYield}%`} 
                  textStyle={[18, 'bold', '#ff9800']} 
                />
              </View>
            </View>
          </View>

          {/* Investment Examples Card */}
          <View style={styles.exampleCard}>
            <CommonText 
              title="📈 Investment Examples" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.exampleGrid}>
              <View style={styles.exampleItem}>
                <CommonText title="10 Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${(parseFloat(result.dividendAmount) * 10).toFixed(2)}`} 
                  textStyle={[16, 'bold', '#4caf50']} 
                />
                <CommonText title="annual dividend" textStyle={[12, 'normal', '#999']} />
              </View>
              
              <View style={styles.exampleItem}>
                <CommonText title="100 Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${(parseFloat(result.dividendAmount) * 100).toFixed(2)}`} 
                  textStyle={[16, 'bold', '#4caf50']} 
                />
                <CommonText title="annual dividend" textStyle={[12, 'normal', '#999']} />
              </View>
              
              <View style={styles.exampleItem}>
                <CommonText title="1000 Shares" textStyle={[14, '500', '#666']} />
                <CommonText 
                  title={`₹${(parseFloat(result.dividendAmount) * 1000).toFixed(2)}`} 
                  textStyle={[16, 'bold', '#4caf50']} 
                />
                <CommonText title="annual dividend" textStyle={[12, 'normal', '#999']} />
              </View>
            </View>
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
            title="Dividend Amount = (Dividend Yield ÷ 100) × Share Price" 
            textStyle={[16, '600', '#666']} 
          />
          <CommonText 
            title="This calculates the annual dividend you'll receive per share" 
            textStyle={[14, 'normal', '#888']} 
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#4caf50',
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
    marginBottom: 20,
  },
  resultHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mainResultCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4caf50',
    alignItems: 'center',
  },
  dividendAmountContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  summaryItem: {
    width: '48%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  exampleCard: {
    backgroundColor: '#fff8e1',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  exampleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    flexWrap: 'wrap',
  },
  exampleItem: {
    width: '30%',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    marginBottom: 10,
  },
  formulaSection: {
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
  formulaCard: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
});

export default DividendYieldCalculator; 