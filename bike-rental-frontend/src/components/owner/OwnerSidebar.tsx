import Sidebar from "../layouts/Sidebar/Sidebar";
import { OWNER_SIDEBAR } from "../../constants/navigation";

export default function OwnerSidebar() {
  return <Sidebar sections={OWNER_SIDEBAR} />;
}
