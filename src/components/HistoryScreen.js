import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CommonText from './CommonText';
import useCalculatorStore from '../store/calculatorStore';

const HistoryScreen = () => {
  const { 
    savedCalculations, 
    deleteCalculation, 
    clearAllHistory, 
    toggleHistoryModal, 
    loadCalculation,
    getCalculationsForType,
    selectedCalculator
  } = useCalculatorStore();
  
  // Get calculations for the current calculator type
  const currentCalculations = getCalculationsForType(selectedCalculator?.id);

  // Function to format numbers in Indian numbering system (e.g., 10,00,00,000)
  const formatIndianNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('en-IN');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteCalculation = (id, stockName) => {
    Alert.alert(
      'Delete Calculation',
      `Are you sure you want to delete the calculation for "${stockName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCalculation(id, selectedCalculator?.id) }
      ]
    );
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all saved calculations? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearAllHistory(selectedCalculator?.id) }
      ]
    );
  };

  const handleReapplyCalculation =  (calculation) => {
     loadCalculation(calculation);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <CommonText 
            title="📊 Calculation History" 
            textStyle={[24, 'bold', 'white']} 
          />
          <TouchableOpacity style={styles.closeButton} onPress={toggleHistoryModal}>
            <CommonText title="✕" textStyle={[20, 'bold', 'white']} />
          </TouchableOpacity>
        </View>
        <CommonText 
          title={`${currentCalculations.length} saved calculation${currentCalculations.length !== 1 ? 's' : ''}`} 
          textStyle={[16, 'normal', 'rgba(255,255,255,0.8)']} 
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentCalculations.length === 0 ? (
          <View style={styles.emptyState}>
            <CommonText 
              title="📝" 
              textStyle={[48, 'normal', '#ccc']} 
            />
            <CommonText 
              title="No saved calculations yet" 
              textStyle={[20, 'bold', '#666']} 
            />
            <CommonText 
              title="Your calculation history will appear here after you save your first calculation." 
              textStyle={[16, 'normal', '#999']} 
            />
          </View>
        ) : (
          <>
            {/* Clear All Button */}
            <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAllHistory}>
              <CommonText title="🗑️ Clear All History" textStyle={[16, '600', '#f44336']} />
            </TouchableOpacity>

            {/* Calculations List */}
            {currentCalculations.map((calculation, index) => (
              <View key={calculation.id} style={styles.calculationCard}>
                {/* Header */}
                <View style={styles.calculationHeader}>
                  <View style={styles.stockInfo}>
                    <CommonText 
                      title={calculation.stockName || 'Unnamed Stock'} 
                      textStyle={[18, 'bold', '#333']} 
                    />
                    <CommonText 
                      title={formatDate(calculation.timestamp)} 
                      textStyle={[12, 'normal', '#666']} 
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCalculation(calculation.id, calculation.stockName)}
                  >
                    <CommonText title="🗑️" textStyle={[16, 'normal', '#f44336']} />
                  </TouchableOpacity>
                </View>

                {/* Key Metrics */}
                <View style={styles.metricsGrid}>
                  {/* CAGR Calculator Metrics */}
                  {calculation.averageAnnualReturn && (
                    <View style={styles.metricItem}>
                      <CommonText title="CAGR" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.averageAnnualReturn}%`} 
                        textStyle={[16, 'bold', '#4caf50']} 
                      />
                    </View>
                  )}
                  
                  {calculation.totalReturn && (
                    <View style={styles.metricItem}>
                      <CommonText title="Total Return" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.totalReturn}%`} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                  )}
                  
                  {calculation.initialValue && (
                    <View style={styles.metricItem}>
                      <CommonText title="Initial Value" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.initialValue)}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.finalValue && (
                    <View style={styles.metricItem}>
                      <CommonText title="Final Value" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.finalValue)}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.years && (
                    <View style={styles.metricItem}>
                      <CommonText title="Period (Years)" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={formatIndianNumber(calculation.years)} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.absoluteGain && (
                    <View style={styles.metricItem}>
                      <CommonText title="Absolute Gain" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.absoluteGain)}`} 
                        textStyle={[16, 'bold', '#4caf50']} 
                      />
                    </View>
                  )}
                  
                  {/* Average Price Reduction Calculator Metrics */}
                  {calculation.targetAveragePrice && (
                    <View style={styles.metricItem}>
                      <CommonText title="Target Average" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.targetAveragePrice)}`} 
                        textStyle={[16, 'bold', '#9c27b0']} 
                      />
                    </View>
                  )}
                  
                  {calculation.additionalSharesNeeded && (
                    <View style={styles.metricItem}>
                      <CommonText title="Shares to Buy" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={formatIndianNumber(calculation.additionalSharesNeeded)} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                  )}
                  
                  {calculation.investmentNeeded && (
                    <View style={styles.metricItem}>
                      <CommonText title="Investment" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.investmentNeeded)}`} 
                        textStyle={[16, 'bold', '#4caf50']} 
                      />
                    </View>
                  )}
                  
                  {calculation.newAveragePrice && (
                    <View style={styles.metricItem}>
                      <CommonText title="New Average" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.newAveragePrice)}`} 
                        textStyle={[16, 'bold', '#4caf50']} 
                      />
                    </View>
                  )}
                  
                  {calculation.currentLoss && (
                    <View style={styles.metricItem}>
                      <CommonText title="Current Loss" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.currentLoss}%`} 
                        textStyle={[16, 'bold', '#ff5722']} 
                      />
                    </View>
                  )}
                  
                  {calculation.remainingLossAfterAverage && (
                    <View style={styles.metricItem}>
                      <CommonText title="Remaining Loss" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.remainingLossAfterAverage}%`} 
                        textStyle={[16, 'bold', '#ff9800']} 
                      />
                    </View>
                  )}
                  
                  {/* Loss Recovery Calculator Metrics */}
                  {calculation.currentLossPercentage && (
                    <View style={styles.metricItem}>
                      <CommonText title="Current Loss" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.currentLossPercentage}%`} 
                        textStyle={[16, 'bold', '#ff5722']} 
                      />
                    </View>
                  )}
                  
                  {calculation.recoveryPercentage && (
                    <View style={styles.metricItem}>
                      <CommonText title="Recovery Target" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.recoveryPercentage}%`} 
                        textStyle={[16, 'bold', '#9c27b0']} 
                      />
                    </View>
                  )}
                  
                  {calculation.currentPrice && (
                    <View style={styles.metricItem}>
                      <CommonText title="Current Price" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.currentPrice)}`} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                  )}
                  
                  {calculation.finalLossPercent && (
                    <View style={styles.metricItem}>
                      <CommonText title="Final Loss" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`${calculation.finalLossPercent}%`} 
                        textStyle={[16, 'bold', '#ff9800']} 
                      />
                    </View>
                  )}
                  
                  {calculation.additionalShares && (
                    <View style={styles.metricItem}>
                      <CommonText title="Shares to Buy" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={formatIndianNumber(calculation.additionalShares)} 
                        textStyle={[16, 'bold', '#9c27b0']} 
                      />
                    </View>
                  )}
                  
                  {calculation.investmentAmount && (
                    <View style={styles.metricItem}>
                      <CommonText title="Additional Investment" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.investmentAmount)}`} 
                        textStyle={[16, 'bold', '#ff9800']} 
                      />
                    </View>
                  )}
                  
                  {calculation.previousInvestment && (
                    <View style={styles.metricItem}>
                      <CommonText title="Previous Investment" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.previousInvestment)}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {/* Other Calculator Metrics */}
                  {calculation.averagePrice && !calculation.targetAveragePrice && (
                    <View style={styles.metricItem}>
                      <CommonText title="Avg Price" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.averagePrice)}`} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                  )}
                  
                  {calculation.totalInvestment && !calculation.investmentNeeded && (
                    <View style={styles.metricItem}>
                      <CommonText title="Total Investment" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.totalInvestment)}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.targetAmount && (
                    <View style={styles.metricItem}>
                      <CommonText title="Target Amount" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.targetAmount)}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.totalQuantity && (
                    <View style={styles.metricItem}>
                      <CommonText title="Total Shares" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={formatIndianNumber(calculation.totalQuantity)} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.sharesNeeded && !calculation.additionalSharesNeeded && (
                    <View style={styles.metricItem}>
                      <CommonText title="Shares Needed" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={formatIndianNumber(calculation.sharesNeeded)} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                </View>

                {/* CAGR Summary - Only for CAGR Calculator */}
                {calculation.averageAnnualReturn && (
                  <View style={[styles.profitLossSummary, { 
                    backgroundColor: '#f0f9ff',
                    borderColor: '#4caf50'
                  }]}>
                    <View style={styles.profitLossRow}>
                      <CommonText 
                        title="📊 CAGR RESULT" 
                        textStyle={[14, 'bold', '#4caf50']} 
                      />
                      <CommonText 
                        title={`${calculation.averageAnnualReturn}%`} 
                        textStyle={[16, 'bold', '#4caf50']} 
                      />
                    </View>
                    <CommonText 
                      title={`${calculation.totalReturn}% total return over ${formatIndianNumber(calculation.years)} years`} 
                      textStyle={[14, '600', '#4caf50']} 
                    />
                  </View>
                )}

                {/* Profit/Loss Summary - Only for Average Buy Calculator */}
                {calculation.profitLoss !== undefined && (
                  <View style={[styles.profitLossSummary, { 
                    backgroundColor: calculation.isProfitable ? '#f0f9ff' : '#fef2f2',
                    borderColor: calculation.isProfitable ? '#4caf50' : '#f44336'
                  }]}>
                    <View style={styles.profitLossRow}>
                      <CommonText 
                        title={calculation.isProfitable ? "📈 PROFIT" : "📉 LOSS"} 
                        textStyle={[14, 'bold', calculation.isProfitable ? '#4caf50' : '#f44336']} 
                      />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.profitLoss)}`} 
                        textStyle={[16, 'bold', calculation.isProfitable ? '#4caf50' : '#f44336']} 
                      />
                    </View>
                    <CommonText 
                      title={`${calculation.profitLossPercentage}% return`} 
                      textStyle={[14, '600', calculation.isProfitable ? '#4caf50' : '#f44336']} 
                    />
                  </View>
                )}

                {/* Average Price Reduction Summary */}
                {calculation.targetAveragePrice && (
                  <View style={[styles.profitLossSummary, { 
                    backgroundColor: '#f0f9ff',
                    borderColor: '#9c27b0'
                  }]}>
                    <View style={styles.profitLossRow}>
                      <CommonText 
                        title="📊 AVERAGE PRICE REDUCTION" 
                        textStyle={[14, 'bold', '#9c27b0']} 
                      />
                      <CommonText 
                        title={`₹${formatIndianNumber(calculation.newAveragePrice)}`} 
                        textStyle={[16, 'bold', '#9c27b0']} 
                      />
                    </View>
                    <CommonText 
                      title={`Buy ${formatIndianNumber(calculation.additionalSharesNeeded)} shares to achieve ₹${formatIndianNumber(calculation.targetAveragePrice)} average`} 
                      textStyle={[14, '600', '#9c27b0']} 
                    />
                  </View>
                )}

                {/* Loss Recovery Summary */}
                {calculation.currentLossPercentage && (
                  <View style={[styles.profitLossSummary, { 
                    backgroundColor: '#f0f9ff',
                    borderColor: '#ff5722'
                  }]}>
                    <View style={styles.profitLossRow}>
                      <CommonText 
                        title="📉 LOSS RECOVERY" 
                        textStyle={[14, 'bold', '#ff5722']} 
                      />
                      <CommonText 
                        title={`${calculation.finalLossPercent}%`} 
                        textStyle={[16, 'bold', '#ff5722']} 
                      />
                    </View>
                    <CommonText 
                      title={`Reduce loss from ${calculation.currentLossPercentage}% to ${calculation.finalLossPercent}%`} 
                      textStyle={[14, '600', '#ff5722']} 
                    />
                  </View>
                )}

                {/* Share Price Match Summary */}
                {calculation.sharesNeeded !== undefined && !calculation.targetAveragePrice && !calculation.currentLossPercentage && (
                  <View style={[styles.profitLossSummary, { 
                    backgroundColor: '#f0f9ff',
                    borderColor: '#2196F3'
                  }]}>
                    <View style={styles.profitLossRow}>
                      <CommonText 
                        title="📈 SHARES CALCULATION" 
                        textStyle={[14, 'bold', '#2196F3']} 
                      />
                      <CommonText 
                        title={`${formatIndianNumber(calculation.sharesNeeded)} shares`} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                    <CommonText 
                      title={`₹${formatIndianNumber(calculation.actualInvestment)} invested`} 
                      textStyle={[14, '600', '#2196F3']} 
                    />
                  </View>
                )}

                {/* Purchase Details */}
                <View style={styles.purchaseDetails}>
                  {calculation.numberOfPurchases && (
                    <CommonText 
                      title={`${formatIndianNumber(calculation.numberOfPurchases)} purchase${calculation.numberOfPurchases !== 1 ? 's' : ''} made`} 
                      textStyle={[14, '500', '#666']} 
                    />
                  )}
                  {calculation.remainingAmount && (
                    <CommonText 
                      title={`₹${formatIndianNumber(calculation.remainingAmount)} remaining`} 
                      textStyle={[14, '500', '#666']} 
                    />
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.reapplyButton}
                    onPress={() => handleReapplyCalculation(calculation)}
                  >
                    <CommonText title="🔄 Reapply" textStyle={[14, '600', '#2196F3']} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  clearAllButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 20,
  },
  calculationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stockInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  metricItem: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  profitLossSummary: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
  },
  profitLossRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  purchaseDetails: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  reapplyButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
});

export default HistoryScreen; 