import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  Show,
  SimpleShowLayout,
  required,
} from "react-admin";

// Shop List
export const ShopList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="name" label="이름" />
      <TextField source="address" label="주소" />
      <TextField source="phone" label="전화번호" />
      <DateField source="created_at" label="생성일" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Shop Edit
export const ShopEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="이름" validate={required()} />
      <TextInput source="address" label="주소" />
      <TextInput source="phone" label="전화번호" />
    </SimpleForm>
  </Edit>
);

// Shop Create
export const ShopCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="이름" validate={required()} />
      <TextInput source="address" label="주소" />
      <TextInput source="phone" label="전화번호" />
    </SimpleForm>
  </Create>
);

// Shop Show
export const ShopShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="이름" />
      <TextField source="address" label="주소" />
      <TextField source="phone" label="전화번호" />
      <DateField source="created_at" label="생성일" showTime />
      <DateField source="updated_at" label="수정일" showTime />
    </SimpleShowLayout>
  </Show>
);
