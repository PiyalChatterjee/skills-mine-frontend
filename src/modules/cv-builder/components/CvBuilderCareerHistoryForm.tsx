import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import buildingIcon from "@/assets/cv-builder/building-line.svg";
import styles from "../pages/CvBuilderPage.module.css";
import {
  CvBuilderFormPanel,
  CvBuilderLabeledField,
  CvBuilderSectionHeader,
} from "./CvBuilderFormPrimitives";
import CvBuilderRemoveItemButton from "./CvBuilderRemoveItemButton";
import type { CvBuilderFormValues } from "@/app/validation.schema";
import { parseMonthYear, formatMonthYear } from "../utils/monthYearDate";

type DynamicListSectionProps = {
  entryIndex: number;
  sectionKey: "tasks" | "projects";
  label: string;
  itemLabel: string;
  addButtonLabel: string;
};

const DynamicListSection = ({
  entryIndex,
  sectionKey,
  label,
  itemLabel,
  addButtonLabel,
}: DynamicListSectionProps) => {
  const { control, getValues, setValue } =
    useFormContext<CvBuilderFormValues>();
  const items = (useWatch({
    control,
    name: `careerHistory.${entryIndex}.${sectionKey}`,
  }) ?? []) as string[];

  const addItem = () => {
    const path = `careerHistory.${entryIndex}.${sectionKey}` as const;
    const current =
      (getValues(path as "careerHistory") as unknown as string[]) ?? [];
    setValue(path as "careerHistory", [...current, ""] as never, {
      shouldDirty: true,
    });
  };

  const removeItem = (index: number) => {
    const path = `careerHistory.${entryIndex}.${sectionKey}` as const;
    const current =
      (getValues(path as "careerHistory") as unknown as string[]) ?? [];
    const remaining = current.filter((_, itemIndex) => itemIndex !== index);
    setValue(
      path as "careerHistory",
      (remaining.length ? remaining : [""]) as never,
      { shouldDirty: true },
    );
  };

  return (
    <Box className={styles.dynamicListSection}>
      <Typography component="p" className={styles.dynamicListLabel}>
        {label}
      </Typography>
      {items.map((_, idx) => (
        <Box key={idx} className={styles.skillRow}>
          <Controller
            name={`careerHistory.${entryIndex}.${sectionKey}.${idx}` as never}
            control={control}
            render={({ field: { ref, ...field } }) => (
              <TextField
                {...field}
                inputRef={ref}
                placeholder={`${itemLabel} ${idx + 1}`}
                className={`${styles.fieldControl} ${styles.dynamicListField}`}
                variant="outlined"
                fullWidth
              />
            )}
          />
          <CvBuilderRemoveItemButton
            canRemove
            ariaLabel={`Remove ${itemLabel.toLowerCase()} ${idx + 1}`}
            onClick={() => removeItem(idx)}
          />
        </Box>
      ))}
      <Button
        type="button"
        onClick={addItem}
        className={styles.addDashedButton}
        disableRipple
        fullWidth
      >
        {addButtonLabel}
      </Button>
    </Box>
  );
};

