import { AppIcon } from '@/components/ui/app-icon';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_FORM_FOOTER_OFFSET,
  KeyboardAwareFormShell,
} from '@/components/ui/keyboard-aware-form-shell';
import { Text } from '@/components/ui/text';
import { CropTypeChips } from '@/features/crop-calendar/components/crop-type-chips';
import { DateField } from '@/features/crop-calendar/components/date-field';
import { ParcelPicker } from '@/features/crop-calendar/components/parcel-picker';
import { StepIndicator } from '@/features/crop-calendar/components/step-indicator';
import { SoilTypeChips } from '@/features/crop-health/components/soil-type-chips';
import { VisitPurposePicker } from '@/features/expert-visit/components/visit-purpose-picker';
import {
  getBookingError,
  useCreateExpertVisitBooking,
} from '@/features/expert-visit/hooks/use-expert-visit-booking';
import {
  buildDefaultExpertVisitForm,
  parseAreaAc,
  validateExpertVisitForm,
  type ExpertVisitFormValues,
} from '@/features/expert-visit/utils/validate-form';
import {
  translateCropType,
  translateSoilType,
  translateVisitPurpose,
  getCatalogServicePriceLabel,
} from '@/lib/booking-i18n';
import { useLandParcels } from '@/features/farmer/hooks/use-land-parcel';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatPaise } from '@/lib/currency';
import { formatAcres } from '@/lib/format';
import { computeFlatPricing } from '@/lib/pricing';
import { useAuthStore } from '@/stores/auth.store';
import type { CatalogService } from '@/types/catalog';
import type { VisitPurpose } from '@/types/booking';

const STEPS = ['field', 'visit'] as const;
type WizardStep = (typeof STEPS)[number];

function findExpertVisitService(services?: CatalogService[]): CatalogService | undefined {
  return services?.find((service) => service.iconType === 'EXPERT_VISIT');
}

function stepIndex(step: WizardStep): number {
  return STEPS.indexOf(step) + 1;
}

