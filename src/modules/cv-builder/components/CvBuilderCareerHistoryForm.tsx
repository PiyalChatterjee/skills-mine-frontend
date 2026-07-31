import { Box, Button, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import buildingIcon from '@/assets/cv-builder/building-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import type { CareerHistoryEntry } from '../types/cvBuilder'

type CvBuilderCareerHistoryFormProps = {
  entries: CareerHistoryEntry[]
  onUpdatePosition: (
    entryId: string,
    field: keyof Omit<CareerHistoryEntry, 'id' | 'tasks' | 'projects'>,
    value: string | boolean,
  ) => void
  onAddTask: (entryId: string) => void
  onUpdateTask: (entryId: string, taskIndex: number, value: string) => void
  onAddProject: (entryId: string) => void
  onUpdateProject: (entryId: string, projectIndex: number, value: string) => void
  onAddPosition: () => void
}

const CvBuilderCareerHistoryForm = ({
  entries,
  onUpdatePosition,
  onAddTask,
  onUpdateTask,
  onAddProject,
  onUpdateProject,
  onAddPosition,
}: CvBuilderCareerHistoryFormProps) => (
  <Box className={styles.formPanel}>
    <Box className={styles.formHeader}>
      <Box className={styles.formIconBadge} aria-hidden="true">
        <Box component="img" src={buildingIcon} alt="" className={styles.formIcon} />
      </Box>
      <Typography component="h2" className={styles.sectionTitle}>
        Career history
      </Typography>
    </Box>

    {entries.map((entry, positionIndex) => (
      <Box key={entry.id} className={styles.positionCard}>
        <Typography component="h3" className={styles.positionLabel}>
          Position {positionIndex + 1}
        </Typography>

        {/* Company name */}
        <Box className={styles.fieldGroup}>
          <Typography component="label" className={styles.fieldLabel}>
            Company name
          </Typography>
          <TextField
            value={entry.companyName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onUpdatePosition(entry.id, 'companyName', event.target.value)
            }
            placeholder="Company name"
            className={styles.fieldControl}
            variant="outlined"
            fullWidth
          />
        </Box>

        {/* Position held / dates row */}
        <Box className={styles.positionRowGrid}>
          <Box className={styles.fieldGroup}>
            <Typography component="label" className={styles.fieldLabel}>
              Position held
            </Typography>
            <TextField
              value={entry.positionHeld}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdatePosition(entry.id, 'positionHeld', event.target.value)
              }
              placeholder="Position held"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography component="label" className={styles.fieldLabel}>
              Employment start date
            </Typography>
            <TextField
              value={entry.startDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdatePosition(entry.id, 'startDate', event.target.value)
              }
              placeholder="Month, Year"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Typography component="label" className={styles.fieldLabel}>
              End date
            </Typography>
            <TextField
              value={entry.endDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdatePosition(entry.id, 'endDate', event.target.value)
              }
              placeholder="Month, Year"
              className={styles.fieldControl}
              variant="outlined"
              fullWidth
            />
          </Box>
        </Box>

        {/* Tasks */}
        <Box className={styles.dynamicListSection}>
          <Typography component="p" className={styles.dynamicListLabel}>
            List the tasks that you were responsible for
          </Typography>
          {entry.tasks.map((task, taskIndex) => (
            <TextField
              key={taskIndex}
              value={task}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateTask(entry.id, taskIndex, event.target.value)
              }
              placeholder={`Task ${taskIndex + 1}`}
              className={`${styles.fieldControl} ${styles.dynamicListField}`}
              variant="outlined"
              fullWidth
            />
          ))}
          <Button
            type="button"
            onClick={() => onAddTask(entry.id)}
            className={styles.addDashedButton}
            disableRipple
            fullWidth
          >
            + Add a task
          </Button>
        </Box>

        {/* Projects */}
        <Box className={styles.dynamicListSection}>
          <Typography component="p" className={styles.dynamicListLabel}>
            List some of the projects you were involved in
          </Typography>
          {entry.projects.map((project, projectIndex) => (
            <TextField
              key={projectIndex}
              value={project}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onUpdateProject(entry.id, projectIndex, event.target.value)
              }
              placeholder={`Project ${projectIndex + 1}`}
              className={`${styles.fieldControl} ${styles.dynamicListField}`}
              variant="outlined"
              fullWidth
            />
          ))}
          <Button
            type="button"
            onClick={() => onAddProject(entry.id)}
            className={styles.addDashedButton}
            disableRipple
            fullWidth
          >
            + Add a project
          </Button>
        </Box>
      </Box>
    ))}

    <Button
      type="button"
      onClick={onAddPosition}
      className={styles.addPositionButton}
      disableRipple
      fullWidth
    >
      + Add position
    </Button>
  </Box>
)

export default CvBuilderCareerHistoryForm
