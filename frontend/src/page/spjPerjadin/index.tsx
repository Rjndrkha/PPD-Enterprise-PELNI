import React, { useEffect } from "react";
import TablePerjalananDinas from "./table";
import TextInput from "../../component/input/textInput";
import ButtonDefault from "../../component/button/button";
import { message } from "antd";

function IndexCheckSPJ() {
  const [nama, setNama] = React.useState<string>("");
  const [isSubmit, setSubmit] = React.useState<boolean>(false);
  const [validate, setValidate] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);  
  const [error, setError] = React.useState<string>("");

  useEffect(() => {
    setValidate(false);
    setError("");
  }, [nama]);

  const handleSearch = () => {
    const nameRegex = /^[^\s]+$/; 

    if (!nama) {
      setSubmit(true);
      setError("Please fill this field!");
    } else if (!nameRegex.test(nama)) {
      message.error("Input nama hanya boleh satu kata");
    } else {
      setError("");
      setValidate(true);
      setSubmit(false);
      setLoading(true);

      const loadingTime = 2000;
      setTimeout(() => {
        setLoading(false);  
      }, loadingTime);
    }
  };

  return (
    <div className="w-auto h-full flex flex-col gap-3 m-5">
      <h1>Cek Status SPJ Perjalanan Dinas</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="flex flex-col gap-2 max-w-[50rem]">
          <label htmlFor="title" className="mb-1 text-base font-semibold">
            Nama
          </label>
          <div className="flex items-center gap-2" style={{ width: "60%" }}>
            <TextInput
              placeholder="Masukan Nama"
              value={nama}
              onChange={(value) => setNama(value)}
              required
            />
            <ButtonDefault
              text="Cari"
              onClick={handleSearch}
              htmlType="submit"
              width="30%"
              loading={loading}
            />
          </div>
        </div>
      </form>

      {validate && <TablePerjalananDinas nama={nama} />}
    </div>
  );
}

export default IndexCheckSPJ;
