import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Button from '../components/Button';
import { styles } from '../styles/appStyles';
type Props = { onVoltar: () => void };
export default function TypeBlasterScreen({ onVoltar }: Props) { return <SafeAreaView style={styles.safeArea}><View style={styles.gameWrapper}><View style={styles.gameHeader}><Button variant="secondary" onPress={onVoltar}>← Voltar aos Jogos</Button></View><View style={styles.gameFrame}><WebView source={require('../../games/typeblaster.html')} style={styles.gameWebView} javaScriptEnabled domStorageEnabled originWhitelist={['*']} scrollEnabled={false} bounces={false} /></View></View></SafeAreaView>; }
