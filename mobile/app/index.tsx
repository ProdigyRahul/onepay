import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { wp, hp, getSafeAreaInsets } from '../utils/responsive';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to OnePay</Text>
        <Text style={styles.subtitle}>Your Digital Payment Solution</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Send and receive money instantly, manage your expenses, and track your transactions all in one place.
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Get Started" 
            onPress={() => {}} 
            variant="primary"
          />
          <View style={styles.spacing} />
          <Button 
            title="Learn More" 
            onPress={() => {}} 
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: getSafeAreaInsets().top,
  },
  header: {
    marginTop: hp(5),
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Theme.typography.h2,
    color: Theme.colors.gray,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
    maxWidth: wp(80),
  },
  buttonContainer: {
    width: '100%',
    maxWidth: wp(80),
  },
  spacing: {
    height: Theme.spacing.md,
  },
}); 