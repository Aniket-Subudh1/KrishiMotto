import { AppIcon } from '@/components/ui/app-icon';
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
import { DateRangeFields } from '@/features/crop-calendar/components/date-range-fields';
import { ParcelPicker } from '@/features/crop-calendar/components/parcel-picker';
import { ReviewSummary } from '@/features/crop-calendar/components/review-summary';
import { ScheduleTimeline } from '@/features/crop-calendar/components/schedule-timeline';
import { SeasonChips } from '@/features/crop-calendar/components/season-chips';
import { StepIndicator } from '@/features/crop-calendar/components/step-indicator';
import {
  getBookingError,
  useCreateCropCalendarBooking,
} from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { generateCropCalendarSchedule } from '@/features/crop-calendar/utils/generate-schedule';
import {
  parseFieldSizeAc,
  validateCropCalendarForm,
  type CropCalendarFormValues,
} from '@/features/crop-calendar/utils/validate-form';
import { useFarmerProfile } from '@/features/farmer/hooks/use-farmer-profile';
import { useLandParcels } from '@/features/farmer/hooks/use-land-parcel';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatPaise } from '@/lib/currency';
import { toLocalIsoDate } from '@/lib/date';
import { useAuthStore } from '@/stores/auth.store';
import { SEASONS, type ScheduledActivity } from '@/types/booking';
import type { CatalogService } from '@/types/catalog';

const STEPS = ['field', 'crop', 'schedule'] as const;
type WizardStep = (typeof STEPS)[number];

function defaultStartDate(): string {
  return toLocalIsoDate(new Date());
}

function defaultEndDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 5);
  return toLocalIsoDate(date);
}

function buildDefaultForm(profileSeason?: string | null, primaryCrop?: string | null): CropCalendarFormValues {
  const season = SEASONS.includes(profileSeason as (typeof SEASONS)[number])
    ? (profileSeason as (typeof SEASONS)[number])
    : 'Kharif';

  return {
    projectTitle: '',
    cropName: primaryCrop ?? '',
    cropType: 'Cereal',
    fieldSizeAc: '',
    season,
    startDate: defaultStartDate(),
    endDate: defaultEndDate(),
    query: '',
  };
}

function findCropCalendarService(services?: CatalogService[]): CatalogService | undefined {
  return services?.find((service) => service.iconType === 'CROP_CALENDAR');
}

function stepIndex(step: WizardStep): number {
  return STEPS.indexOf(step) + 1;
}

