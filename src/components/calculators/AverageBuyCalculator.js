import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CommonText from '../../components/CommonText';

const AverageBuyCalculator = () => {
  const [purchases, setPurchases] = useState([
    { quantity: '', price: '', id: 1 },
    { quantity: '', price: '', id: 2 }
  ]);
  const [currentPrice, setCurrentPrice] = useState('');
  const [result, setResult] = useState(null);

  const addPurchase = () => {
    const newId = purchases.length + 1;
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

    if (!currentPrice || isNaN(parseFloat(currentPrice)) || parseFloat(currentPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid current market price.');
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
    const currentMarketPrice = parseFloat(currentPrice);
    
    // Calculate profit/loss
    const currentValue = totalQuantity * currentMarketPrice;
    const profitLoss = currentValue - totalInvestment;
    const profitLossPercentage = (profitLoss / totalInvestment) * 100;

    setResult({
      averagePrice: averagePrice.toFixed(2),
      totalInvestment: totalInvestment.toFixed(2),
      totalQuantity: totalQuantity.toFixed(2),
      numberOfPurchases: validPurchases.length,
      currentPrice: currentMarketPrice.toFixed(2),
      currentValue: currentValue.toFixed(2),
      profitLoss: profitLoss.toFixed(2),
      profitLossPercentage: profitLossPercentage.toFixed(2),
      isProfitable: profitLoss >= 0
    });
  };

  const resetCalculator = () => {
    setPurchases([
      { quantity: '', price: '', id: 1 },
      { quantity: '', price: '', id: 2 }
    ]);
    setCurrentPrice('');
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <View style={styles.header}>
        <CommonText 
          title="Average Buy Price Calculator" 
          textStyle={[24, 'bold', '#333']} 
        />
        <CommonText 
          title="Calculate the weighted average price of your stock purchases" 
          textStyle={[16, 'normal', '#666']} 
        />
      </View> */}

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
          <View key={purchase.id} style={styles.purchaseRow}>
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
                  keyboardType="numeric"
                  value={purchase.price}
                  onChangeText={(value) => updatePurchase(purchase.id, 'price', value)}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Current Market Price Input */}
      <View style={styles.inputSection}>
        <CommonText 
          title="Current Market Price" 
          textStyle={[18, 'bold', '#333']} 
        />
        <View style={styles.currentPriceContainer}>
          <TextInput
            style={styles.currentPriceInput}
            placeholder="Enter current market price"
            keyboardType="numeric"
            value={currentPrice}
            onChangeText={setCurrentPrice}
          />
        </View>
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
          <CommonText 
            title="Results" 
            textStyle={[20, 'bold', '#333']} 
          />
          
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <CommonText title="Average Buy Price:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={`₹${result.averagePrice}`} 
                textStyle={[18, 'bold', '#2196F3']} 
              />
            </View>
            
            <View style={styles.resultRow}>
              <CommonText title="Current Market Price:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={`₹${result.currentPrice}`} 
                textStyle={[18, 'bold', '#333']} 
              />
            </View>
            
            <View style={styles.resultRow}>
              <CommonText title="Total Investment:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={`₹${result.totalInvestment}`} 
                textStyle={[16, 'bold', '#333']} 
              />
            </View>
            
            <View style={styles.resultRow}>
              <CommonText title="Current Value:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={`₹${result.currentValue}`} 
                textStyle={[16, 'bold', '#333']} 
              />
            </View>
            
            <View style={styles.resultRow}>
              <CommonText title="Total Quantity:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={result.totalQuantity} 
                textStyle={[16, 'bold', '#333']} 
              />
            </View>
            
            <View style={styles.resultRow}>
              <CommonText title="Number of Purchases:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={result.numberOfPurchases.toString()} 
                textStyle={[16, 'bold', '#333']} 
              />
            </View>
          </View>

          {/* Profit/Loss Section */}
          <View style={[styles.profitLossCard, { backgroundColor: result.isProfitable ? '#e8f5e8' : '#ffeaea' }]}>
            <View style={styles.resultRow}>
              <CommonText title="Profit/Loss:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={`₹${result.profitLoss}`} 
                textStyle={[18, 'bold', result.isProfitable ? '#4caf50' : '#f44336']} 
              />
            </View>
            
            <View style={styles.resultRow}>
              <CommonText title="Percentage:" textStyle={[16, '600', '#666']} />
              <CommonText 
                title={`${result.profitLossPercentage}%`} 
                textStyle={[18, 'bold', result.isProfitable ? '#4caf50' : '#f44336']} 
              />
            </View>
            
            <View style={styles.statusRow}>
              <CommonText 
                title={result.isProfitable ? "📈 PROFITABLE" : "📉 LOSS"} 
                textStyle={[16, 'bold', result.isProfitable ? '#4caf50' : '#f44336']} 
              />
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
            title="Average Price = Total Investment ÷ Total Quantity" 
            textStyle={[16, '600', '#666']} 
          />
          <CommonText 
            title="Total Investment = Σ(Quantity × Price per Share)" 
            textStyle={[14, 'normal', '#888']} 
          />
          <CommonText 
            title="P&L % = ((Current Value - Total Investment) ÷ Total Investment) × 100" 
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
    borderBottomColor: '#e9ecef',
  },
  profitLossCard: {
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  statusRow: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 5,
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
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
});

export default AverageBuyCalculator; 