export function ExpertVisitScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isFarmer = user?.role === 'FARMER';
  const { data: parcels = [] } = useLandParcels(isFarmer);
  const { data: catalogServices, isLoading: catalogLoading } = useCatalog();
  const createBooking = useCreateExpertVisitBooking();

  const [step, setStep] = useState<WizardStep>('field');
  const [form, setForm] = useState<ExpertVisitFormValues>(() => buildDefaultExpertVisitForm());
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [parcelError, setParcelError] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validateExpertVisitForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'paying' | 'polling' | 'done'>('idle');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const expertVisitService = useMemo(
    () => findExpertVisitService(catalogServices),
    [catalogServices],
  );

  const stepLabels = useMemo(
    () => [t('expertVisit.steps.field'), t('expertVisit.steps.visit')],
    [t],
  );

  const selectedParcel = useMemo(
    () => parcels.find((item) => item.id === selectedParcelId),
    [parcels, selectedParcelId],
  );

  const priceEstimate = useMemo(() => {
    if (!expertVisitService) return null;
    return computeFlatPricing(
      expertVisitService.basePricePaise,
      expertVisitService.transportApplies,
    );
  }, [expertVisitService]);

  useEffect(() => {
    if (!selectedParcelId && parcels.length > 0) {
      const first = parcels[0];
      setSelectedParcelId(first.id);
      setForm((current) => ({
        ...current,
        areaAc: current.areaAc || String(first.areaAcres),
      }));
    }
  }, [parcels, selectedParcelId]);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  function getVisitPurposeLabel(purpose: VisitPurpose): string {
    return translateVisitPurpose(t, purpose);
  }

  function updateForm<K extends keyof ExpertVisitFormValues>(key: K, value: ExpertVisitFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  function handleParcelSelect(parcelId: string) {
    const parcel = parcels.find((item) => item.id === parcelId);
    setSelectedParcelId(parcelId);
    setParcelError(undefined);
    if (parcel) {
      setForm((current) => ({
        ...current,
        areaAc: String(parcel.areaAcres),
      }));
    }
  }

  function validateFieldStep(): boolean {
    if (!selectedParcelId || !parcels.find((p) => p.id === selectedParcelId)) {
      setParcelError(t('expertVisit.errors.parcelRequired'));
      return false;
    }
    setParcelError(undefined);

    const errors = validateExpertVisitForm(form, t);
    if (errors.areaAc) {
      setFormErrors({ areaAc: errors.areaAc });
      return false;
    }
    setFormErrors({});
    return true;
  }

  function validateCurrentStep(): boolean {
    if (step === 'field') {
      return validateFieldStep();
    }

    const errors = validateExpertVisitForm(form, t);
    const visitKeys = ['visitPurpose', 'cropType', 'soilType', 'preferredDate'] as const;
    const stepErrors = Object.fromEntries(
      visitKeys.filter((key) => errors[key]).map((key) => [key, errors[key]]),
    );
    setFormErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
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
    if (!validateFieldStep()) {
      setStep('field');
      return;
    }

    const errors = validateExpertVisitForm(form, t);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const parcel = parcels.find((item) => item.id === selectedParcelId);
    if (!parcel) {
      setParcelError(t('expertVisit.errors.parcelRequired'));
      setStep('field');
      return;
    }

    setSubmitError(null);
    setPaymentState('paying');

    try {
      const booking = await createBooking.mutateAsync({
        serviceIconType: 'EXPERT_VISIT',
        geometry: parcel.geometry,
        details: {
          visitPurpose: form.visitPurpose,
          cropType: form.cropType,
          soilType: form.soilType,
          areaAc: parseAreaAc(form.areaAc),
          preferredDate: form.preferredDate,
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
      Alert.alert(t('expertVisit.bookingCreatedTitle'), t('expertVisit.bookingCreatedBody'), [
        { text: t('expertVisit.done'), onPress: () => router.back() },
      ]);
    } catch (error) {
      setPaymentState('idle');
      setSubmitError(getBookingError(error, t('expertVisit.submitError')));
    }
  }

  const baseLabel = getCatalogServicePriceLabel(expertVisitService, t('expertVisit.subtitle'));
  const transportLabel = priceEstimate?.transportPaise
    ? formatPaise(priceEstimate.transportPaise)
    : null;
  const totalLabel = priceEstimate ? formatPaise(priceEstimate.totalPaise) : baseLabel;
  const isBusy = createBooking.isPending || paymentState === 'paying' || paymentState === 'polling';
  const currentStepIndex = stepIndex(step);
  const isLastStep = step === 'visit';
  const keyboardBottomOffset = DEFAULT_FORM_FOOTER_OFFSET + Math.max(insets.bottom, 12);

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
            <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View className="rounded-full bg-white/20 px-3 py-1">
            <Text className="text-[12px] font-semibold text-white">
              {t('expertVisit.stepOf')
                .replace('{{current}}', String(currentStepIndex))
                .replace('{{total}}', String(STEPS.length))}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <AppIcon name="account-tie-outline" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('expertVisit.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {catalogLoading
                ? '…'
                : expertVisitService?.priceLabel ?? t('expertVisit.subtitle')}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-[14px] text-white/85">
          {step === 'field' ? t('expertVisit.stepHints.field') : t('expertVisit.stepHints.visit')}
        </Text>

        <View className="mt-5">
          <StepIndicator steps={stepLabels} currentStep={currentStepIndex} />
        </View>
      </LinearGradient>

      <KeyboardAwareFormShell
        contentClassName="px-5 pb-6 pt-5"
        bottomOffset={keyboardBottomOffset}
        footer={
          <View
            className="border-t border-border bg-background px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            {isLastStep ? (
              <Button size="lg" className="w-full" loading={isBusy} onPress={handleSubmit}>
                {paymentState === 'polling'
                  ? t('expertVisit.checkingPayment')
                  : t('expertVisit.submit').replace('{{price}}', totalLabel)}
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
                    {t('expertVisit.back')}
                  </Button>
                ) : null}
                <Button size="lg" className="flex-1" onPress={goNext}>
                  {t('expertVisit.continue')}
                </Button>
              </View>
            )}
          </View>
        }
      >
          {submitError ? (
            <View className="mb-4">
              <ErrorBanner message={submitError} />
            </View>
          ) : null}

          {completedOrderId ? (
            <View className="mb-4 rounded-2xl border border-india-green/30 bg-india-green/5 px-4 py-3">
              <Text className="text-[14px] font-semibold text-india-green">
                {t('expertVisit.orderRef').replace('{{orderId}}', completedOrderId)}
              </Text>
            </View>
          ) : null}

          {step === 'field' ? (
            <View className="gap-5">
              <ParcelPicker
                label={t('expertVisit.fieldLabel')}
                hint={t('expertVisit.fieldHint')}
                parcels={parcels}
                selectedId={selectedParcelId}
                onSelect={handleParcelSelect}
                onAddField={() => router.push('/farmer/land-boundary')}
                error={parcelError}
                addFieldLabel={t('expertVisit.addField')}
              />

              {selectedParcel ? (
                <Input
                  label={t('expertVisit.areaAc')}
                  value={form.areaAc}
                  onChangeText={(value) => updateForm('areaAc', value)}
                  keyboardType="decimal-pad"
                  placeholder="4.5"
                  error={formErrors.areaAc}
                  icon="resize-outline"
                  hint={t('expertVisit.areaAcHint').replace(
                    '{{acres}}',
                    formatAcres(selectedParcel.areaAcres),
                  )}
                />
              ) : null}

              {priceEstimate ? (
                <PriceEstimateCard
                  title={t('expertVisit.priceEstimate')}
                  totalLabel={totalLabel}
                  baseLabel={baseLabel}
                  transportNote={
                    transportLabel
                      ? t('expertVisit.transportFee').replace('{{fee}}', transportLabel)
                      : undefined
                  }
                />
              ) : null}
            </View>
          ) : null}

          {step === 'visit' ? (
            <View className="gap-5">
              <VisitPurposePicker
                label={t('expertVisit.visitPurpose')}
                value={form.visitPurpose}
                onChange={(value) => updateForm('visitPurpose', value)}
                getLabel={getVisitPurposeLabel}
                error={formErrors.visitPurpose}
              />

              <CropTypeChips
                label={t('expertVisit.cropType')}
                value={form.cropType}
                onChange={(value) => updateForm('cropType', value)}
                error={formErrors.cropType}
              />

              <SoilTypeChips
                label={t('expertVisit.soilType')}
                value={form.soilType}
                onChange={(value) => updateForm('soilType', value)}
                error={formErrors.soilType}
              />

              <DateField
                label={t('expertVisit.preferredDate')}
                value={form.preferredDate}
                onChange={(value) => updateForm('preferredDate', value)}
                minimumDate={new Date()}
                error={formErrors.preferredDate}
              />

              <Input
                label={t('expertVisit.notes')}
                value={form.query}
                onChangeText={(value) => updateForm('query', value)}
                placeholder={t('expertVisit.notesPlaceholder')}
                multiline
                numberOfLines={3}
                icon="chatbox-ellipses-outline"
                hint={t('expertVisit.notesHint')}
              />

              {selectedParcel ? (
                <View className="overflow-hidden rounded-2xl border border-india-green/20 bg-surface">
                  <LinearGradient
                    colors={['rgba(26, 54, 93, 0.06)', 'rgba(70, 150, 47, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="px-4 py-4"
                  >
                    <Text className="text-[12px] font-medium uppercase tracking-wide text-muted">
                      {t('expertVisit.reviewTitle')}
                    </Text>
                    <View className="mt-3 gap-2">
                      <ReviewLine
                        icon="map-outline"
                        label={t('expertVisit.fieldLabel')}
                        value={`${selectedParcel.name} · ${form.areaAc} ac`}
                      />
                      <ReviewLine
                        icon="clipboard-outline"
                        label={t('expertVisit.visitPurpose')}
                        value={getVisitPurposeLabel(form.visitPurpose)}
                      />
                      <ReviewLine
                        icon="calendar-outline"
                        label={t('expertVisit.preferredDate')}
                        value={form.preferredDate}
                      />
                    </View>

                    <View className="mt-4 flex-row items-center justify-between border-t border-border pt-4">
                      <View>
                        <Text className="text-[12px] text-muted">{t('expertVisit.totalPayable')}</Text>
                        <Text className="mt-1 text-[26px] font-bold text-india-green">{totalLabel}</Text>
                        {transportLabel ? (
                          <Text className="mt-0.5 text-[11px] text-muted">
                            {t('expertVisit.includesTransport').replace('{{fee}}', transportLabel)}
                          </Text>
                        ) : null}
                      </View>
                      <View className="flex-row items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
                        <AppIcon name="shield-check-outline" size={14} color={Palette.indiaGreen} />
                        <Text className="text-[11px] font-semibold text-india-green">
                          {t('expertVisit.verifiedExpert')}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ) : null}
            </View>
          ) : null}
      </KeyboardAwareFormShell>
    </View>
  );
}

function PriceEstimateCard({
  title,
  totalLabel,
  baseLabel,
  transportNote,
}: {
  title: string;
  totalLabel: string;
  baseLabel: string;
  transportNote?: string;
}) {
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-white">
      <View className="h-[3px] overflow-hidden">
        <LinearGradient
          colors={[Palette.indigo, Palette.indiaGreen]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>
      <View className="gap-2 p-4">
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">{title}</Text>
        <Text className="text-[24px] font-bold text-indigo">{totalLabel}</Text>
        <Text className="text-[13px] text-muted">
          {baseLabel} {transportNote ? `+ ${transportNote}` : ''}
        </Text>
      </View>
    </View>
  );
}

function ReviewLine({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
        <AppIcon name={resolveAppIcon(icon)} size={15} color={Palette.indigo} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] text-muted">{label}</Text>
        <Text className="text-[14px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}