export function CropCalendarScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useFarmerProfile();
  const { data: parcels = [] } = useLandParcels();
  const { data: catalogServices, isLoading: catalogLoading } = useCatalog();
  const createBooking = useCreateCropCalendarBooking();

  const [step, setStep] = useState<WizardStep>('field');
  const [form, setForm] = useState<CropCalendarFormValues>(() =>
    buildDefaultForm(profile?.currentSeason, profile?.primaryCrop),
  );
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [parcelError, setParcelError] = useState<string | undefined>();
  const [formErrors, setFormErrors] = useState<ReturnType<typeof validateCropCalendarForm>>({});
  const [schedule, setSchedule] = useState<ScheduledActivity[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'paying' | 'polling' | 'done'>('idle');
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const cropCalendarService = useMemo(
    () => findCropCalendarService(catalogServices),
    [catalogServices],
  );

  const stepLabels = useMemo(
    () => [t('cropCalendar.steps.field'), t('cropCalendar.steps.crop'), t('cropCalendar.steps.schedule')],
    [t],
  );

  const selectedParcel = useMemo(
    () => parcels.find((item) => item.id === selectedParcelId),
    [parcels, selectedParcelId],
  );

  useEffect(() => {
    if (!selectedParcelId && parcels.length > 0) {
      const first = parcels[0];
      setSelectedParcelId(first.id);
      setForm((current) => ({
        ...current,
        fieldSizeAc: String(first.areaAcres),
        projectTitle:
          current.projectTitle ||
          `${current.season} ${current.cropName || first.name}`.trim(),
      }));
    }
  }, [parcels, selectedParcelId]);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  function updateForm<K extends keyof CropCalendarFormValues>(key: K, value: CropCalendarFormValues[K]) {
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
        fieldSizeAc: String(parcel.areaAcres),
        projectTitle:
          current.projectTitle ||
          `${current.season} ${current.cropName || parcel.name}`.trim(),
      }));
    }
  }

  function handleGenerateSchedule() {
    const errors = validateCropCalendarForm(form, t);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setGenerating(true);
    const generated = generateCropCalendarSchedule({
      startDate: form.startDate,
      endDate: form.endDate,
      cropName: form.cropName.trim(),
      season: form.season,
    });
    setSchedule(generated);
    setTimeout(() => setGenerating(false), 400);
  }

  function validateCurrentStep(): boolean {
    const errors = validateCropCalendarForm(form, t);

    if (step === 'field') {
      if (!selectedParcelId || !parcels.find((p) => p.id === selectedParcelId)) {
        setParcelError(t('cropCalendar.errors.parcelRequired'));
        return false;
      }
      setParcelError(undefined);

      if (errors.fieldSizeAc) {
        setFormErrors({ fieldSizeAc: errors.fieldSizeAc });
        return false;
      }
      setFormErrors({});
      return true;
    }

    if (step === 'crop') {
      const cropKeys = ['projectTitle', 'cropName', 'cropType', 'season'] as const;
      const stepErrors = Object.fromEntries(
        cropKeys.filter((key) => errors[key]).map((key) => [key, errors[key]]),
      );
      setFormErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }

    const dateKeys = ['startDate', 'endDate'] as const;
    const stepErrors = Object.fromEntries(
      dateKeys.filter((key) => errors[key]).map((key) => [key, errors[key]]),
    );
    setFormErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    const index = STEPS.indexOf(step);
    if (index < STEPS.length - 1) {
      setStep(STEPS[index + 1]);
      if (step === 'crop' && schedule.length === 0) {
        handleGenerateSchedule();
      }
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

    const errors = validateCropCalendarForm(form, t);
    setFormErrors(errors);

    const parcel = parcels.find((item) => item.id === selectedParcelId);
    if (!parcel) {
      setParcelError(t('cropCalendar.errors.parcelRequired'));
      setStep('field');
      return;
    }
    setParcelError(undefined);

    if (Object.keys(errors).length > 0) return;

    const activities =
      schedule.length > 0
        ? schedule
        : generateCropCalendarSchedule({
            startDate: form.startDate,
            endDate: form.endDate,
            cropName: form.cropName.trim(),
            season: form.season,
          });

    setSubmitError(null);
    setPaymentState('paying');

    try {
      const booking = await createBooking.mutateAsync({
        serviceIconType: 'CROP_CALENDAR',
        geometry: parcel.geometry,
        details: {
          projectTitle: form.projectTitle.trim(),
          cropName: form.cropName.trim(),
          cropType: form.cropType,
          fieldSizeAc: parseFieldSizeAc(form.fieldSizeAc),
          season: form.season,
          startDate: form.startDate,
          endDate: form.endDate,
          scheduledActivities: activities,
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
      Alert.alert(t('cropCalendar.bookingCreatedTitle'), t('cropCalendar.bookingCreatedBody'), [
        { text: t('cropCalendar.done'), onPress: () => router.back() },
      ]);
    } catch (error) {
      setPaymentState('idle');
      setSubmitError(getBookingError(error, t('cropCalendar.submitError')));
    }
  }

  const priceLabel = cropCalendarService
    ? formatPaise(cropCalendarService.basePricePaise)
    : '₹199';
  const isBusy = createBooking.isPending || paymentState === 'paying' || paymentState === 'polling';
  const currentStepIndex = stepIndex(step);
  const isLastStep = step === 'schedule';
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
              {t('cropCalendar.stepOf')
                .replace('{{current}}', String(currentStepIndex))
                .replace('{{total}}', String(STEPS.length))}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <AppIcon name="calendar-month-outline" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('cropCalendar.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {step === 'field'
                ? t('cropCalendar.stepHints.field')
                : step === 'crop'
                  ? t('cropCalendar.stepHints.crop')
                  : t('cropCalendar.stepHints.schedule')}
            </Text>
          </View>
        </View>

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
                  ? t('cropCalendar.checkingPayment')
                  : t('cropCalendar.submit').replace('{{price}}', priceLabel)}
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
                    {t('cropCalendar.back')}
                  </Button>
                ) : null}
                <Button size="lg" className="flex-1" onPress={goNext}>
                  {t('cropCalendar.continue')}
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
                {t('cropCalendar.orderRef').replace('{{orderId}}', completedOrderId)}
              </Text>
            </View>
          ) : null}

          {step === 'field' ? (
            <View className="gap-5">
              <ParcelPicker
                label={t('cropCalendar.fieldLabel')}
                hint={t('cropCalendar.fieldHint')}
                parcels={parcels}
                selectedId={selectedParcelId}
                onSelect={handleParcelSelect}
                onAddField={() => router.push('/farmer/land-boundary')}
                error={parcelError}
                addFieldLabel={t('cropCalendar.addField')}
              />

              {selectedParcel ? (
                <Input
                  label={t('cropCalendar.fieldSize')}
                  value={form.fieldSizeAc}
                  onChangeText={(value) => updateForm('fieldSizeAc', value)}
                  keyboardType="decimal-pad"
                  placeholder="4.5"
                  error={formErrors.fieldSizeAc}
                  icon="resize-outline"
                  hint={t('cropCalendar.fieldSizeHint')}
                />
              ) : null}
            </View>
          ) : null}

          {step === 'crop' ? (
            <View className="gap-5">
              <SeasonChips
                label={t('cropCalendar.season')}
                value={form.season}
                onChange={(value) => updateForm('season', value)}
                getHint={(season) => t(`cropCalendar.seasonHints.${season}`)}
                error={formErrors.season}
              />

              <Input
                label={t('cropCalendar.cropName')}
                value={form.cropName}
                onChangeText={(value) => updateForm('cropName', value)}
                placeholder={t('cropCalendar.cropNamePlaceholder')}
                error={formErrors.cropName}
                icon="leaf-outline"
              />

              <CropTypeChips
                label={t('cropCalendar.cropType')}
                value={form.cropType}
                onChange={(value) => updateForm('cropType', value)}
                error={formErrors.cropType}
              />

              <Input
                label={t('cropCalendar.projectTitle')}
                value={form.projectTitle}
                onChangeText={(value) => updateForm('projectTitle', value)}
                placeholder={t('cropCalendar.projectTitlePlaceholder')}
                error={formErrors.projectTitle}
                icon="document-text-outline"
                hint={t('cropCalendar.projectTitleHint')}
              />
            </View>
          ) : null}

          {step === 'schedule' ? (
            <View className="gap-5">
              <DateRangeFields
                startLabel={t('cropCalendar.startDate')}
                endLabel={t('cropCalendar.endDate')}
                startDate={form.startDate}
                endDate={form.endDate}
                onStartChange={(value) => updateForm('startDate', value)}
                onEndChange={(value) => updateForm('endDate', value)}
                startError={formErrors.startDate}
                endError={formErrors.endDate}
                durationLabel={t('cropCalendar.durationDays')}
              />

              <ScheduleTimeline
                title={t('cropCalendar.scheduleTitle')}
                badge={schedule.length ? t('cropCalendar.scheduleBadge') : undefined}
                activities={schedule}
                emptyLabel={t('cropCalendar.scheduleEmpty')}
                emptyHint={t('cropCalendar.scheduleEmptyHint')}
                onGenerate={handleGenerateSchedule}
                generateLabel={t('cropCalendar.generate')}
                generating={generating}
              />

              <ReviewSummary
                form={form}
                parcel={selectedParcel}
                activityCount={schedule.length}
                labels={{
                  title: t('cropCalendar.reviewTitle'),
                  field: t('cropCalendar.fieldLabel'),
                  crop: t('cropCalendar.cropName'),
                  season: t('cropCalendar.season'),
                  duration: t('cropCalendar.duration'),
                  activities: t('cropCalendar.activitiesCount'),
                }}
              />

              <Input
                label={t('cropCalendar.notes')}
                value={form.query}
                onChangeText={(value) => updateForm('query', value)}
                placeholder={t('cropCalendar.notesPlaceholder')}
                multiline
                numberOfLines={3}
                icon="chatbox-ellipses-outline"
              />

              <View
                className="overflow-hidden rounded-2xl border border-india-green/20 bg-surface"
              >
                <LinearGradient
                  colors={['rgba(70, 150, 47, 0.08)', 'rgba(244, 164, 96, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-4 py-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-[12px] font-medium uppercase tracking-wide text-muted">
                        {t('cropCalendar.totalPayable')}
                      </Text>
                      <Text className="mt-1 text-[28px] font-bold text-india-green">
                        {catalogLoading ? '…' : priceLabel}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      <View className="flex-row items-center gap-1.5 rounded-full bg-white px-2.5 py-1">
                        <AppIcon name="shield-check-outline" size={14} color={Palette.indiaGreen} />
                        <Text className="text-[11px] font-semibold text-india-green">
                          {t('cropCalendar.expertReviewed')}
                        </Text>
                      </View>
                      <Text className="text-[11px] text-muted">{t('cropCalendar.viaInstantPay')}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          ) : null}
      </KeyboardAwareFormShell>
    </View>
  );
}
