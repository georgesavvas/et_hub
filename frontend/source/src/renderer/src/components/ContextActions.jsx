import React from "react";

export function CopyToClipboard(text, messageApi) {
  navigator.clipboard.writeText(text);
  messageApi.open({
    type: "success",
    content: "Copied to clipboard!",
  });
}

// export function ShowInExplorer(filepath, enqueueSnackbar) {
//   clientRequest("show_in_explorer", {"filepath": filepath}).then((resp) => {
//     if (!resp.ok) enqueueSnackbar(
//       resp.msg || "Failed launching scene.", {variant: "error"}
//     );
//   });
// }
