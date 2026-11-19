import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import {
  Button, Dialog, IconButton, FormControlLabel, Radio, RadioGroup,
} from "@mui/material";
import { FormField } from "@/components/forms/FormField";
import { FormDateField } from "@/components/forms/FormDateField";
import closeIcon from "@/assets/crm/close.svg";
import radioDot from "@/assets/crm/radio-dot.svg";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import {
  useAddCrmClientNoteMutation,
} from "@/store/api/apiSlice";
import { getCrmApiErrorMessage } from "../errorMessages";
import type { CrmClient } from "@/types/api";
import { getFollowupDayOffset } from "../presentation";
import {
  crmClassificationLabels, crmClassifications, crmNoteSchema,
  type CrmNoteValues,
} from "../schema";
import styles from "./CrmClientDialogs.module.css";

type DialogProps = {
  onClose: () => void;
  onSaved: () => void;
};

const getDateFromDayOffset = (days?: number | null): string => {
  if (days == null || !Number.isInteger(days)) return "";

  return dayjs().add(days, "day").format("YYYY-MM-DD");
};

export function UpdateCrmClientDialog({ client, onClose, onSaved }: DialogProps & { client: CrmClient }) {
  const dispatch = useDispatch<AppDispatch>();
  const [addNote, { isLoading }] = useAddCrmClientNoteMutation();
  const { control, handleSubmit, formState: { isValid } } =
    useForm<CrmNoteValues>({
      resolver: zodResolver(crmNoteSchema),
      defaultValues: {
        classification: crmClassifications.find((value) => value === client.status),
        note: client.lastNote ?? "",
        followupDate: getDateFromDayOffset(getFollowupDayOffset(client)),
        lastcontactDate: getDateFromDayOffset(
          client.lastContactDays == null ? null : -client.lastContactDays,
        ),
      },
      mode: "onChange",
    });
  const lastcontactDate = useWatch({ control, name: "lastcontactDate" });
  const contactDate = dayjs(lastcontactDate);
  const followupMinDate = lastcontactDate && contactDate.isValid()
    ? contactDate.add(1, "day").format("YYYY-MM-DD")
    : undefined;

  const submit = handleSubmit(async ({ followupDate, lastcontactDate, ...values }) => {
    try {
      await addNote({
        clientId: client.clientId,
        payload: {
          ...values,
          ...(followupDate ? { followupDate } : {}),
          ...(lastcontactDate ? { lastcontactDate } : {}),
        },
      }).unwrap();
      onSaved();
    } catch (error) {
      dispatch(pushNotification({
        level: "error",
        title: "CRM update failed",
        message: getCrmApiErrorMessage(
          error,
          "We couldn't update this CRM contact. Please try again.",
        ),
      }));
    }
  });

  return (
    <Dialog open onClose={isLoading ? undefined : onClose} fullWidth maxWidth={false}
      aria-labelledby="crm-update-title" aria-describedby="crm-update-client"
      slotProps={{ paper: { className: styles.updatePaper } }}>
      <form onSubmit={submit} noValidate aria-busy={isLoading} className={styles.updateForm}>
        <div className={styles.stickyHeader}>
          <div className={styles.closeRow}>
            <IconButton aria-label="Close update dialog" className={styles.closeButton} onClick={onClose} disabled={isLoading}>
              <img src={closeIcon} alt="" aria-hidden="true" />
            </IconButton>
          </div>
          <h2 id="crm-update-title" className={styles.updateTitle}>Update</h2>
        </div>
        <span id="crm-update-client" className={styles.srOnly}>Update {client.clientName}</span>
        <div className={styles.updateContent}>
          <fieldset className={styles.classifications} disabled={isLoading}>
            <legend className={styles.classificationLabel} id="crm-classification-label">Classification*</legend>
            <Controller name="classification" control={control} render={({ field, fieldState }) => (
              <>
                <RadioGroup {...field} value={field.value ?? ""} aria-labelledby="crm-classification-label"
                  aria-required="true" aria-invalid={Boolean(fieldState.error)}
                  aria-describedby={fieldState.error ? "crm-classification-error" : undefined}
                  className={styles.radioGroup}>
                  {crmClassifications.map((status) => (
                    <FormControlLabel key={status} value={status} label={crmClassificationLabels[status]}
                      className={`${styles.radioOption} ${field.value === status ? styles.radioSelected : ""}`}
                      control={<Radio disabled={isLoading} className={styles.radio}
                        icon={<span className={styles.radioCircle} />}
                        checkedIcon={<span className={`${styles.radioCircle} ${styles.radioChecked}`}><img src={radioDot} alt="" aria-hidden="true" /></span>} />} />
                  ))}
                </RadioGroup>
                {fieldState.error && <span id="crm-classification-error" className={styles.fieldError}>{fieldState.error.message}</span>}
              </>
            )} />
          </fieldset>
          <div className={styles.dateRow}>
            {([
              ["lastcontactDate", "Last Contact Date"],
              ["followupDate", "Follow-up Date"],
            ] as const).map(([name, label]) => (
              <Controller key={name} name={name} control={control}
                rules={name === "lastcontactDate" ? { deps: ["followupDate"] } : undefined}
                render={({ field: { ref, ...field }, fieldState }) => (
                <FormDateField {...field} inputRef={ref} label={label} disabled={isLoading}
                  disableFuture={name === "lastcontactDate"}
                  minDate={name === "followupDate" ? followupMinDate : undefined}
                  error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />
              )} />
            ))}
          </div>
          <Controller name="note" control={control} render={({ field: { ref, ...field }, fieldState }) => (
            <FormField {...field} inputRef={ref} label="Add Note (Max 4 lines)" placeholder="Note"
              className={styles.noteField} multiline rows={4} required disabled={isLoading}
              slotProps={{ htmlInput: { maxLength: 320 } }}
              error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />
          )} />
          <div className={styles.updateActions}>
            <Button className={styles.cancelButton} onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button className={styles.submitButton} variant="contained" type="submit" disabled={isLoading || !isValid}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
