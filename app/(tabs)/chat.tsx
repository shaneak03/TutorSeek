import React, { useContext } from "react";
import { AuthContext } from "../_layout";
import LoginModal from "../components/LoginModal";

const Chat = () => {
  const { user } = useContext(AuthContext);

  //get data and set it
  // const [datas, setData] = useState([]);

  if (!user) return <LoginModal />;
};

export default Chat;