const CvBuilderPositionCard = ({ entryIndex }: { entryIndex: number }) => {
  const { control, trigger } = useFormContext<CvBuilderFormValues>();
  const currentCompany = useWatch({
    control,
    name: "personalDetails.currentCompany",
  });
  const isRequired = Boolean(currentCompany?.trim());
  const startDateValue = useWatch({
    control,
    name: `careerHistory.${entryIndex}.startDate`,
  });
  const endDateValue = useWatch({
    control,
    name: `careerHistory.${entryIndex}.endDate`,
  });
  const showFieldErrors = isRequired;
  const startDateAsDate = parseMonthYear(startDateValue);
  const endDateAsDate = parseMonthYear(endDateValue);
  // The start/end order check lives on startDate, so changing either date must
  // re-validate both or a stale "must be before end date" error can linger.
  const revalidateDateRange = () =>
    trigger([
      `careerHistory.${entryIndex}.startDate`,
      `careerHistory.${entryIndex}.endDate`,
    ]);

  return (
    <Box className={styles.positionCard}>
      <Typography component="h3" className={styles.positionLabel}>
        Position {entryIndex + 1}
      </Typography>

      <CvBuilderLabeledField
        label="Company name"
        required={isRequired}
        fieldName={`careerHistory.${entryIndex}.companyName`}
      >
        <Controller
          name={`careerHistory.${entryIndex}.companyName`}
          control={control}
          render={({ field: { ref, ...field }, fieldState }) => (
            <TextField
              {...field}
              inputRef={ref}
              error={showFieldErrors && Boolean(fieldState.error)}
              helperText={showFieldErrors ? fieldState.error?.message : undefined}
              placeholder="Company name"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </CvBuilderLabeledField>

      <Box className={styles.positionRowGrid}>
        <CvBuilderLabeledField
          label="Position held"
          required={isRequired}
          fieldName={`careerHistory.${entryIndex}.positionHeld`}
        >
          <Controller
            name={`careerHistory.${entryIndex}.positionHeld`}
            control={control}
            render={({ field: { ref, ...field }, fieldState }) => (
              <TextField
                {...field}
                inputRef={ref}
                error={showFieldErrors && Boolean(fieldState.error)}
                helperText={showFieldErrors ? fieldState.error?.message : undefined}
                placeholder="Position held"
                className={styles.fieldControl}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </CvBuilderLabeledField>

        <CvBuilderLabeledField
          label="Employment start date"
          required={isRequired}
          fieldName={`careerHistory.${entryIndex}.startDate`}
        >
          <Controller
            name={`careerHistory.${entryIndex}.startDate`}
            control={control}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={parseMonthYear(field.value)}
                  onChange={(value) => {
                    field.onChange(formatMonthYear(value));
                    void revalidateDateRange();
                  }}
                  onClose={field.onBlur}
                  views={["year", "month"]}
                  openTo="month"
                  format="MMMM YYYY"
                  disableFuture
                  maxDate={endDateAsDate ?? undefined}
                  slotProps={{
                    textField: {
                      onBlur: field.onBlur,
                      error: showFieldErrors && Boolean(fieldState.error),
                      helperText: showFieldErrors ? fieldState.error?.message : undefined,
                      className: `${styles.fieldControl} ${styles.monthYearField}`,
                      variant: "outlined",
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </CvBuilderLabeledField>

        <CvBuilderLabeledField
          label="End date"
          fieldName={`careerHistory.${entryIndex}.endDate`}
        >
          <Controller
            name={`careerHistory.${entryIndex}.endDate`}
            control={control}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={parseMonthYear(field.value)}
                  onChange={(value) => {
                    field.onChange(formatMonthYear(value));
                    void revalidateDateRange();
                  }}
                  onClose={field.onBlur}
                  views={["year", "month"]}
                  openTo="month"
                  format="MMMM YYYY"
                  disableFuture={entryIndex > 0}
                  minDate={startDateAsDate ?? undefined}
                  slotProps={{
                    textField: {
                      onBlur: field.onBlur,
                      error: showFieldErrors && Boolean(fieldState.error),
                      helperText: showFieldErrors ? fieldState.error?.message : undefined,
                      className: `${styles.fieldControl} ${styles.monthYearField}`,
                      variant: "outlined",
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
        </CvBuilderLabeledField>
      </Box>

      <DynamicListSection
        entryIndex={entryIndex}
        sectionKey="tasks"
        label="List The Tasks That You Were Responsible For"
        itemLabel="Task"
        addButtonLabel="+ Add a task"
      />
      <DynamicListSection
        entryIndex={entryIndex}
        sectionKey="projects"
        label="List Some Of The Projects You Were Involved In"
        itemLabel="Project"
        addButtonLabel="+ Add a project"
      />
    </Box>
  );
};

const CvBuilderCareerHistoryForm = () => {
  const {
    control,
    formState: { errors },
    clearErrors,
    trigger,
  } = useFormContext<CvBuilderFormValues>();
  const currentCompany = useWatch({
    control,
    name: "personalDetails.currentCompany",
  });
  const previousCurrentCompany = useRef(currentCompany);
  const { fields, append } = useFieldArray({ control, name: "careerHistory" });
  const isCurrentCompanyRequired = Boolean(
    useWatch({ control, name: "personalDetails.currentCompany" })?.trim(),
  );
  const formError = isCurrentCompanyRequired ? (
    errors.careerHistory as { root?: { message?: string } } | undefined
  )?.root?.message : undefined;

  useEffect(() => {
    const currentCompanyChanged = previousCurrentCompany.current !== currentCompany;
    previousCurrentCompany.current = currentCompany;

    if (!currentCompany?.trim()) {
      clearErrors("careerHistory");
      return;
    }

    if (currentCompanyChanged) {
      void trigger("careerHistory");
    }
  }, [currentCompany, clearErrors, trigger]);

  const handleAddPosition = () => {
    clearErrors("careerHistory");
    append({
      companyName: "",
      positionHeld: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
      tasks: [""],
      projects: [""],
    });
  };

  return (
    <CvBuilderFormPanel>
      <CvBuilderSectionHeader iconSrc={buildingIcon} title="Career History" />

      {formError && (
        <Typography
          component="p"
          data-field="careerHistory"
          sx={{ color: "#d32f2f", marginBottom: 2 }}
        >
          {formError}
        </Typography>
      )}

      {fields.map((fieldItem, entryIndex) => (
        <CvBuilderPositionCard key={fieldItem.id} entryIndex={entryIndex} />
      ))}

      <Button
        type="button"
        onClick={handleAddPosition}
        className={styles.addPositionButton}
        disableRipple
        fullWidth
      >
        + Add position
      </Button>
    </CvBuilderFormPanel>
  );
};

export default CvBuilderCareerHistoryForm;
