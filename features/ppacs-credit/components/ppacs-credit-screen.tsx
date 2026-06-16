import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { OptionPicker } from '@/features/crop-calendar/components/option-picker';
import { StepIndicator } from '@/features/crop-calendar/components/step-indicator';
import {
  getBookingError,
  useCreatePpacsCreditBooking,
} from '@/features/ppacs-credit/hooks/use-ppacs-credit-booking';
import {
  buildDefaultPpacsCreditForm,
  toPpacsCreditDetails,
  validatePpacsCreditForm,
  type PpacsCreditFormValues,
} from '@/features/ppacs-credit/utils/validate-form';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCreditPurpose } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { useAuthStore } from '@/stores/auth.store';
import { CREDIT_PURPOSES, type CreditPurpose } from '@/types/booking';
import type { CatalogService } from '@/types/catalog';

const STEPS = ['loan', 'review'] as const;
type WizardStep = (typeof STEPS)[number];

const TENURE_PRESETS_MONTHS = ['3', '6', '12', '18', '24'] as const;
const INTEREST_PRESETS = ['10', '12', '15', '18'] as const;

function findPpacsCreditService(services?: CatalogService[]): CatalogService | undefined {
  return services?.find((service) => service.iconType === 'PPACS_CREDIT');
}

function stepIndex(step: WizardStep): number {
  return STEPS.indexOf(step) + 1;
}

