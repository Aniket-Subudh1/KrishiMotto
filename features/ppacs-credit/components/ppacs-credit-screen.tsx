import { AppIcon } from '@/components/ui/app-icon';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_FORM_FOOTER_OFFSET,
  KeyboardAwareFormShell,
} from '@/components/ui/keyboard-aware-form-shell';
import { Text } from '@/components/ui/text';
import { OptionPicker } from '@/features/crop-calendar/components/option-picker';
import { StepIndicator } from '@/features/crop-calendar/components/step-indicator';
import { LenderPicker } from '@/features/ppacs-credit/components/lender-picker';
import { SmartContractPicker } from '@/features/ppacs-credit/components/smart-contract-picker';
import {
  getCreditError,
  useApplyAgriCredit,
  useFarmerKyc,
  useFarmerSmartContracts,
  usePublicLenders,
  useSubmitFarmerKyc,
} from '@/features/ppacs-credit/hooks/use-ppacs-credit';
import { getLoanTrackRoute } from '@/features/ppacs-credit/utils/loan-display';
import {
  buildDefaultPpacsCreditForm,
  parseLoanAmountRupees,
  toApplyAgriCreditPayload,
  toKycPayload,
  validateBankStep,
  validateKycStep,
  validateLenderStep,
  validatePpacsCreditForm,
  validateReceiptStep,
  validateTermsStep,
  type PpacsCreditFormValues,
} from '@/features/ppacs-credit/utils/validate-form';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useQueryFocusRefresh } from '@/hooks/use-query-focus-refresh';
import { translateCreditPurpose, translateServiceDescription } from '@/lib/booking-i18n';
import { invalidateFarmerServiceQueries } from '@/lib/query-cache-sync';
import { formatPaise } from '@/lib/currency';
import { useAuthStore } from '@/stores/auth.store';
import { CREDIT_PURPOSES, type CreditPurpose } from '@/types/booking';
import type { CatalogService } from '@/types/catalog';
import type { FarmerSmartContract, Lender } from '@/types/credit';

const BASE_STEPS = ['receipt', 'lender', 'terms', 'bank', 'review'] as const;
const KYC_STEP = 'kyc' as const;
type WizardStep = typeof KYC_STEP | (typeof BASE_STEPS)[number];

const TENURE_PRESETS_MONTHS = ['3', '6', '12', '18', '24'] as const;
const INTEREST_PRESETS = ['10', '12', '15', '18'] as const;

function findPpacsCreditService(services?: CatalogService[]): CatalogService | undefined {
  return services?.find((service) => service.iconType === 'PPACS_CREDIT');
}

function eligibleContracts(contracts: FarmerSmartContract[]): FarmerSmartContract[] {
  return contracts.filter(
    (contract) =>
      contract.freeQuantityKg > 0 &&
      contract.status !== 'FULLY_PLEDGED' &&
      contract.status !== 'RELEASED',
  );
}

