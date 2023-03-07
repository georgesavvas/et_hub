import React from "react";


export function CopyToClipboard(text, enqueueSnackbar) {
  navigator.clipboard.writeText(text);
  enqueueSnackbar("Copied to clipboard!", {variant: "success"});
}

// export function ShowInExplorer(filepath, enqueueSnackbar) {
//   clientRequest("show_in_explorer", {"filepath": filepath}).then((resp) => {
//     if (!resp.ok) enqueueSnackbar(
//       resp.msg || "Failed launching scene.", {variant: "error"}
//     );
//   });
// }
