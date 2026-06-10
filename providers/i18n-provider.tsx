import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import { applyLocale, i18n } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/locale.store';

type Props = {
  children: React.ReactNode;
};

export function I18nProvider({ children }: Props) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    async function syncFromStore() {
      await applyLocale(useLocaleStore.getState().locale);
    }

    if (useLocaleStore.persist.hasHydrated()) {
      void syncFromStore();
      return;
    }

    const unsub = useLocaleStore.persist.onFinishHydration(() => {
      void syncFromStore();
    });

    return unsub;
  }, []);

  useEffect(() => {
    void applyLocale(locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
