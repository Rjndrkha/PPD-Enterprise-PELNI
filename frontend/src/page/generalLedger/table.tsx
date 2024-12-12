import React, { useEffect, useRef, useState } from "react";
import { greenDark } from '@ant-design/colors';
import { SearchOutlined } from "@ant-design/icons";
import type { GetRef, TableColumnsType, TableColumnType } from "antd";
import { Button, Input, Space, Table, message } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import Cookies from "js-cookie";
import EbsClient from "../../service/ebs/OracleClient";
import { ITableGeneralLedger } from "../../interface/ITableGeneralLedger";
import ButtonDefault from "../../component/button/button";
import { downloadExcelFile } from "../../utils/excelUtils";

type InputRef = GetRef<typeof Input>;
type DataIndex = keyof ITableGeneralLedger;

const TableGeneralLedger: React.FC = () => {
  const [dataInput, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const token = Cookies.get("token");

  useEffect(() => {
    fetchGeneralLedgerData();
  }, []);

  const fetchGeneralLedgerData = async () => {
    setLoading(true);
    const token = Cookies.get("token") || "";

    const { response, error } = await EbsClient.GetGeneralLedgerStatus({}, token);

    if (error) {
      message.error("Gagal mengambil data General Ledger");
      setLoading(false);
      return;
    }

    if (response.rows) {
      setData(response.rows);
    }

    setLoading(false);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleButtonStatus = (status: string, job_id: Number) => {
    const statusMap: { [key: string]: JSX.Element } = {
      Completed: (
        <Button
          type="primary"
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          onClick={async () => await handleDownload(job_id)}
        >
          Download
        </Button>
      ),
      pending: <ButtonDefault text="Pending" loading={true} />,
      active: <ButtonDefault text="Active" loading={true} />,
      failed: (
        <Button type="primary" danger>
          Failed
        </Button>
      ),
    };

    return statusMap[status] || status;
  };

  const handleDownload = async (job_id: Number) => {
    console.log(job_id, "clicked");
    const data = await EbsClient.GetGeneralLedgerDownload(job_id, token || "");

    if (data.error) {
      message.error("Gagal mendownload data");
      return;
    }

    if (data.response) {
      console.log(dataInput, "dataInput");
      downloadExcelFile(data.response.data.data, dataInput[0]);
    } else {
      message.error("Data tidak tersedia");
    }
  };

  const handleReset = (
    clearFilters: () => void,
    confirm: FilterDropdownProps["confirm"]
  ) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<ITableGeneralLedger> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.focus(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const columns: TableColumnsType<ITableGeneralLedger> = [
    {
      title: "Job Id",
      dataIndex: "job_id",
      key: "job_id",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (text) => formatDate(text),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (text) => formatDate(text),
    },
    {
      title: "With Adjustment",
      dataIndex: "with_adjustment",
      key: "with_adjustment",
    },
    {
      title: "With Company",
      dataIndex: "with_company",
      key: "with_company",
    },
    {
      title: "Id Company",
      dataIndex: "id_company",
      key: "id_company",
    },
    {
      title: "With Account",
      dataIndex: "with_account",
      key: "with_account",
    },
    {
      title: "Id Account",
      dataIndex: "id_account",
      key: "id_account",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => handleButtonStatus(text, Number(record.job_id)),
    },
  ];

  return (
    <div className="flex flex-col item-center gap-3">
      <div className="flex item-center gap-3">
        <label htmlFor="title" className="text-base font-semibold">
          Tabel Riwayat Penarikan Data
        </label>
        <ButtonDefault text="Refresh" onClick={fetchGeneralLedgerData} />
      </div>
      <Table
        columns={columns}
        dataSource={dataInput}
        loading={loading}
        pagination={{ pageSize: 5 }}
        rowKey="JOB_ID"
      />
    </div>
  );
};

export default TableGeneralLedger;