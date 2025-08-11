import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../CommonText';
import useCalculatorStore from '../../store/calculatorStore';
import SaveModal from '../SaveModal';

const AverageBuyCalculator = () => {
  const { 
    toggleHistoryModal, 
    toggleSaveModal, 
    saveCalculation,
    getCalculationsForType, 
    loadedCalculation, 
    clearLoadedCalculation,
    editingCalculationId
  } = useCalculatorStore();
  
  const savedCalculations = getCalculationsForType('average-buy');
  const [purchases, setPurchases] = useState([
    { quantity: '', price: '', id: Date.now() },
    { quantity: '', price: '', id: Date.now() + 1 }
  ]);
  const [result, setResult] = useState(null);
  const [currentStockName, setCurrentStockName] = useState(''); // Store current stock name

  // Handle loading saved calculations
  useEffect(() => {
    if (loadedCalculation) {
      // Load the saved calculation data
      setResult(loadedCalculation);
      setCurrentStockName(loadedCalculation.stockName || ''); // Store the stock name
      
      // Load the purchase data if available
      if (loadedCalculation.purchases) {
        setPurchases(loadedCalculation.purchases);
      }
      
      clearLoadedCalculation(); // Clear the loaded calculation
    }
  }, [loadedCalculation, clearLoadedCalculation]);

  const addPurchase = () => {
    const newId = Date.now() + Math.random();
    setPurchases([...purchases, { quantity: '', price: '', id: newId }]);
  };

  const removePurchase = (id) => {
    if (purchases.length > 2) {
      setPurchases(purchases.filter(purchase => purchase.id !== id));
    }
  };

  const updatePurchase = (id, field, value) => {
    setPurchases(purchases.map(purchase => 
      purchase.id === id ? { ...purchase, [field]: value } : purchase
    ));
  };

  const calculateAveragePrice = () => {
    // Validate inputs
    const validPurchases = purchases.filter(p => 
      p.quantity && p.price && 
      !isNaN(parseFloat(p.quantity)) && 
      !isNaN(parseFloat(p.price)) &&
      parseFloat(p.quantity) > 0 && 
      parseFloat(p.price) > 0
    );

    if (validPurchases.length < 2) {
      Alert.alert('Error', 'Please enter valid quantity and price for at least two purchases.');
      return;
    }

    let totalInvestment = 0;
    let totalQuantity = 0;

    validPurchases.forEach(purchase => {
      const quantity = parseFloat(purchase.quantity);
      const price = parseFloat(purchase.price);
      totalInvestment += quantity * price;
      totalQuantity += quantity;
    });

    const averagePrice = totalInvestment / totalQuantity;

    setResult({
      averagePrice: averagePrice.toFixed(2),
      totalInvestment: totalInvestment.toFixed(2),
      totalQuantity: totalQuantity.toFixed(2),
      numberOfPurchases: validPurchases.length,
      stockName: currentStockName // Preserve the stock name
    });
  };

  const resetCalculator = () => {
    setPurchases([
      { quantity: '', price: '', id: Date.now() },
      { quantity: '', price: '', id: Date.now() + 1 }
    ]);
    setResult(null);
    setCurrentStockName(''); // Clear the stock name
  };

  const handleSave = () => {
    console.log('handleSave called:', { editingCalculationId, currentStockName, hasResult: !!result });
    
    if (editingCalculationId && result && currentStockName) {
      // When editing and we have a stock name, automatically update without showing modal
      console.log('Auto-updating calculation with stock name:', currentStockName);
      saveCalculation({
        ...result,
        purchases,
        stockName: currentStockName // Use the stored stock name
      }, 'average-buy');
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

      {/* Purchase Inputs */}
      <View style={styles.inputSection}>
        <View style={styles.sectionHeader}>
          <CommonText 
            title="Purchase Details" 
            textStyle={[18, 'bold', '#333']} 
          />
          <TouchableOpacity style={styles.addButton} onPress={addPurchase}>
            <CommonText title="+ Add Purchase" textStyle={[14, '600', '#2196F3']} />
          </TouchableOpacity>
        </View>

        {purchases.map((purchase, index) => (
          <View key={`purchase-${purchase.id}`} style={styles.purchaseRow}>
            <View style={styles.purchaseHeader}>
              <CommonText 
                title={`Purchase ${index + 1}`} 
                textStyle={[16, '600', '#333']} 
              />
              {purchases.length > 2 && (
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => removePurchase(purchase.id)}
                >
                  <CommonText title="✕" textStyle={[16, 'bold', 'red']} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <CommonText title="Quantity" textStyle={[14, '500', '#666']} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 100"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={purchase.quantity}
                  onChangeText={(value) => updatePurchase(purchase.id, 'quantity', value)}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <CommonText title="Price per Share" textStyle={[14, '500', '#666']} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 50.00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={purchase.price}
                  onChangeText={(value) => updatePurchase(purchase.id, 'price', value)}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateAveragePrice}>
          <CommonText title="Calculate Average Price" textStyle={[16, 'bold', 'white']} />
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
            <TouchableOpacity style={styles.saveResultButton} onPress={handleSave}>
              <CommonText title={editingCalculationId ? "💾 Update" : "💾 Save"} textStyle={[14, '600', '#4caf50']} />
            </TouchableOpacity>
          </View>
          
          {/* Colorful Summary Banner */}
          <View style={styles.colorfulSummaryBanner}>
            <View style={styles.summaryIconContainer}>
              <CommonText title="📈" textStyle={[32, 'normal', '#fff']} />
            </View>
            <View style={styles.summaryTextContainer}>
              <CommonText 
                title="Your Average Buy Price" 
                textStyle={[18, 'bold', '#fff']} 
              />
              <CommonText 
                title={`₹${result.averagePrice}`} 
                textStyle={[24, 'bold', '#fff']} 
              />
            </View>
          </View>

     

          {/* Colorful Investment Summary Cards */}
          <View style={styles.colorfulSummarySection}>
            <CommonText 
              title="💰 Investment Summary" 
              textStyle={[18, 'bold', '#333']} 
            />
            
            <View style={styles.colorfulSummaryGrid}>
              <View style={[styles.colorfulSummaryItem, { backgroundColor: '#e3f2fd', borderColor: '#2196F3' }]}>
                <View style={styles.summaryItemIcon}>
                  <CommonText title="💰" textStyle={[20, 'normal', '#2196F3']} />
                  <CommonText title=" Total Investment" textStyle={[12, '500', '#666']} />

                </View>
                  <CommonText 
                    title={`₹${result.totalInvestment}`} 
                    textStyle={[16, 'bold', '#2196F3']} 
                  />
              </View>
              
              <View style={[styles.colorfulSummaryItem, { backgroundColor: '#e8f5e8', borderColor: '#4caf50' }]}>
                <View style={styles.summaryItemIcon}>
                  <CommonText title="📈" textStyle={[20, 'normal', '#4caf50']} />
                  <CommonText title=" Total Shares" textStyle={[12, '500', '#666']} />
                </View>
                <View style={styles.summaryItemContent}>
                  <CommonText 
                    title={result.totalQuantity} 
                    textStyle={[16, 'bold', '#4caf50']} 
                  />
                </View>
              </View>
              
              <View style={[styles.colorfulSummaryItem, { backgroundColor: '#fff3e0', borderColor: '#ff9800' }]}>
                <View style={styles.summaryItemIcon}>
                  <CommonText title="📈" textStyle={[20, 'normal', '#ff9800']} />
                  <CommonText title=" No. of Purchases" textStyle={[12, '500', '#666']} />

                </View>
                <View style={styles.summaryItemContent}>
                  <CommonText 
                    title={result.numberOfPurchases.toString()} 
                    textStyle={[16, 'bold', '#ff9800']} 
                  />
                </View>
              </View>
              
              <View style={[styles.colorfulSummaryItem, { backgroundColor: '#f3e5f5', borderColor: '#9c27b0' }]}>
                <View style={styles.summaryItemIcon}>
                  <CommonText title="⚖️" textStyle={[20, 'normal', '#9c27b0']} />
                  <CommonText title=" Avg Price per Share" textStyle={[12, '500', '#666']} />
                </View>
                <View style={styles.summaryItemContent}>
                  <CommonText 
                    title={`₹${result.averagePrice}`} 
                    textStyle={[16, 'bold', '#9c27b0']} 
                  />
                </View>
              </View>
            </View>
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
              title="Example: If you bought 100 shares at ₹50 and 200 shares at ₹60" 
              textStyle={[16, '600', '#666']} 
            />
            <View style={styles.sampleResultContainer}>
              <View style={[styles.samplePurchaseRow,{flexDirection:'column',justifyContent:'center',alignItems:'flex-start'}]}>
                <CommonText title="Purchase 1:" textStyle={[14, '600', '#666']} />
                <CommonText title="100 shares × ₹50 = ₹5,000" textStyle={[16, 'bold', '#2196F3']} />
              </View>
              <View style={[styles.samplePurchaseRow,{flexDirection:'column',justifyContent:'center',alignItems:'flex-start'}]}>
                <CommonText title="Purchase 2:" textStyle={[14, '600', '#666']} />
                <CommonText title="200 shares × ₹60 = ₹12,000" textStyle={[16, 'bold', '#2196F3']} />
              </View>
              <View style={styles.sampleDivider} />
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Total Investment:" textStyle={[14, '600', '#666']} />
                <CommonText title="₹17,000" textStyle={[16, 'bold', '#4caf50']} />
              </View>
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Total Shares:" textStyle={[14, '600', '#666']} />
                <CommonText title="300" textStyle={[16, 'bold', '#4caf50']} />
              </View>
              <View style={styles.sampleDivider} />
              <View style={styles.samplePurchaseRow}>
                <CommonText title="Average Price:" textStyle={[14, '600', '#666']} />
                <CommonText title="₹56.67" textStyle={[16, 'bold', '#ff9800']} />
              </View>
            </View>
            <CommonText 
              title="Your average cost per share is ₹56.67" 
              textStyle={[14, 'normal', '#888']} 
            />
          </View>
        </View>
      )}

      {/* Save Modal */}
      <SaveModal calculationData={{ ...result, purchases }}  reset={resetCalculator}/>
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
  header: {
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
  addButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
  },
  purchaseRow: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  currentPriceContainer: {
    marginTop: 10,
  },
  currentPriceInput: {
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
    flexWrap: 'wrap',
    marginTop: 15,
  },
  summaryItem: {
    width: '48%',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  profitLossCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
  },
  profitLossHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profitLossGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profitLossItem: {
    width: '48%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  statusBanner: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  formulaSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  colorfulSummaryBanner: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    backgroundColor: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
});

export default AverageBuyCalculator; 