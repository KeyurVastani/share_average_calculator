import { StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');

function App() {
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const calculatorTypes = [
    { id: 'cagr', name: 'CAGR Calculator', description: 'Compound Annual Growth Rate calculations', icon: '📈' },
    { id: 'sip', name: 'SIP Calculator', description: 'Systematic Investment Plan calculations', icon: '💰' },
    { id: 'intraday', name: 'Intraday Profit/Loss Calculator', description: 'Calculate intraday trading P&L', icon: '📊' },
    { id: 'average-buy', name: 'Average Buy Price Calculator', description: 'Calculate average purchase price', icon: '⚖️' },
    { id: 'options-pnl', name: 'Options P&L Calculator', description: 'Options profit and loss calculations', icon: '📉' },
    { id: 'dividend-yield', name: 'Dividend Yield Calculator', description: 'Calculate dividend yield percentage', icon: '🎯' },
    { id: 'stop-loss', name: 'Stop Loss / Target Calculator', description: 'Calculate stop loss and target levels', icon: '🛑' },
    { id: 'margin', name: 'Margin Requirement Calculator', description: 'Calculate margin requirements', icon: '💳' },
    { id: 'tax-brokerage', name: 'Tax / Brokerage Charges Calculator', description: 'Calculate taxes and brokerage fees', icon: '🧾' },
    { id: 'stock-split', name: 'Stock Split / Bonus Share Calculator', description: 'Calculate stock splits and bonus shares', icon: '🎁' },
  ];

  useEffect(() => {
    // Animate in on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCalculatorSelect = (calculatorId) => {
    setSelectedCalculator(calculatorId);
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const renderCalculatorCard = (calculator, index) => {
    const isSelected = selectedCalculator === calculator.id;
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.95,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        key={calculator.id}
        style={[
          styles.cardContainer,
          { transform: [{ scale: cardScale }] },
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.calculatorCard,
            isSelected && styles.selectedCard,
          ]}
          onPress={() => handleCalculatorSelect(calculator.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{calculator.icon}</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{index + 1}</Text>
            </View>
          </View>
          <Text style={styles.calculatorName}>{calculator.name}</Text>
          <Text style={styles.calculatorDescription}>{calculator.description}</Text>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓ Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.headerText}>Market Calculator</Text>
        <Text style={styles.headerSubtext}>Choose your financial tool</Text>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.sectionTitle}>Select Calculator Type</Text>
          <Text style={styles.sectionSubtitle}>Tap on any calculator to get started</Text>
        </Animated.View>
        
        <View style={styles.calculatorGrid}>
          {calculatorTypes.map((calculator, index) => 
            renderCalculatorCard(calculator, index)
          )}
        </View>
        
        {selectedCalculator && (
          <Animated.View 
            style={[styles.selectedInfo, { opacity: fadeAnim }]}
            entering={Animated.spring}
          >
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedIcon}>
                {calculatorTypes.find(c => c.id === selectedCalculator)?.icon}
              </Text>
              <Text style={styles.selectedText}>
                {calculatorTypes.find(c => c.id === selectedCalculator)?.name}
              </Text>
            </View>
            <Text style={styles.selectedDescription}>
              Ready to calculate! Tap to proceed with {calculatorTypes.find(c => c.id === selectedCalculator)?.name.toLowerCase()}
            </Text>
            {isLoading && (
              <View style={styles.loadingIndicator}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 100,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 15,
  },
  calculatorCard: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 28,
    color: '#2196F3',
  },
  cardBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calculatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  calculatorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedIcon: {
    fontSize: 24,
    color: '#4caf50',
    marginRight: 10,
  },
  selectedText: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: '500',
  },
  selectedDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  selectedIndicator: {
    backgroundColor: '#4caf50',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default App;
