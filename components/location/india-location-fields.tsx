import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { SearchableOptionPicker } from '@/components/location/searchable-option-picker';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useIndiaLocationDirectory, usePincodeLookupOnBlur } from '@/hooks/use-india-locations';
import type { IndiaStateDistricts } from '@/types/india-location';
import { normalizePhoneInput } from '@/lib/validation';

type IndiaLocationFieldsProps = {
  state: string;
  district: string;
  onStateChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  showPincode?: boolean;
  stateError?: string;
  districtError?: string;
  pincodeError?: string;
  t: (key: string) => string;
};

export function IndiaLocationFields({
  state,
  district,
  onStateChange,
  onDistrictChange,
  showPincode = true,
  stateError,
  districtError,
  pincodeError,
  t,
}: IndiaLocationFieldsProps) {
  const [pincode, setPincode] = useState('');
  const [pincodeHint, setPincodeHint] = useState<string | null>(null);
  const [pincodeLookingUp, setPincodeLookingUp] = useState(false);
  const directoryQuery = useIndiaLocationDirectory();
  const { lookupPincode, directoryReady } = usePincodeLookupOnBlur();
  const directoryLoading = directoryQuery.isLoading;
  const directoryError = directoryQuery.isError;
  const directoryData = directoryQuery.data;

  const stateOptions = useMemo(
    () => directoryData?.states.map((entry: IndiaStateDistricts) => entry.state) ?? [],
    [directoryData],
  );

  const districtOptions = useMemo(() => {
    if (!directoryData || !state) {
      return [];
    }
    return (
      directoryData.states.find((entry: IndiaStateDistricts) => entry.state === state)
        ?.districts ?? []
    );
  }, [directoryData, state]);

  async function handlePincodeBlur() {
    if (!showPincode || pincode.length !== 6) {
      return;
    }

    if (!directoryReady) {
      setPincodeHint(t('farmerSignUp.locationDirectoryError'));
      return;
    }

    setPincodeLookingUp(true);
    setPincodeHint(null);

    try {
      const result = await lookupPincode(pincode);
      if (result) {
        onStateChange(result.state);
        onDistrictChange(result.district);
        setPincodeHint(
          t('farmerSignUp.pincodeLookupSuccess')
            .replace('{{district}}', result.district)
            .replace('{{state}}', result.state),
        );
      } else {
        setPincodeHint(t('farmerSignUp.pincodeLookupFailed'));
      }
    } catch {
      setPincodeHint(t('farmerSignUp.pincodeLookupFailed'));
    } finally {
      setPincodeLookingUp(false);
    }
  }

  function handlePincodeChange(value: string) {
    setPincode(normalizePhoneInput(value).slice(0, 6));
    setPincodeHint(null);
  }

  function handleStateChange(nextState: string) {
    onStateChange(nextState);
    const nextDistricts =
      directoryData?.states.find((entry: IndiaStateDistricts) => entry.state === nextState)
        ?.districts ?? [];
    if (district && !nextDistricts.includes(district)) {
      onDistrictChange('');
    }
    setPincodeHint(null);
  }

  const pincodeHintText = pincodeLookingUp
    ? t('farmerSignUp.pincodeLookingUp')
    : pincodeHint ?? t('farmerSignUp.pincodeHint');

  return (
    <View className="gap-4">
      {showPincode ? (
        <Input
          fieldId="profile-pincode"
          label={t('farmerSignUp.pincodeLabel')}
          value={pincode}
          onChangeText={handlePincodeChange}
          onBlur={() => void handlePincodeBlur()}
          placeholder={t('farmerSignUp.pincodePlaceholder')}
          hint={pincodeHintText}
          error={pincodeError}
          icon="mail-outline"
          keyboardType="number-pad"
          maxLength={6}
        />
      ) : null}

      {directoryError ? (
        <View className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
          <Text className="text-[13px] leading-[19px] text-red-600">
            {t('farmerSignUp.locationDirectoryError')}
          </Text>
        </View>
      ) : null}

      <SearchableOptionPicker
        label={t('farmerSignUp.stateLabel')}
        value={state}
        options={stateOptions}
        onChange={handleStateChange}
        placeholder={t('farmerSignUp.statePlaceholder')}
        searchPlaceholder={t('farmerSignUp.searchStatePlaceholder')}
        loading={directoryLoading}
        error={stateError}
        emptyLabel={t('farmerSignUp.noLocationMatches')}
      />

      <SearchableOptionPicker
        label={t('farmerSignUp.districtLabel')}
        value={district}
        options={districtOptions}
        onChange={onDistrictChange}
        placeholder={
          state ? t('farmerSignUp.districtPlaceholder') : t('farmerSignUp.selectStateFirst')
        }
        searchPlaceholder={t('farmerSignUp.searchDistrictPlaceholder')}
        disabled={!state || directoryLoading}
        loading={directoryLoading}
        error={districtError}
        emptyLabel={t('farmerSignUp.noLocationMatches')}
      />
    </View>
  );
}
