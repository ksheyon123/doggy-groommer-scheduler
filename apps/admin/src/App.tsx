import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";

// Resources
import { ShopList, ShopEdit, ShopCreate, ShopShow } from "./resources/shops";
import { UserList, UserShow } from "./resources/users";
import { DogList, DogEdit, DogCreate, DogShow } from "./resources/dogs";
import {
  AppointmentList,
  AppointmentEdit,
  AppointmentCreate,
  AppointmentShow,
} from "./resources/appointments";

// Icons
import StoreIcon from "@mui/icons-material/Store";
import PeopleIcon from "@mui/icons-material/People";
import PetsIcon from "@mui/icons-material/Pets";
import EventIcon from "@mui/icons-material/Event";

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    title="Dog Groomer Admin"
  >
    <Resource
      name="shops"
      list={ShopList}
      edit={ShopEdit}
      create={ShopCreate}
      show={ShopShow}
      icon={StoreIcon}
      options={{ label: "샵 관리" }}
    />
    <Resource
      name="users"
      list={UserList}
      show={UserShow}
      icon={PeopleIcon}
      options={{ label: "사용자 관리" }}
    />
    <Resource
      name="dogs"
      list={DogList}
      edit={DogEdit}
      create={DogCreate}
      show={DogShow}
      icon={PetsIcon}
      options={{ label: "강아지 관리" }}
    />
    <Resource
      name="appointments"
      list={AppointmentList}
      edit={AppointmentEdit}
      create={AppointmentCreate}
      show={AppointmentShow}
      icon={EventIcon}
      options={{ label: "예약 관리" }}
    />
  </Admin>
);

export default App;
