import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import TextInput from "../../component/input/textInput";
import ButtonDefault from "../../component/button/button";
import { IAuth } from "../../interface/IAuth";
import { useAuthentificationStore } from "../../store/useAuthentificationStore";
import Cookies from "js-cookie";
import PortalClient from "../../service/portal/PortalClient";

function Login() {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [authentification, setAuthentification] = useState<IAuth>({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const { authentification: auth, login: actionLogin } = useAuthentificationStore();

  const login = async (e: any) => {
    e.preventDefault();
    setIsSubmit(true);

    const { response, error } = await PortalClient.GetLogin({
      username: authentification.username,
      password: authentification.password,
    });

    if (response && response.token) {
      Cookies.set("nama", response.nama);
      Cookies.set("token", response.token, {
        expires: 5 / 24, //5 jam
      });
      navigate("/");
    } else {
      message.error("Login gagal, periksa kembali username dan password!");
      setIsSubmit(false);
    }
  };

  return (
    <div className="w-auto h-screen bg-gradient-to-br from-cyan-200 to-blue-300 overflow-hidden">
      <div className="flex flex-col items-center justify-center md:h-full">
        <div className="flex flex-row md:gap-10 items-center">
          <div className="hidden md:block w-full max-w-2xl">
            <div className="flex flex-col items-center justify-center">
              <h1 className="font-semibold text-3xl mt-5">
                General Ledger Portal
              </h1>
              <p className="text-lg">
                Data Extraction System IT Division PELNI
              </p>
            </div>
          </div>

          <form onSubmit={login}>
            <div className="flex flex-col gap-3 items-center justify-start md:justify-center p-5 rounded-3xl md:rounded-xl bg-white w-screen md:w-96 h-screen md:h-[20rem]">
              <h1 className="font-semibold">Login</h1>

              <div className="w-full">
                <p className="text-sm font-semibold">Username</p>
                <TextInput
                  value={authentification.username}
                  onChange={(e) =>
                    setAuthentification({
                      ...authentification,
                      username: e.toString(),
                    })
                  }
                  placeholder={"Username"}
                  isSubmit={isSubmit}
                  required
                />
              </div>
              <div className="w-full">
                <p className="text-sm font-semibold">Password</p>
                <TextInput
                  type={"password"}
                  value={authentification.password}
                  onChange={(e) =>
                    setAuthentification({
                      ...authentification,
                      password: e.toString(),
                    })
                  }
                  isSubmit={isSubmit}
                  required
                />
              </div>

              <ButtonDefault
                text={"Masuk"}
                onClick={() => setIsSubmit(true)}
                htmlType={"submit"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;