import { AppIcon } from '@/components/ui/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
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
import { StepIndicator } from '@/features/crop-calendar/components/step-indicator';
import { WarehousePicker } from '@/features/storage/components/warehouse-picker';
import { useCreateStorageRequest } from '@/features/storage/hooks/use-storage-request';
import { useWarehouses } from '@/features/storage/hooks/use-warehouses';
import {
  buildDefaultStorageForm,
  getStorageError,
  parseQuantityKg,
  validateStorageForm,
  type StorageFormValues,
} from '@/features/storage/utils/validate-form';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCropType } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { computePerKgPricing } from '@/lib/pricing';
import { useAuthStore } from '@/stores/auth.store';
import type { CropType } from '@/types/booking';
import type { CatalogService } from '@/types/catalog';

const STEPS = ['warehouse', 'storage', 'review'] as const;
type WizardStep = (typeof STEPS)[number];

function findStorageService(services?: CatalogService[]): CatalogService | undefined {
  return services?.find((service) => service.iconType === 'STORAGE');
}

function stepIndex(step: WizardStep): number {
  return STEPS.indexOf(step) + 1;
}

export function StorageScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: catalogServices, isLoading: catalogLoading } = useCatalog();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const createRequest = useCreateStorageRequest();

  const [step, setStep] = useState<WizardStep>('warehouse');
  const [form, setForm] = useState<StorageFormValues>(() => buildDefaultStorageForm());
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validateStorageForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'paying' | 'done'>('idle');
  const [completedRequestNumber, setCompletedRequestNumber] = useState<string | null>(null);

  const storageService = useMemo(
    () => findStorageService(catalogServices),
    [catalogServices],
  );

  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse) => warehouse.id === selectedWarehouseId),
    [warehouses, selectedWarehouseId],
  );

  const stepLabels = useMemo(
    () => [
      t('storage.steps.warehouse'),
      t('storage.steps.storage'),
      t('storage.steps.review'),
    ],
    [t],
  );

  const quantityKg = parseQuantityKg(form.quantityKg);
  const storageFeeEstimate = useMemo(() => {
    if (!storageService || !Number.isFinite(quantityKg) || quantityKg <= 0) return null;
    return computePerKgPricing(quantityKg, storageService.basePricePaise);
  }, [quantityKg, storageService]);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  function updateForm<K extends keyof StorageFormValues>(key: K, value: StorageFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  function validateWarehouseStep(): boolean {
    const errors = validateStorageForm(form, t, selectedWarehouseId);
    const stepErrors = errors.warehouseId ? { warehouseId: errors.warehouseId } : {};
    setFormErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function validateStorageStep(): boolean {
    const errors = validateStorageForm(form, t, selectedWarehouseId);
    const stepKeys = ['cropType', 'quantityKg'] as const;
    const stepErrors = Object.fromEntries(
      stepKeys.filter((key) => errors[key]).map((key) => [key, errors[key]]),
    );
    setFormErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function validateCurrentStep(): boolean {
    if (step === 'warehouse') return validateWarehouseStep();
    if (step === 'storage') return validateStorageStep();
    return validateStorageStep();
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    const index = STEPS.indexOf(step);
    if (index < STEPS.length - 1) {
      setStep(STEPS[index + 1]);
    }
  }

  function goBack() {
    if (submitState === 'done') {
      router.back();
      return;
    }

    const index = STEPS.indexOf(step);
    if (index > 0) {
      setStep(STEPS[index - 1]);
      return;
    }
    router.back();
  }

  async function handleSubmit() {
    if (!validateStorageStep()) {
      setStep('storage');
      return;
    }

    if (!selectedWarehouseId || !form.cropType) return;

    setSubmitError(null);
    setSubmitState('submitting');

    try {
      const request = await createRequest.mutateAsync({
        warehouseId: selectedWarehouseId,
        details: {
          cropType: form.cropType,
          quantityKg,
        },
        query: form.query.trim() || undefined,
      });

      if (request.paymentUrl) {
        setSubmitState('paying');
        router.replace({
          pathname: '/payment/checkout',
          params: {
            storageRequestId: request.id,
            orderId: request.orderId ?? request.requestNumber,
          },
        });
        return;
      }

      setSubmitState('done');
      setCompletedRequestNumber(request.requestNumber);
    } catch (error) {
      setSubmitState('idle');
      setSubmitError(getStorageError(error, t('storage.submitError')));
    }
  }

  const isBusy =
    createRequest.isPending || submitState === 'submitting' || submitState === 'paying';
  const currentStepIndex = stepIndex(step);
  const isLastStep = step === 'review';
  const showSuccess = submitState === 'done' && completedRequestNumber;
  const keyboardBottomOffset = DEFAULT_FORM_FOOTER_OFFSET + insets.bottom + 12;

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
          {!showSuccess ? (
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[12px] font-semibold text-white">
                {t('storage.stepOf')
                  .replace('{{current}}', String(currentStepIndex))
                  .replace('{{total}}', String(STEPS.length))}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <AppIcon name="warehouse" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('storage.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {catalogLoading
                ? '…'
                : storageService?.description ?? t('storage.subtitle')}
            </Text>
          </View>
        </View>

        {!showSuccess ? (
          <>
            <Text className="mt-3 text-[14px] text-white/85">
              {step === 'warehouse'
                ? t('storage.stepHints.warehouse')
                : step === 'storage'
                  ? t('storage.stepHints.storage')
                  : t('storage.stepHints.review')}
            </Text>
            <View className="mt-5">
              <StepIndicator steps={stepLabels} currentStep={currentStepIndex} />
            </View>
          </>
        ) : null}
      </LinearGradient>

      <KeyboardAwareFormShell
        contentClassName="px-5 pb-6 pt-5"
        bottomOffset={keyboardBottomOffset}
        footer={
          !showSuccess ? (
            <View
              className="border-t border-border bg-white px-5 pt-4"
              style={{ paddingBottom: insets.bottom + 12 }}
            >
              {isLastStep ? (
                <Button onPress={handleSubmit} disabled={isBusy}>
                  {isBusy
                    ? submitState === 'paying'
                      ? t('storage.paying')
                      : t('storage.submitting')
                    : t('storage.submit')}
                </Button>
              ) : (
                <Button onPress={goNext}>{t('storage.continue')}</Button>
              )}
            </View>
          ) : null
        }
      >
          {submitError ? (
            <View className="mb-4">
              <ErrorBanner message={submitError} />
            </View>
          ) : null}

          {showSuccess ? (
            <View className="gap-5">
              <View className="items-center rounded-2xl border border-border bg-white px-5 py-8">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-india-green/10">
                  <AppIcon name="check-circle" size={40} color={Palette.indiaGreen} />
                </View>
                <Text className="text-center text-[20px] font-bold text-indigo">
                  {t('storage.successTitle')}
                </Text>
                <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
                  {t('storage.successBody')}
                </Text>
                <Text className="mt-4 text-[13px] font-semibold text-india-green">
                  {t('storage.requestRef', { requestNumber: completedRequestNumber })}
                </Text>
              </View>

              <View className="rounded-2xl border border-border bg-surface px-4 py-4">
                <Text className="text-[14px] font-bold text-indigo">{t('storage.nextStepsTitle')}</Text>
                <View className="mt-3 gap-2">
                  {(['submitted', 'pickup', 'payout', 'receipt', 'tracker'] as const).map((key) => (
                    <View key={key} className="flex-row items-start gap-2">
                      <View className="mt-1.5 h-2 w-2 rounded-full bg-india-green" />
                      <Text className="flex-1 text-[13px] leading-5 text-muted">
                        {t(`storage.nextSteps.${key}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Button onPress={() => router.replace('/services/crop-tracker')}>
                {t('storage.openTracker')}
              </Button>
              <Button variant="secondary" onPress={() => router.back()}>
                {t('storage.done')}
              </Button>
            </View>
          ) : step === 'warehouse' ? (
            <View className="gap-5">
              <View className="rounded-2xl border border-border bg-surface px-4 py-4">
                <Text className="text-[13px] leading-5 text-muted">{t('storage.payoutNotice')}</Text>
              </View>
              <WarehousePicker
                label={t('storage.warehouseLabel')}
                hint={t('storage.warehouseHint')}
                emptyMessage={t('storage.noWarehousesEmpty')}
                warehouses={warehouses}
                selectedId={selectedWarehouseId}
                onSelect={(warehouseId) => {
                  setSelectedWarehouseId(warehouseId);
                  setFormErrors((current) => ({ ...current, warehouseId: undefined }));
                }}
                loading={warehousesLoading}
                error={formErrors.warehouseId}
              />
            </View>
          ) : step === 'storage' ? (
            <View className="gap-5">
              <CropTypeChips
                label={t('storage.cropType')}
                value={form.cropType as CropType}
                onChange={(cropType) => updateForm('cropType', cropType)}
                error={formErrors.cropType}
              />

              <Input
                label={t('storage.quantityKg')}
                value={form.quantityKg}
                onChangeText={(value) => updateForm('quantityKg', value)}
                keyboardType="numeric"
                placeholder="500"
                hint={t('storage.quantityKgHint')}
                error={formErrors.quantityKg}
              />

              {storageFeeEstimate ? (
                <View className="rounded-2xl border border-dashed border-india-green/40 bg-surface px-4 py-3">
                  <Text className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                    {t('storage.storageFeeEstimate')}
                  </Text>
                  <Text className="mt-1 text-[18px] font-bold text-india-green">
                    {formatPaise(storageFeeEstimate.totalPaise)}
                  </Text>
                  <Text className="mt-1 text-[12px] text-muted">
                    {t('storage.storageFeePerKg', { kg: storageFeeEstimate.areaUnits })}
                  </Text>
                </View>
              ) : null}

              <Input
                label={t('storage.notes')}
                value={form.query}
                onChangeText={(value) => updateForm('query', value)}
                placeholder={t('storage.notesPlaceholder')}
                hint={t('storage.notesHint')}
                multiline
              />
            </View>
          ) : (
            <View className="gap-4">
              <Text className="text-[16px] font-bold text-indigo">{t('storage.reviewTitle')}</Text>

              <View className="gap-3 rounded-2xl border border-border bg-white p-4">
                <ReviewRow label={t('storage.warehouseLabel')} value={selectedWarehouse?.name ?? '—'} />
                <ReviewRow
                  label={t('storage.cropType')}
                  value={form.cropType ? translateCropType(t, form.cropType) : '—'}
                />
                <ReviewRow
                  label={t('storage.quantityKg')}
                  value={Number.isFinite(quantityKg) ? `${quantityKg.toLocaleString('en-IN')} kg` : '—'}
                />
                {form.query.trim() ? (
                  <ReviewRow label={t('storage.notes')} value={form.query.trim()} />
                ) : null}
                {storageFeeEstimate ? (
                  <ReviewRow
                    label={t('storage.storageFeeEstimate')}
                    value={formatPaise(storageFeeEstimate.totalPaise)}
                    highlight
                  />
                ) : null}
              </View>

              <View className="rounded-2xl border border-border bg-surface px-4 py-4">
                <Text className="text-[13px] leading-5 text-muted">{t('storage.reviewDisclaimer')}</Text>
              </View>
            </View>
          )}
      </KeyboardAwareFormShell>
    </View>
  );
}

function ReviewRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <Text className="flex-1 text-[13px] text-muted">{label}</Text>
      <Text
        className={`max-w-[55%] text-right text-[13px] font-semibold ${
          highlight ? 'text-india-green' : 'text-indigo'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
