import { Alert, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { removeNotification } from "@/store/slices/notificationSlice";

const AUTO_HIDE_DURATION_MS = 4000;

export const NotificationToaster = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentNotification = useSelector(
    (state: RootState) => state.notification.items[0],
  );

  const handleClose = (
    _: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    if (currentNotification) {
      dispatch(removeNotification(currentNotification.id));
    }
  };

  return (
    <Snackbar
      open={Boolean(currentNotification)}
      autoHideDuration={AUTO_HIDE_DURATION_MS}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {currentNotification ? (
        <Alert
          onClose={handleClose}
          severity={currentNotification.level}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {currentNotification.message
            ? `${currentNotification.title}: ${currentNotification.message}`
            : currentNotification.title}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};
