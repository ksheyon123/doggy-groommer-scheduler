import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  ShowButton,
  Show,
  SimpleShowLayout,
  ImageField,
} from "react-admin";

// User List
export const UserList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="name" label="이름" />
      <EmailField source="email" label="이메일" />
      <TextField source="provider" label="인증 제공자" />
      <DateField source="created_at" label="가입일" />
      <ShowButton />
    </Datagrid>
  </List>
);

// User Show
export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="이름" />
      <EmailField source="email" label="이메일" />
      <TextField source="provider" label="인증 제공자" />
      <ImageField source="profile_image" label="프로필 이미지" />
      <DateField source="created_at" label="가입일" showTime />
      <DateField source="updated_at" label="수정일" showTime />
    </SimpleShowLayout>
  </Show>
);