export function PpacsCreditScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: catalogServices, isLoading: catalogLoading } = useCatalog();
  const createBooking = useCreatePpacsCreditBooking();

  const [step, setStep] = useState<WizardStep>('loan');
  const [form, setForm] = useState<PpacsCreditFormValues>(() => buildDefaultPpacsCreditForm());
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validatePpacsCreditForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const ppacsService = useMemo(
    () => findPpacsCreditService(catalogServices),
    [catalogServices],
  );

  const stepLabels = useMemo(
    () => [t('ppacsCredit.steps.loan'), t('ppacsCredit.steps.review')],
    [t],
  );

  const loanAmountLabel = useMemo(() => {
    const paise = Math.round(Number.parseFloat(form.loanAmountRupee.replace(/,/g, '') || '0') * 100);
    if (!Number.isFinite(paise) || paise <= 0) return null;
    return formatPaise(paise);
  }, [form.loanAmountRupee]);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  function getPurposeLabel(purpose: CreditPurpose): string {
    return translateCreditPurpose(t, purpose);
  }

  function updateForm<K extends keyof PpacsCreditFormValues>(
    key: K,
    value: PpacsCreditFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  }

  function validateLoanStep(): boolean {
    const errors = validatePpacsCreditForm(form, t);
    const loanKeys = ['loanAmountRupee', 'tenureMonths', 'maxInterestPa', 'purpose'] as const;
    const stepErrors = Object.fromEntries(
      loanKeys.filter((key) => errors[key]).map((key) => [key, errors[key]]),
    );
    setFormErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function validateCurrentStep(): boolean {
    if (step === 'loan') {
      return validateLoanStep();
    }

    const errors = validatePpacsCreditForm(form, t);
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
    if (!validateLoanStep()) {
      setStep('loan');
      return;
    }

    const errors = validatePpacsCreditForm(form, t);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitError(null);
    setSubmitState('submitting');

    try {
      const details = toPpacsCreditDetails(form);
      const booking = await createBooking.mutateAsync({
        serviceIconType: 'PPACS_CREDIT',
        details,
        query: form.query.trim() || undefined,
      });

      setSubmitState('done');
      setCompletedOrderId(booking.orderId);
    } catch (error) {
      setSubmitState('idle');
      setSubmitError(getBookingError(error, t('ppacsCredit.submitError')));
    }
  }

  const isBusy = createBooking.isPending || submitState === 'submitting';
  const currentStepIndex = stepIndex(step);
  const isLastStep = step === 'review';
  const showSuccess = submitState === 'done' && completedOrderId;

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
          {!showSuccess ? (
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[12px] font-semibold text-white">
                {t('ppacsCredit.stepOf')
                  .replace('{{current}}', String(currentStepIndex))
                  .replace('{{total}}', String(STEPS.length))}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Ionicons name="cash-outline" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('ppacsCredit.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {catalogLoading
                ? '…'
                : ppacsService?.description ?? t('ppacsCredit.subtitle')}
            </Text>
          </View>
        </View>

        {!showSuccess ? (
          <>
            <Text className="mt-3 text-[14px] text-white/85">
              {step === 'loan' ? t('ppacsCredit.stepHints.loan') : t('ppacsCredit.stepHints.review')}
            </Text>
            <View className="mt-5">
              <StepIndicator steps={stepLabels} currentStep={currentStepIndex} />
            </View>
          </>
        ) : null}
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

          {showSuccess ? (
            <SuccessView orderId={completedOrderId} t={t} />
          ) : (
            <>
              <InfoBanner message={t('ppacsCredit.inquiryNotice')} />

              {step === 'loan' ? (
                <View className="mt-5 gap-5">
                  <Input
                    label={t('ppacsCredit.loanAmount')}
                    value={form.loanAmountRupee}
                    onChangeText={(value) => updateForm('loanAmountRupee', value)}
                    keyboardType="number-pad"
                    placeholder="50000"
                    error={formErrors.loanAmountRupee}
                    icon="wallet-outline"
                    hint={t('ppacsCredit.loanAmountHint')}
                  />

                  {loanAmountLabel ? (
                    <Text className="-mt-3 px-1 text-[13px] font-medium text-india-green">
                      {t('ppacsCredit.loanAmountPreview').replace('{{amount}}', loanAmountLabel)}
                    </Text>
                  ) : null}

                  <View className="gap-2">
                    <Input
                      label={t('ppacsCredit.tenureMonths')}
                      value={form.tenureMonths}
                      onChangeText={(value) => updateForm('tenureMonths', value)}
                      keyboardType="number-pad"
                      placeholder="12"
                      error={formErrors.tenureMonths}
                      icon="time-outline"
                      hint={t('ppacsCredit.tenureHint')}
                    />
                    <PresetChips
                      values={TENURE_PRESETS_MONTHS}
                      selected={form.tenureMonths}
                      onSelect={(value) => updateForm('tenureMonths', value)}
                      suffix={t('ppacsCredit.monthsShort')}
                    />
                  </View>

                  <View className="gap-2">
                    <Input
                      label={t('ppacsCredit.maxInterest')}
                      value={form.maxInterestPa}
                      onChangeText={(value) => updateForm('maxInterestPa', value)}
                      keyboardType="decimal-pad"
                      placeholder="12"
                      error={formErrors.maxInterestPa}
                      icon="trending-down-outline"
                      hint={t('ppacsCredit.maxInterestHint')}
                    />
                    <PresetChips
                      values={INTEREST_PRESETS}
                      selected={form.maxInterestPa}
                      onSelect={(value) => updateForm('maxInterestPa', value)}
                      suffix="%"
                    />
                  </View>

                  <OptionPicker
                    label={t('ppacsCredit.purpose')}
                    value={form.purpose}
                    options={CREDIT_PURPOSES}
                    onChange={(value) => updateForm('purpose', value)}
                    getLabel={getPurposeLabel}
                    error={formErrors.purpose}
                  />
                </View>
              ) : null}

              {step === 'review' ? (
                <View className="mt-5 gap-5">
                  <Input
                    label={t('ppacsCredit.commodity')}
                    value={form.commodity}
                    onChangeText={(value) => updateForm('commodity', value)}
                    placeholder={t('ppacsCredit.commodityPlaceholder')}
                    error={formErrors.commodity}
                    icon="leaf-outline"
                    hint={t('ppacsCredit.commodityHint')}
                  />

                  <Input
                    label={t('ppacsCredit.quantityKg')}
                    value={form.quantityKg}
                    onChangeText={(value) => updateForm('quantityKg', value)}
                    keyboardType="decimal-pad"
                    placeholder="500"
                    error={formErrors.quantityKg}
                    icon="scale-outline"
                  />

                  <Input
                    label={t('ppacsCredit.grade')}
                    value={form.grade}
                    onChangeText={(value) => updateForm('grade', value)}
                    placeholder={t('ppacsCredit.gradePlaceholder')}
                    error={formErrors.grade}
                    icon="ribbon-outline"
                  />

                  <Input
                    label={t('ppacsCredit.notes')}
                    value={form.query}
                    onChangeText={(value) => updateForm('query', value)}
                    placeholder={t('ppacsCredit.notesPlaceholder')}
                    multiline
                    numberOfLines={3}
                    icon="chatbox-ellipses-outline"
                    hint={t('ppacsCredit.notesHint')}
                  />

                  <ReviewSummary form={form} getPurposeLabel={getPurposeLabel} t={t} />
                  <NextStepsCard t={t} />
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        <View
          className="border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {showSuccess ? (
            <Button size="lg" className="w-full" onPress={() => router.back()}>
              {t('ppacsCredit.done')}
            </Button>
          ) : isLastStep ? (
            <Button size="lg" className="w-full" loading={isBusy} onPress={handleSubmit}>
              {t('ppacsCredit.submit')}
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
                  {t('ppacsCredit.back')}
                </Button>
              ) : null}
              <Button size="lg" className="flex-1" onPress={goNext}>
                {t('ppacsCredit.continue')}
              </Button>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <View className="flex-row gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 px-4 py-3">
      <Ionicons name="information-circle-outline" size={20} color={Palette.saffron} />
      <Text className="flex-1 text-[13px] leading-5 text-indigo">{message}</Text>
    </View>
  );
}

function PresetChips({
  values,
  selected,
  onSelect,
  suffix,
}: {
  values: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  suffix: string;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 px-1">
      {values.map((value) => {
        const active = selected === value;
        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            className={`rounded-full border px-3 py-1.5 ${
              active ? 'border-india-green bg-india-green/10' : 'border-border bg-white'
            }`}
          >
            <Text
              className={`text-[13px] font-medium ${active ? 'text-india-green' : 'text-indigo'}`}
            >
              {value}
              {suffix}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ReviewSummary({
  form,
  getPurposeLabel,
  t,
}: {
  form: PpacsCreditFormValues;
  getPurposeLabel: (purpose: CreditPurpose) => string;
  t: (key: string) => string;
}) {
  const loanLabel = formatPaise(toPpacsCreditDetails(form).loanAmountPaise);

  return (
    <View className="overflow-hidden rounded-2xl border border-india-green/20 bg-surface">
      <LinearGradient
        colors={['rgba(70, 150, 47, 0.06)', 'rgba(26, 54, 93, 0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py-4"
      >
        <Text className="text-[12px] font-medium uppercase tracking-wide text-muted">
          {t('ppacsCredit.reviewTitle')}
        </Text>
        <View className="mt-3 gap-2">
          <ReviewLine
            icon="wallet-outline"
            label={t('ppacsCredit.loanAmount')}
            value={loanLabel}
          />
          <ReviewLine
            icon="time-outline"
            label={t('ppacsCredit.tenureMonths')}
            value={t('ppacsCredit.tenureSummary').replace('{{months}}', form.tenureMonths)}
          />
          <ReviewLine
            icon="trending-down-outline"
            label={t('ppacsCredit.maxInterest')}
            value={`${form.maxInterestPa}% ${t('ppacsCredit.perAnnum')}`}
          />
          <ReviewLine
            icon="briefcase-outline"
            label={t('ppacsCredit.purpose')}
            value={getPurposeLabel(form.purpose)}
          />
        </View>

        <View className="mt-4 rounded-xl bg-white/80 px-3 py-3">
          <Text className="text-[12px] leading-5 text-muted">{t('ppacsCredit.reviewDisclaimer')}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function NextStepsCard({ t }: { t: (key: string) => string }) {
  const steps = [
    t('ppacsCredit.nextSteps.received'),
    t('ppacsCredit.nextSteps.review'),
    t('ppacsCredit.nextSteps.callback'),
    t('ppacsCredit.nextSteps.disbursement'),
  ];

  return (
    <View className="rounded-2xl border border-border bg-white p-4">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        {t('ppacsCredit.nextStepsTitle')}
      </Text>
      <View className="mt-3 gap-3">
        {steps.map((label, index) => (
          <View key={label} className="flex-row items-start gap-3">
            <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-india-green/10">
              <Text className="text-[12px] font-bold text-india-green">{index + 1}</Text>
            </View>
            <Text className="flex-1 text-[14px] leading-5 text-indigo">{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SuccessView({ orderId, t }: { orderId: string; t: (key: string) => string }) {
  return (
    <View className="items-center gap-5 pt-4">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-india-green/10">
        <Ionicons name="checkmark-circle" size={52} color={Palette.indiaGreen} />
      </View>

      <View className="items-center gap-2">
        <Text className="text-center text-[22px] font-bold text-indigo">
          {t('ppacsCredit.successTitle')}
        </Text>
        <Text className="text-center text-[15px] leading-6 text-muted">
          {t('ppacsCredit.successBody')}
        </Text>
      </View>

      <View className="w-full rounded-2xl border border-india-green/30 bg-india-green/5 px-4 py-3">
        <Text className="text-center text-[14px] font-semibold text-india-green">
          {t('ppacsCredit.orderRef').replace('{{orderId}}', orderId)}
        </Text>
      </View>

      <NextStepsCard t={t} />

      <View className="w-full rounded-2xl border border-border bg-surface px-4 py-3">
        <Text className="text-[13px] leading-5 text-muted">{t('ppacsCredit.successFootnote')}</Text>
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
        <Ionicons name={icon} size={15} color={Palette.indiaGreen} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] text-muted">{label}</Text>
        <Text className="text-[14px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}