export function PpacsCreditScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const refreshCreditData = useCallback(
    () => invalidateFarmerServiceQueries(queryClient),
    [queryClient],
  );

  useQueryFocusRefresh(refreshCreditData, user?.role === 'FARMER');
  const { data: catalogServices, isLoading: catalogLoading } = useCatalog();
  const { data: kyc, isLoading: kycLoading } = useFarmerKyc();
  const { data: smartContracts = [], isLoading: contractsLoading } = useFarmerSmartContracts({
    poll: true,
  });
  const { data: lenders = [], isLoading: lendersLoading } = usePublicLenders();
  const submitKyc = useSubmitFarmerKyc();
  const applyCredit = useApplyAgriCredit();

  const kycVerified = kyc?.status === 'VERIFIED';
  const steps = useMemo(
    () => (kycVerified ? [...BASE_STEPS] : [KYC_STEP, ...BASE_STEPS]),
    [kycVerified],
  );

  const [step, setStep] = useState<WizardStep>(kycVerified ? 'receipt' : 'kyc');
  const [form, setForm] = useState<PpacsCreditFormValues>(() =>
    buildDefaultPpacsCreditForm(user?.username ?? ''),
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PpacsCreditFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [completedLoanId, setCompletedLoanId] = useState<string | null>(null);
  const [completedLoanNumber, setCompletedLoanNumber] = useState<string | null>(null);

  const availableContracts = useMemo(
    () => eligibleContracts(smartContracts),
    [smartContracts],
  );

  const selectedContract = useMemo(
    () => availableContracts.find((contract) => contract.id === form.smartContractId),
    [availableContracts, form.smartContractId],
  );

  const selectedLender = useMemo(
    () => lenders.find((lender) => lender.id === form.lenderId),
    [form.lenderId, lenders],
  );

  const ppacsService = useMemo(
    () => findPpacsCreditService(catalogServices),
    [catalogServices],
  );

  const stepLabels = useMemo(
    () =>
      steps.map((wizardStep) => t(`ppacsCredit.steps.${wizardStep}`)),
    [steps, t],
  );

  useEffect(() => {
    if (!kycLoading && kycVerified && step === 'kyc') {
      setStep('receipt');
    }
  }, [kycLoading, kycVerified, step]);

  useEffect(() => {
    if (user?.username && !form.fullName) {
      setForm((current) => ({
        ...current,
        fullName: user.username ?? current.fullName,
        accountHolder: current.accountHolder || user.username || '',
      }));
    }
  }, [form.fullName, form.accountHolder, user?.username]);

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

  function validateCurrentStep(): boolean {
    let errors: Partial<Record<keyof PpacsCreditFormValues, string>> = {};

    if (step === 'kyc') {
      errors = validateKycStep(form, t);
    } else if (step === 'receipt') {
      errors = validateReceiptStep(form, selectedContract?.freeQuantityKg ?? null, t);
    } else if (step === 'lender') {
      errors = validateLenderStep(form, t);
    } else if (step === 'terms') {
      errors = validateTermsStep(form, t);
    } else if (step === 'bank') {
      errors = validateBankStep(form, t);
    } else {
      errors = validatePpacsCreditForm(
        form,
        selectedContract?.freeQuantityKg ?? null,
        t,
        { skipKyc: kycVerified },
      );
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleKycSubmit() {
    if (!validateCurrentStep()) return;

    setSubmitError(null);
    try {
      await submitKyc.mutateAsync(toKycPayload(form));
      setStep('receipt');
    } catch (error) {
      setSubmitError(getCreditError(error, t('ppacsCredit.kycSubmitError')));
    }
  }

  function goNext() {
    if (step === 'kyc') {
      void handleKycSubmit();
      return;
    }

    if (!validateCurrentStep()) return;
    const index = steps.indexOf(step);
    if (index < steps.length - 1) {
      setStep(steps[index + 1]);
    }
  }

  function goBack() {
    if (submitState === 'done') {
      router.back();
      return;
    }

    const index = steps.indexOf(step);
    if (index > 0) {
      setStep(steps[index - 1]);
      return;
    }
    router.back();
  }

  async function handleSubmit() {
    const errors = validatePpacsCreditForm(
      form,
      selectedContract?.freeQuantityKg ?? null,
      t,
      { skipKyc: kycVerified },
    );
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (errors.aadhaarNumber || errors.fullName) setStep('kyc');
      else if (errors.smartContractId || errors.collateralQuantityKg) setStep('receipt');
      else if (errors.lenderId) setStep('lender');
      else if (errors.loanAmountRupee || errors.tenureMonths || errors.maxInterestPa || errors.purpose) {
        setStep('terms');
      } else setStep('bank');
      return;
    }

    setSubmitError(null);
    setSubmitState('submitting');

    try {
      const loan = await applyCredit.mutateAsync(toApplyAgriCreditPayload(form));
      setSubmitState('done');
      setCompletedLoanId(loan.id);
      setCompletedLoanNumber(loan.loanNumber);
    } catch (error) {
      setSubmitState('idle');
      setSubmitError(getCreditError(error, t('ppacsCredit.submitError')));
    }
  }

  const isBusy =
    submitKyc.isPending || applyCredit.isPending || submitState === 'submitting' || kycLoading;
  const currentStepIndex = steps.indexOf(step) + 1;
  const isLastStep = step === 'review';
  const showSuccess = submitState === 'done' && completedLoanId;
  const keyboardBottomOffset = DEFAULT_FORM_FOOTER_OFFSET + Math.max(insets.bottom, 12);
  const loanAmountLabel = useMemo(() => {
    const rupees = parseLoanAmountRupees(form.loanAmountRupee);
    if (!Number.isFinite(rupees) || rupees <= 0) return null;
    return formatPaise(Math.round(rupees * 100));
  }, [form.loanAmountRupee]);

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
                {t('ppacsCredit.stepOf')
                  .replace('{{current}}', String(currentStepIndex))
                  .replace('{{total}}', String(steps.length))}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <AppIcon name="bank-outline" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('ppacsCredit.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {catalogLoading
                ? '…'
                : translateServiceDescription(
                    t,
                    'PPACS_CREDIT',
                    ppacsService?.description ?? t('ppacsCredit.subtitle'),
                  )}
            </Text>
          </View>
        </View>

        {!showSuccess ? (
          <>
            <Text className="mt-3 text-[14px] text-white/85">
              {t(`ppacsCredit.stepHints.${step}`)}
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
          <View
            className="border-t border-border bg-background px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            {showSuccess ? (
              <View className="gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onPress={() => router.push(getLoanTrackRoute(completedLoanId!))}
                >
                  {t('ppacsCredit.trackApplication')}
                </Button>
                <Button size="lg" variant="secondary" className="w-full" onPress={() => router.back()}>
                  {t('ppacsCredit.done')}
                </Button>
              </View>
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
                    onPress={() => setStep(steps[currentStepIndex - 2])}
                  >
                    {t('ppacsCredit.back')}
                  </Button>
                ) : null}
                <Button
                  size="lg"
                  className="flex-1"
                  loading={step === 'kyc' && submitKyc.isPending}
                  onPress={goNext}
                >
                  {t('ppacsCredit.continue')}
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

        {showSuccess ? (
          <SuccessView loanNumber={completedLoanNumber} t={t} />
        ) : (
          <>
            <InfoBanner message={t('ppacsCredit.inquiryNotice')} />

            {step === 'kyc' ? (
              <View className="mt-5 gap-5">
                <Input
                  label={t('ppacsCredit.fullName')}
                  value={form.fullName}
                  onChangeText={(value) => updateForm('fullName', value)}
                  placeholder={t('ppacsCredit.fullNamePlaceholder')}
                  error={formErrors.fullName}
                  icon="account-outline"
                />
                <Input
                  label={t('ppacsCredit.aadhaar')}
                  value={form.aadhaarNumber}
                  onChangeText={(value) => updateForm('aadhaarNumber', value)}
                  placeholder="1234-5678-9012"
                  keyboardType="number-pad"
                  error={formErrors.aadhaarNumber}
                  icon="card-outline"
                  hint={t('ppacsCredit.aadhaarHint')}
                />
                <View className="rounded-2xl border border-india-green/20 bg-india-green/5 px-4 py-3">
                  <Text className="text-[13px] leading-5 text-indigo">
                    {t('ppacsCredit.kycNotice')}
                  </Text>
                </View>
              </View>
            ) : null}

            {step === 'receipt' ? (
              <View className="mt-5 gap-5">
                <SmartContractPicker
                  t={t}
                  label={t('ppacsCredit.smartContract')}
                  hint={t('ppacsCredit.smartContractHint')}
                  emptyMessage={t('ppacsCredit.noSmartContracts')}
                  emptyActionLabel={t('ppacsCredit.openStorage')}
                  onEmptyAction={() => router.push('/services/storage')}
                  contracts={availableContracts}
                  selectedId={form.smartContractId || null}
                  onSelect={(id) => updateForm('smartContractId', id)}
                  loading={contractsLoading}
                  error={formErrors.smartContractId}
                />
                <Input
                  label={t('ppacsCredit.collateralQuantityKg')}
                  value={form.collateralQuantityKg}
                  onChangeText={(value) => updateForm('collateralQuantityKg', value)}
                  keyboardType="decimal-pad"
                  placeholder={selectedContract ? String(selectedContract.freeQuantityKg) : '500'}
                  error={formErrors.collateralQuantityKg}
                  icon="scale-outline"
                  hint={
                    selectedContract
                      ? t('ppacsCredit.collateralHint').replace(
                          '{{free}}',
                          String(selectedContract.freeQuantityKg),
                        )
                      : t('ppacsCredit.collateralHintGeneric')
                  }
                />
              </View>
            ) : null}

            {step === 'lender' ? (
              <View className="mt-5">
                <LenderPicker
                  label={t('ppacsCredit.lender')}
                  hint={t('ppacsCredit.lenderHint')}
                  emptyMessage={t('ppacsCredit.noLenders')}
                  lenders={lenders}
                  selectedId={form.lenderId || null}
                  onSelect={(id) => updateForm('lenderId', id)}
                  loading={lendersLoading}
                  error={formErrors.lenderId}
                />
              </View>
            ) : null}

            {step === 'terms' ? (
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

            {step === 'bank' ? (
              <View className="mt-5 gap-5">
                <Input
                  label={t('ppacsCredit.accountHolder')}
                  value={form.accountHolder}
                  onChangeText={(value) => updateForm('accountHolder', value)}
                  error={formErrors.accountHolder}
                  icon="account-outline"
                />
                <Input
                  label={t('ppacsCredit.accountNumber')}
                  value={form.accountNumber}
                  onChangeText={(value) => updateForm('accountNumber', value)}
                  keyboardType="number-pad"
                  error={formErrors.accountNumber}
                  icon="credit-card-outline"
                />
                <Input
                  label={t('ppacsCredit.ifsc')}
                  value={form.ifsc}
                  onChangeText={(value) => updateForm('ifsc', value.toUpperCase())}
                  autoCapitalize="characters"
                  error={formErrors.ifsc}
                  icon="bank-outline"
                  placeholder="HDFC0001234"
                />
                <Input
                  label={t('ppacsCredit.bankName')}
                  value={form.bankName}
                  onChangeText={(value) => updateForm('bankName', value)}
                  error={formErrors.bankName}
                  icon="bank-outline"
                />
              </View>
            ) : null}

            {step === 'review' ? (
              <View className="mt-5 gap-5">
                <ReviewSummary
                  form={form}
                  contract={selectedContract}
                  lender={selectedLender}
                  getPurposeLabel={getPurposeLabel}
                  t={t}
                />
                <NextStepsCard t={t} />
              </View>
            ) : null}
          </>
        )}
      </KeyboardAwareFormShell>
    </View>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <View className="flex-row gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 px-4 py-3">
      <AppIcon name="information-outline" size={20} color={Palette.saffron} />
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
  contract,
  lender,
  getPurposeLabel,
  t,
}: {
  form: PpacsCreditFormValues;
  contract?: FarmerSmartContract;
  lender?: Lender;
  getPurposeLabel: (purpose: CreditPurpose) => string;
  t: (key: string) => string;
}) {
  const payload = toApplyAgriCreditPayload(form);
  const loanLabel = formatPaise(Math.round(payload.requestedAmountRupees * 100));

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
          {contract ? (
            <ReviewLine
              icon="file-document-outline"
              label={t('ppacsCredit.smartContract')}
              value={`${contract.cropType} · ${payload.collateralQuantityKg} kg`}
            />
          ) : null}
          {lender ? (
            <ReviewLine icon="bank-outline" label={t('ppacsCredit.lender')} value={lender.name} />
          ) : null}
          <ReviewLine icon="wallet-outline" label={t('ppacsCredit.loanAmount')} value={loanLabel} />
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
          <ReviewLine
            icon="credit-card-outline"
            label={t('ppacsCredit.accountNumber')}
            value={`${payload.bankDetails.bankName} · ****${payload.bankDetails.accountNumber.slice(-4)}`}
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
    t('ppacsCredit.nextSteps.kyc'),
    t('ppacsCredit.nextSteps.pledge'),
    t('ppacsCredit.nextSteps.review'),
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

function SuccessView({ loanNumber, t }: { loanNumber: string | null; t: (key: string) => string }) {
  return (
    <View className="items-center gap-5 pt-4">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-india-green/10">
        <AppIcon name="check-circle" size={52} color={Palette.indiaGreen} />
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
          {loanNumber
            ? t('ppacsCredit.loanRef').replace('{{loanNumber}}', loanNumber)
            : t('ppacsCredit.successTitle')}
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
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
        <AppIcon name={resolveAppIcon(icon)} size={15} color={Palette.indiaGreen} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] text-muted">{label}</Text>
        <Text className="text-[14px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}
