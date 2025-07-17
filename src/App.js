import { StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Dimensions, Modal, FlatList } from 'react-native';
import { useState, useRef, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

function App() {
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Create animation values for each calculator card
  const cardScales = useRef(
    Array(10).fill(0).map(() => new Animated.Value(1))
  ).current;

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

  const openCalculatorModal = () => {
    try {
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error opening modal:', error);
      setIsModalVisible(true);
    }
  };

  const closeCalculatorModal = () => {
    try {
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error closing modal:', error);
      setIsModalVisible(false);
    }
  };

  const handleCalculatorSelect = (calculatorId) => {
    try {
      setSelectedCalculator(calculatorId);
      setIsLoading(true);
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        closeCalculatorModal();
      }, 500);
    } catch (error) {
      console.error('Error selecting calculator:', error);
      setSelectedCalculator(calculatorId);
      setIsLoading(false);
      closeCalculatorModal();
    }
  };

  const renderCalculatorItem = ({ item, index }) => {
    const cardScale = cardScales[index] || new Animated.Value(1);
    const isSelected = selectedCalculator === item.id;

    const handlePressIn = () => {
      try {
        Animated.spring(cardScale, {
          toValue: 0.95,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error in press in animation:', error);
      }
    };

    const handlePressOut = () => {
      try {
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error in press out animation:', error);
      }
    };

    return (
      <Animated.View
        style={[
          styles.modalCardContainer,
          { transform: [{ scale: cardScale }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.modalCalculatorCard,
            isSelected && styles.modalSelectedCard,
          ]}
          onPress={() => handleCalculatorSelect(item.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.modalCardHeader}>
            <Text style={styles.modalCardIcon}>{item.icon}</Text>
            <View style={styles.modalCardBadge}>
              <Text style={styles.modalCardBadgeText}>{index + 1}</Text>
            </View>
          </View>
          <Text style={styles.modalCalculatorName}>{item.name}</Text>
          <Text style={styles.modalCalculatorDescription}>{item.description}</Text>
          {isSelected && (
            <View style={styles.modalSelectedIndicator}>
              <Text style={styles.modalSelectedIndicatorText}>✓ Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSelectedCalculator = () => {
    if (!selectedCalculator) {
      return (
        <Animated.View 
          style={[
            styles.welcomeContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.welcomeIcon}>🧮</Text>
          <Text style={styles.welcomeTitle}>Welcome to Market Calculator</Text>
          <Text style={styles.welcomeSubtitle}>
            Tap the calculator button in the top-right corner to select your preferred calculator
          </Text>
        </Animated.View>
      );
    }

    const calculator = calculatorTypes.find(c => c.id === selectedCalculator);
    
    return (
      <Animated.View 
        style={[
          styles.calculatorContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.calculatorHeader}>
          <Text style={styles.calculatorHeaderIcon}>{calculator.icon}</Text>
          <Text style={styles.calculatorHeaderTitle}>{calculator.name}</Text>
        </View>
        
        <View style={styles.calculatorContent}>
          <Text style={styles.calculatorDescription}>{calculator.description}</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading calculator...</Text>
            </View>
          ) : (
            <View style={styles.calculatorPlaceholder}>
              <Text style={styles.placeholderText}>Calculator Interface</Text>
              <Text style={styles.placeholderSubtext}>
                The {calculator.name.toLowerCase()} interface will appear here
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Calculator Button */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Market Calculator</Text>
          <TouchableOpacity 
            style={styles.calculatorButton}
            onPress={openCalculatorModal}
            activeOpacity={0.8}
          >
            <Text style={styles.calculatorButtonIcon}>🧮</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtext}>
          {selectedCalculator 
            ? `Using: ${calculatorTypes.find(c => c.id === selectedCalculator)?.name}`
            : 'Select your calculator'
          }
        </Text>
      </Animated.View>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {renderSelectedCalculator()}
      </ScrollView>

      {/* Calculator Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCalculatorModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={closeCalculatorModal}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Calculator</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={closeCalculatorModal}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedCalculator && (
              <View style={styles.modalCurrentSelection}>
                <Text style={styles.modalCurrentSelectionText}>
                  Currently using: {calculatorTypes.find(c => c.id === selectedCalculator)?.name}
                </Text>
              </View>
            )}
            
            <FlatList
              data={calculatorTypes}
              renderItem={renderCalculatorItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
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
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
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
    paddingHorizontal: 20,
  },
  calculatorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatorButtonIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  welcomeIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  calculatorContainer: {
    flex: 1,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calculatorHeaderIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  calculatorHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calculatorContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calculatorDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  calculatorPlaceholder: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#666',
  },
  modalCurrentSelection: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCurrentSelectionText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  modalList: {
    padding: 15,
  },
  modalCardContainer: {
    width: '48%',
    marginBottom: 15,
    marginHorizontal: '1%',
  },
  modalCalculatorCard: {
    backgroundColor: 'white',
    padding: 15,
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
  modalSelectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  modalSelectedIndicator: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  modalSelectedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCardIcon: {
    fontSize: 24,
    color: '#2196F3',
  },
  modalCardBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modalCardBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalCalculatorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  modalCalculatorDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default App;
