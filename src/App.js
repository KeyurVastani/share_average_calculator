import { StatusBar, StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Dimensions, Modal, FlatList } from 'react-native';
import { useRef, useEffect } from 'react';
import useCalculatorStore from './store/calculatorStore';

import AverageBuyCalculator from './components/calculators/AverageBuyCalculator';
import SharePriceMatchCalculator from './components/calculators/SharePriceMatchCalculator';
import CommonText from './components/CommonText';
import HistoryScreen from './components/HistoryScreen';

const { width, height } = Dimensions.get('window');

function App() {
  // Zustand store
  const {
    selectedCalculator,
    isLoading,
    isModalVisible,
    showInfoModal,
    showHistoryModal,
    setSelectedCalculator,
    openCalculatorModal,
    closeCalculatorModal,
    toggleInfoModal,
    toggleHistoryModal,
  } = useCalculatorStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Create animation values for each calculator card
  const cardScales = useRef(
    Array(10).fill(0).map(() => new Animated.Value(1))
  ).current;

  const calculatorTypes = [
    {
      id: 'cagr',
      name: 'CAGR Calculator',
      description: 'Compound Annual Growth Rate calculations',
      icon: '📈',
      info: {
        title: 'CAGR Calculator',
        description: 'The Compound Annual Growth Rate (CAGR) calculator helps you determine the mean annual growth rate of an investment over a specified period of time.',
        features: [
          'Calculate annualized returns',
          'Compare investment performance',
          'Project future growth',
          'Analyze historical data'
        ],
        formula: 'CAGR = (End Value / Start Value)^(1/n) - 1'
      }
    },
    {
      id: 'sip',
      name: 'SIP Calculator',
      description: 'Systematic Investment Plan calculations',
      icon: '💰',
      info: {
        title: 'SIP Calculator',
        description: 'The Systematic Investment Plan (SIP) calculator helps you estimate the future value of regular investments made at fixed intervals.',
        features: [
          'Calculate future corpus',
          'Plan regular investments',
          'Understand compound growth',
          'Set financial goals'
        ],
        formula: 'Future Value = P × [(1 + r)^n - 1] / r'
      }
    },
    {
      id: 'intraday',
      name: 'Intraday Profit/Loss Calculator',
      description: 'Calculate intraday trading P&L',
      icon: '📊',
      info: {
        title: 'Intraday P&L Calculator',
        description: 'Calculate your profit or loss from intraday trading, including all charges and taxes.',
        features: [
          'Calculate net P&L',
          'Include brokerage charges',
          'Account for taxes',
          'Track daily performance'
        ],
        formula: 'P&L = (Sell Price - Buy Price) × Quantity - Charges'
      }
    },
    {
      id: 'average-buy',
      name: 'Average Buying Price Calculator',
      description: 'Calculate average purchase price',
      icon: '⚖️',
      info: {
        title: 'Average Buying Price Calculator',
        description: 'Calculate the weighted average price of your stock purchases to understand your true cost basis.',
        features: [
          'Calculate weighted average price',
          'Track multiple purchases',
          'Understand cost basis',
          'Plan future investments'
        ],
        formula: 'Average Price = Total Investment / Total Quantity'
      }
    },
    {
      id: 'share-price-match',
      name: 'Share Price Match Calculator',
      description: 'Calculate shares for target amount',
      icon: '🎯',
      info: {
        title: 'Share Price Match Calculator',
        description: 'Calculate how many shares you can buy with your target investment amount at the current share price.',
        features: [
          'Calculate number of shares',
          'Determine remaining amount',
          'Plan investment allocation',
          'Optimize share purchases'
        ],
        formula: 'Number of Shares = Target Amount ÷ Current Share Price'
      }
    },
    {
      id: 'options-pnl',
      name: 'Options P&L Calculator',
      description: 'Options profit and loss calculations',
      icon: '📉',
      info: {
        title: 'Options P&L Calculator',
        description: 'Calculate profit and loss for options trading, including calls and puts.',
        features: [
          'Calculate options P&L',
          'Support for calls and puts',
          'Include premium costs',
          'Analyze risk-reward'
        ],
        formula: 'P&L = (Current Price - Strike Price) × Lot Size - Premium Paid'
      }
    },
    {
      id: 'dividend-yield',
      name: 'Dividend Yield Calculator',
      description: 'Calculate dividend yield percentage',
      icon: '🎯',
      info: {
        title: 'Dividend Yield Calculator',
        description: 'Calculate the dividend yield percentage to evaluate income-generating investments.',
        features: [
          'Calculate dividend yield',
          'Compare income stocks',
          'Evaluate returns',
          'Plan income portfolio'
        ],
        formula: 'Dividend Yield = (Annual Dividend / Current Price) × 100'
      }
    },
    {
      id: 'stop-loss',
      name: 'Stop Loss / Target Calculator',
      description: 'Calculate stop loss and target levels',
      icon: '🛑',
      info: {
        title: 'Stop Loss / Target Calculator',
        description: 'Calculate optimal stop loss and target levels based on your risk tolerance and market analysis.',
        features: [
          'Calculate stop loss levels',
          'Set target prices',
          'Manage risk',
          'Plan exit strategies'
        ],
        formula: 'Stop Loss = Entry Price - (Entry Price × Risk %)'
      }
    },
    {
      id: 'margin',
      name: 'Margin Requirement Calculator',
      description: 'Calculate margin requirements',
      icon: '💳',
      info: {
        title: 'Margin Requirement Calculator',
        description: 'Calculate the margin requirements for trading on leverage and understand your capital needs.',
        features: [
          'Calculate margin requirements',
          'Understand leverage',
          'Plan capital allocation',
          'Manage risk exposure'
        ],
        formula: 'Margin Required = (Position Value × Margin Rate) / 100'
      }
    },
    {
      id: 'tax-brokerage',
      name: 'Tax / Brokerage Charges Calculator',
      description: 'Calculate taxes and brokerage fees',
      icon: '🧾',
      info: {
        title: 'Tax / Brokerage Calculator',
        description: 'Calculate all applicable taxes and brokerage charges for your trades.',
        features: [
          'Calculate brokerage charges',
          'Include taxes (STT, GST)',
          'Estimate total costs',
          'Plan trade profitability'
        ],
        formula: 'Total Charges = Brokerage + STT + GST + Other Taxes'
      }
    },
    {
      id: 'stock-split',
      name: 'Stock Split / Bonus Share Calculator',
      description: 'Calculate stock splits and bonus shares',
      icon: '🎁',
      info: {
        title: 'Stock Split / Bonus Calculator',
        description: 'Calculate the impact of stock splits and bonus share issues on your holdings.',
        features: [
          'Calculate post-split holdings',
          'Adjust average price',
          'Track bonus shares',
          'Update portfolio value'
        ],
        formula: 'New Quantity = Old Quantity × Split Ratio'
      }
    },
  ];

  useEffect(() => {
    // Animate in on component mountx
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

  const handleCalculatorSelect = (item) => {
    try {
      setSelectedCalculator(item);
    } catch (error) {
      console.error('Error selecting calculator:', error);
    }
  };

  const renderCalculatorItem = ({ item, index }) => {
    const cardScale = cardScales[index] || new Animated.Value(1);
    const isSelected = selectedCalculator?.id === item?.id;

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
          onPress={() => handleCalculatorSelect(item)}
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

    // Render specific calculator based on ID
    if (selectedCalculator.id === 'average-buy') {
      return <AverageBuyCalculator />;
    }

    if (selectedCalculator.id === 'share-price-match') {
      return <SharePriceMatchCalculator />;
    }

    // Default calculator view for other calculators
    return (
      <Animated.View
        style={[
          styles.calculatorContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.calculatorHeader}>
          <Text style={styles.calculatorHeaderIcon}>{selectedCalculator?.icon}</Text>
          <Text style={styles.calculatorHeaderTitle}>{selectedCalculator?.name}</Text>
        </View>

        <View style={styles.calculatorContent}>
          <Text style={styles.calculatorDescription}>{selectedCalculator?.description}</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading calculator...</Text>
            </View>
          ) : (
            <View style={styles.calculatorPlaceholder}>
              <Text style={styles.placeholderText}>Calculator Interface</Text>
              <Text style={styles.placeholderSubtext}>
                The {selectedCalculator?.name.toLowerCase()} interface will appear here
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
          <View style={{ width: "70%" }}>
            <CommonText
              title={selectedCalculator?.name ||'Market Calculator'}
              textStyle={[20, 'bold', 'white']}
            />
          </View>
          <View style={styles.headerButtons}>
            {selectedCalculator?.id && (
              <TouchableOpacity
                style={styles.infoButton}
                onPress={toggleInfoModal}
                activeOpacity={0.8}
              >
                <Text style={styles.infoButtonIcon}>ℹ️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.calculatorButton,
                selectedCalculator?.id && styles.calculatorButtonWithInfo
              ]}
              onPress={openCalculatorModal}
              activeOpacity={0.8}
            >
              <Text style={styles.calculatorButtonIcon}>🧮</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* <Text style={styles.headerSubtext}>
          {selectedCalculator
            ? calculatorTypes.find(c => c.id === selectedCalculator)?.description
            : 'Select your calculator'
          }
        </Text> */}
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
              <Text style={styles.modalTitle}>Different Types of Calculator</Text>
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
                  Currently using: {selectedCalculator?.name}
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

      {/* Calculator Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleInfoModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={toggleInfoModal}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            {selectedCalculator?.id && 
              
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderContent}>
                      <Text style={styles.modalHeaderIcon}>{selectedCalculator?.icon}</Text>
                      <View style={styles.modalTitleContainer}>
                        <Text style={styles.modalTitle}>{selectedCalculator?.name}</Text>
                        <Text style={styles.modalSubtitle}>{selectedCalculator?.description}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={toggleInfoModal}
                    >
                      <Text style={styles.modalCloseIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.modalBody}>
                      <View style={styles.modalUseSection}>
                        <Text style={styles.modalUseTitle}>What is this calculator used for?</Text>
                        <Text style={styles.modalDescription}>{selectedCalculator?.info?.description}</Text>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Key Features:</Text>
                        {selectedCalculator?.info?.features.map((feature, index) => (
                          <View key={index} style={styles.modalFeatureItem}>
                            <Text style={styles.modalFeatureBullet}>•</Text>
                            <Text style={styles.modalFeatureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>Formula:</Text>
                        <View style={styles.modalFormulaContainer}>
                          <Text style={styles.modalFormula}>{selectedCalculator?.info?.formula}</Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                </>
              }
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        onRequestClose={toggleHistoryModal}
      >
        <HistoryScreen />
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
    height: 120,
    backgroundColor: '#2196F3',
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    minHeight: 60,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 110,
    justifyContent: 'flex-end',
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
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoButtonIcon: {
    fontSize: 22,
    color: 'white',
  },
  calculatorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  calculatorButtonWithInfo: {
    marginLeft: 10,
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
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoCardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  infoCardFeatures: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoCardFeaturesTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  infoCardCloseButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  infoCardCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  modalHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalScrollView: {
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalUseSection: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalUseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalFeatureBullet: {
    fontSize: 16,
    color: '#2196F3',
    marginRight: 8,
    marginTop: 2,
  },
  modalFeatureText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    flex: 1,
  },
  modalFormulaContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  modalFormula: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
    fontWeight: 'bold',
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
