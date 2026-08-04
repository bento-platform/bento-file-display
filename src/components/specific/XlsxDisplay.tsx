import { useCallback, useMemo, useState } from "react";

import { read, utils, type WorkBook } from "xlsx";
import { Card } from "antd";

import SpreadsheetTable, { SPREADSHEET_ROW_KEY_PROP, type SpreadsheetTableProps } from "./SpreadsheetTable";
import type { BlobDisplayProps } from "./types";

type XlsxRecord = Record<string, string>;
type XlsxData = XlsxRecord[];
type XlsxColumns = SpreadsheetTableProps<XlsxRecord>["columns"];

const XlsxDisplay = ({ contents, loading }: BlobDisplayProps) => {
  const [lastContents, setLastContents] = useState<Blob | undefined>(undefined);

  const [excelFile, setExcelFile] = useState<WorkBook | null>(null);
  const [reading, setReading] = useState(false);

  const [selectedSheet, setSelectedSheet] = useState<string | undefined>(undefined);
  const [sheetColumns, setSheetColumns] = useState<XlsxColumns>([]);
  const [sheetJSON, setSheetJSON] = useState<XlsxData>([]);

  const handleNewSheet = useCallback((ef: WorkBook | null, sheet: string) => {
    if (!ef) return;

    const json: object[] = utils.sheet_to_json(ef.Sheets[sheet]);
    if (json.length === 0) return;

    const columnSet = new Set();
    const columns: XlsxColumns = [];

    // explore first 30 rows to find all columns
    json.slice(0, 30).forEach((row) => {
      Object.keys(row).forEach((c) => {
        if (columnSet.has(c)) return;
        columnSet.add(c);
        columns.push({
          title: c.startsWith("__") ? "" : c,
          dataIndex: c,
        });
      });
    });

    setSelectedSheet(sheet);
    setSheetColumns(columns);
    setSheetJSON(json.map((r, i) => ({ ...r, [SPREADSHEET_ROW_KEY_PROP]: `row${i}` })));
  }, []);

  if (contents && contents !== lastContents && !reading) {
    setLastContents(contents);
    setReading(true);
    contents
      .arrayBuffer()
      .then((ab) => {
        const ef = read(ab);
        setExcelFile(ef);
        handleNewSheet(ef, ef.SheetNames[0]); // reset selected sheet to first sheet of newly-loaded file
      })
      .finally(() => setReading(false));
  }

  const tabs = useMemo(() => (excelFile?.SheetNames ?? []).map((s) => ({ key: s, label: s })), [excelFile]);
  const onTabChange = useCallback((sheet: string) => handleNewSheet(excelFile, sheet), [excelFile, handleNewSheet]);
  const showHeader = useMemo(() => sheetColumns.reduce((acc, v) => acc || v.title !== "", false), [sheetColumns]);

  return (
    <Card tabList={tabs} activeTabKey={selectedSheet} onTabChange={onTabChange}>
      <SpreadsheetTable<XlsxRecord>
        columns={sheetColumns}
        dataSource={sheetJSON}
        showHeader={showHeader}
        loading={loading || reading}
      />
    </Card>
  );
};

export default XlsxDisplay;
