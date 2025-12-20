"use client";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

interface DocumentFile {
  uri: string;
  fileName: string;
  fileType: string;
}

interface DocumentViewerWrapperProps {
  documentFile: DocumentFile;
}

export default function DocumentViewerWrapper({ documentFile }: DocumentViewerWrapperProps) {
  return (
    <DocViewer
      documents={[
        {
          uri: documentFile.uri,
          fileName: documentFile.fileName,
          fileType: documentFile.fileType,
        },
      ]}
      pluginRenderers={DocViewerRenderers}
      config={{
        header: {
          disableHeader: true,
          disableFileName: true,
        },
      }}
      style={{ height: "100%" }}
    />
  );
}
