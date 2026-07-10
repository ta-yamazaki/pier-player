import {ref} from "vue";

const message = ref<string | null>("");
const errorMessage = ref<string | null>("");

export function useNotification() {
  const notify = (msg: string) => {
    message.value = msg;
    setTimeout(() => {
      message.value = null;
    }, 3000);
  };

  const notifyError = (msg: string) => {
    errorMessage.value = msg;
    setTimeout(() => {
      errorMessage.value = null;
    }, 3000);
  };

  return {message, errorMessage, notify, notifyError};
}
