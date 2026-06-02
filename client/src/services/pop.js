import Swal from "sweetalert2";

// Show error message using SweetAlert2
export const showErrorAlert = (title, message) => {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
    confirmButtonColor: "#2563eb",
    timer: 3000,
    timerProgressBar: true,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
  });
};

// Show success message
export const showSuccessAlert = (
  icon,
  title,
  text,
  confirmButtonColor = "#2563eb",
  timer = 2000,
  timerProgressBar = true,
) => {
  Swal.fire({
    icon: icon || "success",
    title: title || "Successful!",
    text: text || "Welcome to the surveillance system",
    confirmButtonColor: confirmButtonColor || "#2563eb",
    timer: timer || 2000,
    timerProgressBar: timerProgressBar || true,
  });
};



export const showConfirmDialog = async ({
  title = "Are you sure?",
  text = "",
  icon = "warning",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
  confirmButtonColor = "#2563eb",
  cancelButtonColor = "#f43f5e",
  timer = null,
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    timer,
    timerProgressBar: !!timer,
  });

  return result.isConfirmed;
};