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
                  {calculation.averagePrice && (
                    <View style={styles.metricItem}>
                      <CommonText title="Avg Price" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculation.averagePrice}`} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                  )}
                  
                  {/* <View style={styles.metricItem}>
                    <CommonText title="Current Price" textStyle={[12, '500', '#666']} />
                    <CommonText 
                      title={`₹${calculation.currentPrice}`} 
                      textStyle={[16, 'bold', '#333']} 
                    />
                  </View> */}
                  
                  {calculation.totalInvestment && (
                    <View style={styles.metricItem}>
                      <CommonText title="Total Investment" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculation.totalInvestment}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.targetAmount && (
                    <View style={styles.metricItem}>
                      <CommonText title="Target Amount" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={`₹${calculation.targetAmount}`} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.totalQuantity && (
                    <View style={styles.metricItem}>
                      <CommonText title="Total Shares" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={calculation.totalQuantity} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                  
                  {calculation.sharesNeeded && (
                    <View style={styles.metricItem}>
                      <CommonText title="Shares Needed" textStyle={[12, '500', '#666']} />
                      <CommonText 
                        title={calculation.sharesNeeded} 
                        textStyle={[16, 'bold', '#333']} 
                      />
                    </View>
                  )}
                </View>

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
                        title={`₹${calculation.profitLoss}`} 
                        textStyle={[16, 'bold', calculation.isProfitable ? '#4caf50' : '#f44336']} 
                      />
                    </View>
                    <CommonText 
                      title={`${calculation.profitLossPercentage}% return`} 
                      textStyle={[14, '600', calculation.isProfitable ? '#4caf50' : '#f44336']} 
                    />
                  </View>
                )}

                {/* Share Price Match Summary */}
                {calculation.sharesNeeded !== undefined && (
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
                        title={`${calculation.sharesNeeded} shares`} 
                        textStyle={[16, 'bold', '#2196F3']} 
                      />
                    </View>
                    <CommonText 
                      title={`₹${calculation.actualInvestment} invested`} 
                      textStyle={[14, '600', '#2196F3']} 
                    />
                  </View>
                )}

                {/* Purchase Details */}
                <View style={styles.purchaseDetails}>
                  {calculation.numberOfPurchases && (
                    <CommonText 
                      title={`${calculation.numberOfPurchases} purchase${calculation.numberOfPurchases !== 1 ? 's' : ''} made`} 
                      textStyle={[14, '500', '#666']} 
                    />
                  )}
                  {calculation.remainingAmount && (
                    <CommonText 
                      title={`₹${calculation.remainingAmount} remaining`} 
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