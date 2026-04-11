import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>关于应用</Text>
      <Text style={styles.desc}>
        这是一款纯本地存储的记忆应用。所有分类、文本、文件和网址数据都安全地保存在您的手机中，没有任何网络上传，保护您的隐私。
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
  },
});
