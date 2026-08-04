import ReactDOM from "react-dom/client";
import { Routes, Route, Navigate, BrowserRouter, useParams, useNavigate } from "react-router-dom";

import { Card, Layout, Tabs, TabsProps, Typography } from "antd";

import "antd/dist/reset.css";
import "../../src/style.css";

import TestAudio from "./TestAudio";
import TestCsv from "./TestCsv";
import TestDocx from "./TestDocx";
import TestHtml from "./TestHtml";
import TestImage from "./TestImage";
import TestJson from "./TestJson";
import TestMarkdown from "./TestMarkdown";
import TestPdf from "./TestPdf";
import TestVideo from "./TestVideo";
import TestXlsx from "./TestXlsx";

const items: TabsProps["items"] = [
  {
    key: "audio",
    label: "Audio",
    children: <TestAudio />,
  },
  {
    key: "csv",
    label: "CSV",
    children: <TestCsv />,
  },
  {
    key: "docx",
    label: ".docx",
    children: <TestDocx />,
  },
  {
    key: "html",
    label: "HTML",
    children: <TestHtml />,
  },
  {
    key: "image",
    label: "Image",
    children: <TestImage />,
  },
  {
    key: "json",
    label: "JSON",
    children: <TestJson />,
  },
  {
    key: "markdown",
    label: "Markdown",
    children: <TestMarkdown />,
  },
  {
    key: "pdf",
    label: "PDF",
    children: <TestPdf />,
  },
  {
    key: "video",
    label: "Video",
    children: <TestVideo />,
  },
  {
    key: "xlsx",
    label: ".xlsx",
    children: <TestXlsx />,
  },
];

const RoutedApp = () => {
  const navigate = useNavigate();
  const { tab } = useParams();

  return (
    <Layout>
      <Layout.Content style={{ padding: 24, height: "100vh", overflow: "auto" }}>
        <Card>
          <Typography.Title level={1} style={{ marginTop: 0 }}>
            Bento File Display Test App
          </Typography.Title>
          <Tabs items={items} activeKey={tab} onChange={(key) => navigate(`/${key}`)} />
        </Card>
      </Layout.Content>
    </Layout>
  );
};

const BentoFileDisplayTestApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:tab" element={<RoutedApp />} />
        <Route path="*" element={<Navigate to={`/${items[0].key}`} />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<BentoFileDisplayTestApp />);
