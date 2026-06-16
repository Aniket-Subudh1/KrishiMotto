import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CropTypeChips } from '@/features/crop-calendar/components/crop-type-chips';
import { ParcelPicker } from '@/features/crop-calendar/components/parcel-picker';
import { StepIndicator } from '@/features/crop-calendar/components/step-indicator';
import { SoilTypeChips } from '@/features/crop-health/components/soil-type-chips';
import {
  getBookingError,
  useCreateSoilHealthBooking,
} from '@/features/soil-health/hooks/use-soil-health-booking';
import {
  buildDefaultSoilHealthForm,
  validateSoilHealthForm,
  type SoilHealthFormValues,
} from '@/features/soil-health/utils/validate-form';
import { useLandParcels } from '@/features/farmer/hooks/use-land-parcel';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCropType, translateSoilType } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { formatAcres } from '@/lib/format';
import { computePerAcrePricing } from '@/lib/pricing';
import { useAuthStore } from '@/stores/auth.store';
import type { CatalogService } from '@/types/catalog';

const STEPS = ['field', 'analysis'] as const;
type WizardStep = (typeof STEPS)[number];

function findSoilHealthService(services?: CatalogService[]): CatalogService | undefined {
  return services?.find((service) => service.iconType === 'SOIL_HEALTH');
}

function stepIndex(step: WizardStep): number {
  return STEPS.indexOf(step) + 1;
}

