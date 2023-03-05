import { useContext } from "react";
import { UserInfo } from "../contexts/userInfo";

export default function useUserInfo() {
  return useContext(UserInfo);
}
