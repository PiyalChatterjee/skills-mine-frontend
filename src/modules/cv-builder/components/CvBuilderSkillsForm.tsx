import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { type UseFieldArrayReturn, useFormContext } from "react-hook-form";
import styles from "../pages/CvBuilderPage.module.css";
import { CvBuilderFormPanel } from "./CvBuilderFormPrimitives";
import type { CvBuilderFormValues } from "@/app/validation.schema";

type CvBuilderSkillsFormProps = {
  skillsFieldArray: UseFieldArrayReturn<CvBuilderFormValues, "skills">;
};

const CvBuilderSkillsForm = ({ skillsFieldArray }: CvBuilderSkillsFormProps) => {
  const {
    formState: { errors },
    clearErrors,
  } = useFormContext<CvBuilderFormValues>();
  const { fields, append, remove } = skillsFieldArray;
  const [skillDraft, setSkillDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);
  // zodResolver reports a whole-array refine (no per-item path) directly on
  // `errors.skills.message`; `.root.message` only applies to useFieldArray's
  // own built-in array errors, so check both to be safe.
  const skillsError = errors.skills as
    | { message?: string; root?: { message?: string } }
    | undefined;
  const formError = skillsError?.message ?? skillsError?.root?.message;

  const handleAddSkill = () => {
    const name = skillDraft.trim();
    if (!name) return;
    clearErrors("skills");
    append({ name });
    setSkillDraft("");
  };

  const handleEditStart = (index: number, name: string) => {
    setEditingIndex(index);
    setEditingDraft(name);
  };

  const handleEditCommit = () => {
    if (editingIndex === null) return;
    const name = editingDraft.trim();
    if (!name) return;
    skillsFieldArray.update(editingIndex, { name });
    setEditingIndex(null);
    setEditingDraft("");
  };

  const SKILLS_COLLAPSE_LIMIT = 16;
  const populatedFields = fields
    .map((fieldItem, index) => ({ fieldItem, index }))
    .filter(({ fieldItem }) => fieldItem.name.trim());
  const visibleFields = showAllSkills
    ? populatedFields
    : populatedFields.slice(0, SKILLS_COLLAPSE_LIMIT);
  const hasMoreSkills = populatedFields.length > SKILLS_COLLAPSE_LIMIT;

  return (
    <CvBuilderFormPanel>
      <Box data-field="skills">
        {formError && (
          <Typography component="p" className={styles.skillsError}>
            {formError}
          </Typography>
        )}

        <Typography className={styles.skillsSubHeading}>
          List Your Skills
        </Typography>

      <Box className={styles.skillsList}>
        <Box className={styles.skillEntryRow}>
        <TextField
          value={skillDraft}
          onChange={(event) => setSkillDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddSkill();
            }
          }}
          placeholder="Add a skill"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    onClick={handleAddSkill}
                    className={styles.addSkillIconButton}
                    aria-label="Add skill"
                    disableRipple
                  >
                    +
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        </Box>

        <Box className={styles.skillChips}>
        {visibleFields.map(({ fieldItem, index }) =>
          editingIndex === index ? (
            <TextField
              key={fieldItem.id}
              autoFocus
              value={editingDraft}
              onChange={(event) => setEditingDraft(event.target.value)}
              onBlur={handleEditCommit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleEditCommit();
                }
                if (event.key === "Escape") {
                  setEditingIndex(null);
                  setEditingDraft("");
                }
              }}
              className={styles.editableSkillChip}
              variant="outlined"
              size="small"
            />
          ) : (
            <Chip
              key={fieldItem.id}
              label={fieldItem.name}
              onClick={() => handleEditStart(index, fieldItem.name)}
              onDelete={() => remove(index)}
              className={styles.skillChip}
              deleteIcon={<span aria-hidden="true">×</span>}
            />
          ),
        )}
        </Box>

        {hasMoreSkills ? (
          <Button
            type="button"
            onClick={() => setShowAllSkills((current) => !current)}
            className={styles.moreSkillsButton}
            disableRipple
          >
            {showAllSkills
              ? "Show less"
              : `More (${populatedFields.length - SKILLS_COLLAPSE_LIMIT})`}
          </Button>
        ) : null}
      </Box>
      </Box>
    </CvBuilderFormPanel>
  );
};

export default CvBuilderSkillsForm;
