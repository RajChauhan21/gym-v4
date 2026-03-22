// Allow only letters and spaces
export function allowOnlyText(e) {
  const regex = /^[a-zA-Z\s]*$/;

  if (!regex.test(e.key)) {
    e.preventDefault();
  }
}


// Allow only numbers (blocks e, +, -, etc)
export function allowOnlyNumbers(e) {
  if (
    !/[0-9]/.test(e.key) &&
    e.key !== "Backspace" &&
    e.key !== "Tab" &&
    e.key !== "ArrowLeft" &&
    e.key !== "ArrowRight"
  ) {
    e.preventDefault();
  }
}