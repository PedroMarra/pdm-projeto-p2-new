import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons'; 
import { TransactionContext } from '../context/TransactionContext';
import { AuthContext } from '../context/AuthContext'; 

const screenWidth = Dimensions.get('window').width;

export default function SummaryScreen() {
  const { transactions } = useContext(TransactionContext);
  const { user, logout } = useContext(AuthContext); 
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Controla qual categoria foi clicada na legenda
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedCategoryName(null); // Limpa a seleção ao mudar de mês
  };

  const formatCurrentMonth = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  };

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.createdAt ? new Date(t.createdAt) : new Date();
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const balance = filteredTransactions.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const expenses = filteredTransactions.filter(t => (t.value || 0) < 0);
  
  // Calcula o total de despesas para gerar a porcentagem
  const totalExpenses = expenses.reduce((acc, current) => acc + Math.abs(current.value || 0), 0);
  
  const expensesByCategory = expenses.reduce((acc, current) => {
    const catName = current.category?.displayName || current.category?.name || 'Outros';
    if (!acc[catName]) acc[catName] = 0;
    
    acc[catName] += Math.abs(current.value || 0); 
    return acc;
  }, {});

  // NOVA PALETA: Cores "Mudas" e Elegantes (Hues Dessaturados)
  // São cores distintas, mas misturadas com cinza para manter o minimalismo.
  const elegantMinimalPalette = [
    '#F8F9FA', // Off-White (Maior fatia)
    '#CED4DA', // Prata Acinzentado
    '#8D99AE', // Azul-Petróleo Mudo
    '#A3A380', // Verde-Sage Antigo
    '#C098A9', // Roxo-Ardósia Suave
    '#B5835A', // Bronze/Cobre "Apagado"
  ];
  
  const chartData = Object.keys(expensesByCategory).map((key, index) => {
    const amount = expensesByCategory[key];
    const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
    
    // Lógica do Spotlight (Holofote)
    const isSelected = selectedCategoryName === key;
    const isFaded = selectedCategoryName !== null && !isSelected;

    return {
      name: key,
      amount: amount,
      percentage: percentage,
      // Se tiver algo selecionado e não for este, ele fica quase invisível (#1A1A1A). 
      color: isFaded ? '#1A1A1A' : elegantMinimalPalette[index % elegantMinimalPalette.length],
      legendFontColor: '#CCCCCC',
      legendFontSize: 12,
      rawColor: elegantMinimalPalette[index % elegantMinimalPalette.length] // Guarda a cor original para a legenda
    };
  }).sort((a, b) => b.amount - a.amount);

  const chartWidth = screenWidth - 48;
  const pieCentering = (chartWidth - 200) / 2;

  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja encerrar sua sessão?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => logout() }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName} </Text>
          <Text style={styles.title}>Visão Geral</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={28} color="#888888" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterArrow} onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.filterMonthText}>{formatCurrentMonth()}</Text>
        <TouchableOpacity style={styles.filterArrow} onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo do Mês</Text>
        <Text style={[styles.balanceValue, balance < 0 && styles.negativeBalance]}>
          {balance < 0 ? '-' : ''} R$ {Math.abs(balance).toFixed(2).replace('.', ',')}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Composição de Despesas</Text>
          {selectedCategoryName && (
            <TouchableOpacity onPress={() => setSelectedCategoryName(null)}>
              <Text style={styles.resetFilterText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {chartData.length > 0 ? (
          <>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={200}
              chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[pieCentering, 0]}
              absolute
              hasLegend={false} // Mantemos a legenda customizada interativa abaixo
            />
            
            <View style={styles.customLegendContainer}>
              {chartData.map((item, index) => {
                const isSelected = selectedCategoryName === item.name;
                const isFaded = selectedCategoryName !== null && !isSelected;

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.legendRow, 
                      isSelected && styles.legendRowSelected,
                      isFaded && styles.legendRowFaded
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategoryName(isSelected ? null : item.name)}
                  >
                    <View style={styles.legendNameContainer}>
                      {/* A bolinha mantém a cor original distinta */}
                      <View style={[styles.colorIndicator, { backgroundColor: item.rawColor }]} />
                      <Text style={[styles.legendName, isSelected && styles.legendNameSelected]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={styles.legendRight}>
                      {isSelected && (
                        <Text style={styles.percentageText}>{item.percentage}%</Text>
                      )}
                      <Text style={[styles.legendAmount, isSelected && styles.legendAmountSelected]}>
                        R$ {item.amount.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhuma despesa neste mês.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' }, 
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  logoutButton: { padding: 4 },
  greeting: { fontSize: 18, color: '#888888', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -1 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 24, borderWidth: 1, borderColor: '#222' },
  filterArrow: { padding: 4, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  filterMonthText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  balanceCard: { backgroundColor: '#1A1A1A', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#222', marginBottom: 32 },
  balanceLabel: { fontSize: 16, color: '#888888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#4CAF50', letterSpacing: -1 },
  negativeBalance: { color: '#E53935' },
  chartContainer: { backgroundColor: '#1A1A1A', paddingVertical: 24, borderRadius: 16, borderWidth: 1, borderColor: '#222', minHeight: 300 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  resetFilterText: { color: '#888', fontSize: 14, fontWeight: '600' },
  emptyText: { color: '#666', marginTop: 40, alignSelf: 'center' },
  customLegendContainer: { width: '100%', paddingHorizontal: 24, marginTop: 16 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222', borderRadius: 8 },
  legendRowSelected: { backgroundColor: '#222', paddingHorizontal: 12, borderBottomWidth: 0, marginHorizontal: -12 },
  legendRowFaded: { opacity: 0.4 },
  legendNameContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 },
  colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendName: { color: '#CCCCCC', fontSize: 14 },
  legendNameSelected: { color: '#FFFFFF', fontWeight: 'bold' },
  legendRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  percentageText: { color: '#888', fontSize: 12, fontWeight: 'bold', backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  legendAmount: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  legendAmountSelected: { fontSize: 16, fontWeight: 'bold' },
});