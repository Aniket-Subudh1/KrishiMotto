import { Alert } from 'react-native';

export function showComingSoonAlert(t: (key: string) => string) {
  Alert.alert(t('home.tools.comingSoon'), t('home.tools.comingSoonBody'));
}
