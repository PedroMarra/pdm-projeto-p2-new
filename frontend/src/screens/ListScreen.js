import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionContext } from '../context/TransactionContext';
import { AuthContext } from '../context/AuthContext'; 
import api from '../services/api';

export default function ListScreen() {
  const { transactions, addTransaction, deleteTransaction } = useContext(TransactionContext);
  const { user, logout } = useContext(AuthContext); 
  
  const [modalVisible, setModalVisible] = useState(false);
  
  // Controlo de Edição e Opções
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  useEffect(() => {
    fetchCategories();
  }, [modalVisible]);

  // FUNÇÃO MODIFICADA COM O "ESPIÃO" DE ERROS
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      Alert.alert("Erro Invisível Revelado", `O servidor disse: ${JSON.stringify(errorMessage)}`);
    }
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
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

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsSavingCategory(true);
    try {
      const isIncome = type === 'income';

      const response = await api.post('/categories', { 
        name: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        displayName: newCategoryName,
        isIncome: isIncome,
        icon: "apps",
        background: "#333333"
      });
      
      setCategories([...categories, response.data]);
      setSelectedCategory(response.data.id);
      
      setNewCategoryName('');
      setIsCreatingCategory(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      Alert.alert('Erro no Backend', JSON.stringify(errorMessage));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!title.trim() || !amount.trim()) return Alert.alert('Aviso', 'Preencha o título e o valor.');
    if (!selectedCategory) return Alert.alert('Aviso', 'Selecione uma categoria.');

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount)) return Alert.alert('Erro', 'Valor inválido.');

    const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    try {
        if (isEditing) {
          await deleteTransaction(selectedTransaction.id);
          await addTransaction({
            description: title,
            value: finalAmount,
            categoryId: selectedCategory,
            date: selectedTransaction.date || new Date().toISOString()
          });
        } else {
          await addTransaction({
            description: title,
            value: finalAmount,
            categoryId: selectedCategory,
            date: new Date().toISOString()
          });
        }
        
        setTitle('');
        setAmount('');
        setType('expense');
        setSelectedCategory(null);
        setModalVisible(false);
        setIsEditing(false);
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
        Alert.alert('Erro ao Salvar', JSON.stringify(errorMessage));
    }
  };

  const handleDelete = (id, description) => {
    Alert.alert("Excluir", `Deseja apagar "${description}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteTransaction(id) }
    ]);
  };

  const handleEditOption = () => {
    setOptionsModalVisible(false);
    setIsEditing(true);
    
    setTitle(selectedTransaction.description);
    setAmount(Math.abs(selectedTransaction.value).toString());
    setType(selectedTransaction.value >= 0 ? 'income' : 'expense');
    setSelectedCategory(selectedTransaction.categoryId || selectedTransaction.category?.id);
    
    setModalVisible(true);
  };

  const handleDeleteOption = () => {
    setOptionsModalVisible(false);
    handleDelete(selectedTransaction.id, selectedTransaction.description);
  };

  const handleDeleteCategory = (categoriaParaApagar) => {
    Alert.alert(
      "Excluir Categoria",
      `Deseja apagar a categoria "${categoriaParaApagar.displayName || categoriaParaApagar.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/categories/${categoriaParaApagar.id}`);
              setCategories(categories.filter(c => c.id !== categoriaParaApagar.id));
              if (selectedCategory === categoriaParaApagar.id) {
                setSelectedCategory(null);
              }
            } catch (error) {
              const errorMessage = error.response?.data?.error || "Erro ao excluir categoria.";
              Alert.alert("Bloqueado", errorMessage);
            }
          } 
        }
      ]
    );
  };

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

  const renderItem = ({ item }) => {
    const isIncome = item.value >= 0;
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onLongPress={() => {
          setSelectedTransaction(item);
          setOptionsModalVisible(true);
        }}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.description}</Text>
          <Text style={styles.cardDate}>{item.category?.displayName || item.category?.name || 'Sem categoria'}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.cardAmount, isIncome ? styles.income : styles.expense]}>
            {isIncome ? '+ R$' : '- R$'} {Math.abs(item.value).toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Movimentações</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                setIsEditing(false);
                setTitle('');
                setAmount('');
                setType('expense');
                setSelectedCategory(null);
                setModalVisible(true);
              }} 
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#000" />
            </TouchableOpacity>
          </View>
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

      {filteredTransactions.length > 0 ? (
        <FlatList data={filteredTransactions} keyExtractor={item => String(item.id)} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      ) : (
        <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhuma movimentação neste mês.</Text></View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Editar Movimentação' : 'Nova Movimentação'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]} onPress={() => setType('expense')}>
                <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]} onPress={() => setType('income')}>
                <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Receita</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Ex: Salário" placeholderTextColor="#666" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Valor (Ex: 1500,00)" placeholderTextColor="#666" keyboardType="numeric" value={amount} onChangeText={setAmount} />

            <View style={styles.categoryHeader}>
              <Text style={styles.sectionLabel}>Categoria</Text>
              <TouchableOpacity onPress={() => setIsCreatingCategory(!isCreatingCategory)} style={styles.addCategoryIcon}>
                <Ionicons name={isCreatingCategory ? "close-circle" : "add-circle"} size={22} color="#888" />
              </TouchableOpacity>
            </View>

            {isCreatingCategory ? (
              <View style={styles.newCategoryContainer}>
                <TextInput style={styles.newCategoryInput} placeholder="Nome da categoria" placeholderTextColor="#666" value={newCategoryName} onChangeText={setNewCategoryName} autoFocus />
                <TouchableOpacity style={styles.saveCategoryButton} onPress={handleCreateNewCategory} disabled={isSavingCategory}>
                  {isSavingCategory ? <ActivityIndicator size="small" color="#000" /> : <Ionicons name="checkmark" size={20} color="#000" />}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.categoriesWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity 
                      key={String(cat.id)} 
                      style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]} 
                      onPress={() => setSelectedCategory(cat.id)}
                      onLongPress={() => handleDeleteCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                        {cat.displayName || cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleAddTransaction}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={optionsModalVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.optionsModalContainer} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsModalTitle}>Opções da Movimentação</Text>
            <Text style={styles.optionsModalSubtitle}>"{selectedTransaction?.description}"</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleEditOption}>
              <Ionicons name="pencil-outline" size={20} color="#FFF" />
              <Text style={styles.optionButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionButton, styles.optionButtonDelete]} onPress={handleDeleteOption}>
              <Ionicons name="trash-outline" size={20} color="#E53935" />
              <Text style={[styles.optionButtonText, styles.optionButtonDeleteText]}>Excluir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCancelButton} onPress={() => setOptionsModalVisible(false)}>
              <Text style={styles.optionCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 24, paddingTop: 60 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutButton: { padding: 4 },
  greeting: { fontSize: 18, color: '#888888', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -1 },
  addButton: { backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }, 
  list: { paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#666666', fontSize: 16 },
  card: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#888888' },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  cardAmount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: '#4CAF50' },
  expense: { color: '#E53935' },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  typeSelector: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  typeButton: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  typeButtonActiveExpense: { backgroundColor: 'rgba(229, 57, 53, 0.1)', borderColor: '#E53935' },
  typeButtonActiveIncome: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: '#4CAF50' },
  typeText: { color: '#888', fontWeight: '600' },
  typeTextActive: { color: '#FFF' },
  input: { backgroundColor: '#0A0A0A', color: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { color: '#888888', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  addCategoryIcon: { padding: 4 },
  newCategoryContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  newCategoryInput: { flex: 1, backgroundColor: '#0A0A0A', color: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  saveCategoryButton: { backgroundColor: '#FFFFFF', width: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoriesWrapper: { marginBottom: 24, marginHorizontal: -24 },
  categoriesScroll: { paddingHorizontal: 24, gap: 10 },
  categoryChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333' },
  categoryChipActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  categoryChipText: { color: '#888888', fontSize: 14, fontWeight: '600' },
  categoryChipTextActive: { color: '#000000', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  optionsModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 32 },
  optionsModalContent: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  optionsModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  optionsModalSubtitle: { fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' },
  optionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#222', width: '100%', padding: 16, borderRadius: 12, marginBottom: 12, gap: 10, borderWidth: 1, borderColor: '#333' },
  optionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  optionButtonDelete: { backgroundColor: 'rgba(229, 57, 53, 0.05)', borderColor: 'rgba(229, 57, 53, 0.2)' },
  optionButtonDeleteText: { color: '#E53935' },
  optionCancelButton: { marginTop: 8, padding: 12 },
  optionCancelButtonText: { color: '#888', fontSize: 16, fontWeight: '600' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  filterArrow: { padding: 4, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  filterMonthText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});