export function SoilHealthScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: parcels = [] } = useLandParcels();
  const { data: catalogServices, isLoading: catalogLoading } = useCatalog();
  const createBooking = useCreateSoilHealthBooking();

  const [step, setStep] = useState<WizardStep>('field');
  const [form, setForm] = useState<SoilHealthFormValues>(() => buildDefaultSoilHealthForm());
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [parcelError, setParcelError] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validateSoilHealthForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'paying' | 'polling' | 'done'>('idle');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const soilHealthService = useMemo(
    () => findSoilHealthService(catalogServices),
    [catalogServices],
  );

  const stepLabels = useMemo(
    () => [t('soilHealth.steps.field'), t('soilHealth.steps.analysis')],
    [t],
  );

  const selectedParcel = useMemo(
    () => parcels.find((item) => item.id === selectedParcelId),
    [parcels, selectedParcelId],
  );

  const priceEstimate = useMemo(() => {
    if (!selectedParcel || !soilHealthService) return null;
    return computePerAcrePricing(
      selectedParcel.areaAcres,
      soilHealthService.basePricePaise,
      soilHealthService.transportApplies,
    );
  }, [selectedParcel, soilHealthService]);

  useEffect(() => {
    if (!selectedParcelId && parcels.length > 0) {
      setSelectedParcelId(parcels[0].id);
    }
  }, [parcels, selectedParcelId]);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  function updateForm<K extends keyof SoilHealthFormValues>(key: K, value: SoilHealthFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  function handleParcelSelect(parcelId: string) {
    setSelectedParcelId(parcelId);
    setParcelError(undefined);
  }

  function validateCurrentStep(): boolean {
    if (step === 'field') {
      if (!selectedParcelId || !parcels.find((p) => p.id === selectedParcelId)) {
        setParcelError(t('soilHealth.errors.parcelRequired'));
        return false;
      }
      setParcelError(undefined);
      return true;
    }

    const errors = validateSoilHealthForm(form, t);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    const index = STEPS.indexOf(step);
    if (index < STEPS.length - 1) {
      setStep(STEPS[index + 1]);
    }
  }

  function goBack() {
    const index = STEPS.indexOf(step);
    if (index > 0) {
      setStep(STEPS[index - 1]);
      return;
    }
    router.back();
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;

    const parcel = parcels.find((item) => item.id === selectedParcelId);
    if (!parcel) {
      setParcelError(t('soilHealth.errors.parcelRequired'));
      setStep('field');
      return;
    }

    setSubmitError(null);
    setPaymentState('paying');

    try {
      const booking = await createBooking.mutateAsync({
        serviceIconType: 'SOIL_HEALTH',
        geometry: parcel.geometry,
        details: {
          cropType: form.cropType,
          soilType: form.soilType,
          transportIncluded: form.transportIncluded,
          query: form.query.trim() || undefined,
        },
        query: form.query.trim() || undefined,
      });

      if (booking.paymentUrl) {
        router.replace({
          pathname: '/payment/checkout',
          params: {
            bookingId: booking.id,
            orderId: booking.orderId,
          },
        });
        return;
      }

      setPaymentState('done');
      setCompletedOrderId(booking.orderId);
      Alert.alert(t('soilHealth.bookingCreatedTitle'), t('soilHealth.bookingCreatedBody'), [
        { text: t('soilHealth.done'), onPress: () => router.back() },
      ]);
    } catch (error) {
      setPaymentState('idle');
      setSubmitError(getBookingError(error, t('soilHealth.submitError')));
    }
  }

  const perAcreLabel = soilHealthService
    ? formatPaise(soilHealthService.basePricePaise)
    : '₹4,999';
  const transportLabel = priceEstimate?.transportPaise
    ? formatPaise(priceEstimate.transportPaise)
    : null;
  const totalLabel = priceEstimate ? formatPaise(priceEstimate.totalPaise) : perAcreLabel;
  const isBusy = createBooking.isPending || paymentState === 'paying' || paymentState === 'polling';
  const currentStepIndex = stepIndex(step);
  const isLastStep = step === 'analysis';

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={goBack}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View className="rounded-full bg-white/20 px-3 py-1">
            <Text className="text-[12px] font-semibold text-white">
              {t('soilHealth.stepOf')
                .replace('{{current}}', String(currentStepIndex))
                .replace('{{total}}', String(STEPS.length))}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Ionicons name="flask-outline" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('soilHealth.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {catalogLoading
                ? '…'
                : soilHealthService?.priceLabel ?? t('soilHealth.subtitle')}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-[14px] text-white/85">
          {step === 'field' ? t('soilHealth.stepHints.field') : t('soilHealth.stepHints.analysis')}
        </Text>

        <View className="mt-5">
          <StepIndicator steps={stepLabels} currentStep={currentStepIndex} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-6 pt-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {submitError ? (
            <View className="mb-4">
              <ErrorBanner message={submitError} />
            </View>
          ) : null}

          {completedOrderId ? (
            <View className="mb-4 rounded-2xl border border-india-green/30 bg-india-green/5 px-4 py-3">
              <Text className="text-[14px] font-semibold text-india-green">
                {t('soilHealth.orderRef').replace('{{orderId}}', completedOrderId)}
              </Text>
            </View>
          ) : null}

          {step === 'field' ? (
            <View className="gap-5">
              <ParcelPicker
                label={t('soilHealth.fieldLabel')}
                hint={t('soilHealth.fieldHint')}
                parcels={parcels}
                selectedId={selectedParcelId}
                onSelect={handleParcelSelect}
                onAddField={() => router.push('/farmer/land-boundary')}
                error={parcelError}
                addFieldLabel={t('soilHealth.addField')}
              />

              {selectedParcel && priceEstimate ? (
                <PriceEstimateCard
                  title={t('soilHealth.priceEstimate')}
                  totalLabel={totalLabel}
                  breakdownLabel={t('soilHealth.priceBreakdown')
                    .replace('{{rate}}', perAcreLabel)
                    .replace('{{units}}', String(priceEstimate.areaUnits))
                    .replace('{{acres}}', formatAcres(selectedParcel.areaAcres))}
                  transportNote={
                    transportLabel
                      ? t('soilHealth.transportFee').replace('{{fee}}', transportLabel)
                      : undefined
                  }
                />
              ) : null}
            </View>
          ) : null}

          {step === 'analysis' ? (
            <View className="gap-5">
              <CropTypeChips
                label={t('soilHealth.cropType')}
                value={form.cropType}
                onChange={(value) => updateForm('cropType', value)}
                error={formErrors.cropType}
              />

              <SoilTypeChips
                label={t('soilHealth.soilType')}
                value={form.soilType}
                onChange={(value) => updateForm('soilType', value)}
                error={formErrors.soilType}
              />

              <View className="rounded-2xl border border-border bg-white px-4 py-3.5">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-[14px] font-semibold text-indigo">
                      {t('soilHealth.transportIncluded')}
                    </Text>
                    <Text className="mt-0.5 text-[12px] leading-4 text-muted">
                      {t('soilHealth.transportIncludedHint')}
                    </Text>
                  </View>
                  <Switch
                    value={form.transportIncluded}
                    onValueChange={(value) => updateForm('transportIncluded', value)}
                    trackColor={{ false: '#E2E8F0', true: 'rgba(70, 150, 47, 0.4)' }}
                    thumbColor={form.transportIncluded ? Palette.indiaGreen : '#FFFFFF'}
                  />
                </View>
              </View>

              <Input
                label={t('soilHealth.notes')}
                value={form.query}
                onChangeText={(value) => updateForm('query', value)}
                placeholder={t('soilHealth.notesPlaceholder')}
                multiline
                numberOfLines={3}
                icon="chatbox-ellipses-outline"
                hint={t('soilHealth.notesHint')}
              />

              {selectedParcel ? (
                <View className="overflow-hidden rounded-2xl border border-saffron/25 bg-surface">
                  <LinearGradient
                    colors={['rgba(244, 164, 96, 0.1)', 'rgba(70, 150, 47, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="px-4 py-4"
                  >
                    <Text className="text-[12px] font-medium uppercase tracking-wide text-muted">
                      {t('soilHealth.reviewTitle')}
                    </Text>
                    <View className="mt-3 gap-2">
                      <ReviewLine
                        icon="map-outline"
                        label={t('soilHealth.fieldLabel')}
                        value={`${selectedParcel.name} · ${formatAcres(selectedParcel.areaAcres)}`}
                      />
                      <ReviewLine
                        icon="leaf-outline"
                        label={t('soilHealth.cropType')}
                        value={translateCropType(t, form.cropType)}
                      />
                      <ReviewLine
                        icon="flask-outline"
                        label={t('soilHealth.soilType')}
                        value={translateSoilType(t, form.soilType)}
                      />
                    </View>

                    <View className="mt-4 flex-row items-center justify-between border-t border-border pt-4">
                      <View>
                        <Text className="text-[12px] text-muted">{t('soilHealth.totalPayable')}</Text>
                        <Text className="mt-1 text-[26px] font-bold text-india-green">{totalLabel}</Text>
                        {transportLabel ? (
                          <Text className="mt-0.5 text-[11px] text-muted">
                            {t('soilHealth.includesTransport').replace('{{fee}}', transportLabel)}
                          </Text>
                        ) : null}
                      </View>
                      <View className="flex-row items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
                        <Ionicons name="analytics-outline" size={14} color={Palette.saffron} />
                        <Text className="text-[11px] font-semibold text-saffron">
                          {t('soilHealth.hyperspectral')}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        <View
          className="border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {isLastStep ? (
            <Button size="lg" className="w-full" loading={isBusy} onPress={handleSubmit}>
              {paymentState === 'polling'
                ? t('soilHealth.checkingPayment')
                : t('soilHealth.submit').replace('{{price}}', totalLabel)}
            </Button>
          ) : (
            <View className="flex-row gap-3">
              {currentStepIndex > 1 ? (
                <Button
                  size="lg"
                  variant="secondary"
                  className="min-w-[100px]"
                  onPress={() => setStep(STEPS[currentStepIndex - 2])}
                >
                  {t('soilHealth.back')}
                </Button>
              ) : null}
              <Button size="lg" className="flex-1" onPress={goNext}>
                {t('soilHealth.continue')}
              </Button>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function PriceEstimateCard({
  title,
  totalLabel,
  breakdownLabel,
  transportNote,
}: {
  title: string;
  totalLabel: string;
  breakdownLabel: string;
  transportNote?: string;
}) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-white">
      <View className="h-[3px] overflow-hidden">
        <LinearGradient
          colors={[Palette.saffron, Palette.indiaGreen]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>
      <View className="gap-2 p-4">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">{title}</Text>
        <Text className="text-[24px] font-bold text-indigo">{totalLabel}</Text>
        <Text className="text-[13px] text-muted">{breakdownLabel}</Text>
        {transportNote ? (
          <Text className="text-[12px] text-muted">{transportNote}</Text>
        ) : null}
      </View>
    </View>
  );
}

function ReviewLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
        <Ionicons name={icon} size={15} color={Palette.indigo} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] text-muted">{label}</Text>
        <Text className="text-[14px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}
