import { useCallback, useEffect, useState } from "react";
import { Alert, Skeleton, Spin } from "antd";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import dockerfile from "react-syntax-highlighter/dist/esm/languages/hljs/dockerfile";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";
import plaintext from "react-syntax-highlighter/dist/esm/languages/hljs/plaintext";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import r from "react-syntax-highlighter/dist/esm/languages/hljs/r";
import shell from "react-syntax-highlighter/dist/esm/languages/hljs/shell";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import {
  LANGUAGE_HIGHLIGHTERS,
  CSV_LIKE_FILE_EXTENSIONS,
  AUDIO_FILE_EXTENSIONS,
  IMAGE_FILE_EXTENSIONS,
  VIDEO_FILE_EXTENSIONS,
} from "@/constants";

import type { BlobDisplayProps } from "@/types/blob";
import type { AuthHeader } from "@/types/http";
import type { JSONType } from "@/types/json";

import AudioDisplay from "./specific/AudioDisplay";
import CsvDisplay from "./specific/CsvDisplay";
import DocxDisplay from "./specific/DocxDisplay";
import HtmlDisplay from "./specific/HtmlDisplay";
import ImageBlobDisplay from "./specific/ImageBlobDisplay";
import JsonDisplay from "./specific/JsonDisplay";
import MarkdownDisplay from "./specific/MarkdownDisplay";
import PdfDisplay from "./specific/PdfDisplay";
import VideoDisplay from "./specific/VideoDisplay";
import XlsxDisplay from "./specific/XlsxDisplay";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("dockerfile", dockerfile);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("r", r);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("xml", xml);

const DEFER_LOADING_FILE_EXTENSIONS = ["pdf"]; // Don't use a fetch() for these extensions

const WrappedJsonDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const [parsing, setParsing] = useState(false);
  const [json, setJson] = useState<JSONType | undefined>(undefined);

  useEffect(() => {
    if (contents) {
      setParsing(true);
      contents
        .text()
        .then((jt) => setJson(JSON.parse(jt)))
        .finally(() => setParsing(false));
    }
  }, [contents]);

  return (
    <>
      <Skeleton active={true} loading={loading || parsing} />
      <JsonDisplay jsonSrc={json} />
    </>
  );
};

interface WrappedCodeDisplayProps extends BlobDisplayProps {
  fileExt: string;
}

const WrappedCodeDisplay = ({ contents, fileExt, loading }: WrappedCodeDisplayProps) => {
  const [decoding, setDecoding] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (contents) {
      setDecoding(true);
      contents
        .text()
        .then((mt) => setCode(mt))
        .finally(() => setDecoding(false));
    }
  }, [contents, loading]);

  if (fileExt === "md") {
    return <MarkdownDisplay contents={code} loading={loading || decoding} />;
  } else {
    return (
      <>
        <Skeleton active={true} loading={loading || decoding} />
        <SyntaxHighlighter
          language={LANGUAGE_HIGHLIGHTERS[fileExt]}
          style={a11yLight}
          customStyle={{ fontSize: "12px" }}
          showLineNumbers={true}
        >
          {code || ""}
        </SyntaxHighlighter>
      </>
    );
  }
};

type FileDisplayProps = {
  uri?: string;
  fileName?: string;
  loading?: boolean;
  authHeader?: AuthHeader;
};

const FileDisplay = ({ uri, fileName, loading, authHeader }: FileDisplayProps) => {
  const [fileLoadError, setFileLoadError] = useState("");
  const [loadingFileContents, setLoadingFileContents] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, Blob>>({});

  const fileExt = fileName ? fileName.split(".").slice(-1)[0].toLowerCase() : "";

  useEffect(() => {
    // File changed, so reset the load error
    setFileLoadError("");

    (async () => {
      if (!fileName) return;

      if (fileExt === "pdf") {
        setLoadingFileContents(true);
      }

      if (DEFER_LOADING_FILE_EXTENSIONS.includes(fileExt) || (uri && uri in fileContents)) return;

      if (!uri) {
        console.error(`Files: something went wrong while trying to load ${uri}`);
        setFileLoadError("Could not find URI for file.");
        return;
      }

      try {
        setLoadingFileContents(true);
        const r = await fetch(uri, { headers: authHeader });
        if (r.ok) {
          setFileContents({
            ...fileContents,
            [uri]: await r.blob(),
          });
        } else {
          setFileLoadError(`Could not load file: ${await r.text()}`);
        }
      } catch (e) {
        console.error(e);
        setFileLoadError(`Could not load file: ${(e as Error).message}`);
      } finally {
        setLoadingFileContents(false);
      }
    })();
  }, [fileName, fileExt, uri, fileContents, authHeader]);

  const onPdfLoad = useCallback(() => {
    setLoadingFileContents(false);
  }, []);

  const onPdfFail = useCallback((err: Error) => {
    setLoadingFileContents(false);
    setFileLoadError(`Error loading PDF: ${err.message}`);
  }, []);

  if (!uri || !fileName) {
    console.error(`Missing URI or file name: uri=${uri}, fileName=${fileName}`);
    return <div />;
  }

  return (
    <Spin spinning={loading}>
      {(() => {
        if (fileLoadError) {
          return (
            <Alert
              type="error"
              message={`Error loading file: ${fileName}`}
              description={fileLoadError}
              showIcon={true}
            />
          );
        }

        const fc = fileContents[uri]; // undefined for PDF or if not loaded yet

        if (fileExt === "pdf") {
          // Non-text, content isn't loaded a priori
          return <PdfDisplay uri={uri} onLoad={onPdfLoad} onFail={onPdfFail} />;
        } else if (fileExt === "docx") {
          return <DocxDisplay contents={fc} loading={loadingFileContents} />;
        } else if (CSV_LIKE_FILE_EXTENSIONS.includes(fileExt)) {
          return <CsvDisplay contents={fc} loading={loadingFileContents} />;
        } else if (["xls", "xlsx"].includes(fileExt)) {
          return <XlsxDisplay contents={fc} loading={loadingFileContents} />;
        } else if (AUDIO_FILE_EXTENSIONS.includes(fileExt)) {
          return <AudioDisplay contents={fc} loading={loadingFileContents} />;
        } else if (IMAGE_FILE_EXTENSIONS.includes(fileExt)) {
          return <ImageBlobDisplay alt={fileName} contents={fc} loading={loadingFileContents} />;
        } else if (VIDEO_FILE_EXTENSIONS.includes(fileExt)) {
          return <VideoDisplay contents={fc} loading={loadingFileContents} />;
        } else if (fileExt === "json") {
          return <WrappedJsonDisplay contents={fc} loading={loadingFileContents} />;
        } else if (fileExt === "html") {
          return <HtmlDisplay contents={fc} loading={loadingFileContents} />;
        } else {
          return <WrappedCodeDisplay contents={fc} fileExt={fileExt} loading={loadingFileContents} />;
        }
      })()}
    </Spin>
  );
};

export default FileDisplay;
