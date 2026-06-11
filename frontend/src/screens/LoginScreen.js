import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false); // Controla se a tela é de login ou cadastro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!email || !password || (isRegistering && !name)) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro inesperado.');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Flux.</Text>
        <Text style={styles.subtitle}>Gestão Financeira</Text>

        <View style={styles.inputContainer}>
          {isRegistering && (
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Nome completo"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          
          <TextInput
            style={[styles.input, { marginTop: 16 }]}
            placeholder="Senha"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit} 
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'Cadastrar' : 'Entrar'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Botão sutil para alternar entre Login e Cadastro */}
        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => {
            setIsRegistering(!isRegistering);
            setName(''); // Limpa o nome ao alternar as telas
          }}
        >
          <Text style={styles.switchButtonText}>
            {isRegistering ? 'Já tem uma conta? Entrar' : 'Ainda não tem conta? Cadastrar'}
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center' },
  content: { paddingHorizontal: 32 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -1.5, marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#888888', marginBottom: 48, letterSpacing: 1, textTransform: 'uppercase' },
  inputContainer: { marginBottom: 24 },
  input: { backgroundColor: '#1A1A1A', color: '#FFFFFF', borderRadius: 12, padding: 18, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8, height: 60, justifyContent: 'center' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  switchButton: { marginTop: 24, alignItems: 'center', padding: 10 },
  switchButtonText: { color: '#888888', fontSize: 14, fontWeight: '600' },
});