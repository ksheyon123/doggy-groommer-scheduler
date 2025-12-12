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
  ReferenceField,
  ReferenceInput,
  SelectInput,
  required,
} from "react-admin";

// Dog List
export const DogList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="name" label="이름" />
      <TextField source="breed" label="견종" />
      <TextField source="owner_name" label="보호자명" />
      <TextField source="owner_phone_number" label="보호자 연락처" />
      <ReferenceField source="shop_id" reference="shops" label="샵">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="created_at" label="등록일" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Dog Edit
export const DogEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="이름" validate={required()} />
      <TextInput source="breed" label="견종" />
      <TextInput source="owner_name" label="보호자명" />
      <TextInput source="owner_phone_number" label="보호자 연락처" />
      <ReferenceInput source="shop_id" reference="shops" label="샵">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <TextInput source="note" label="메모" multiline rows={4} />
    </SimpleForm>
  </Edit>
);

// Dog Create
export const DogCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="이름" validate={required()} />
      <TextInput source="breed" label="견종" />
      <TextInput source="owner_name" label="보호자명" />
      <TextInput source="owner_phone_number" label="보호자 연락처" />
      <ReferenceInput source="shop_id" reference="shops" label="샵">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
      <TextInput source="note" label="메모" multiline rows={4} />
    </SimpleForm>
  </Create>
);

// Dog Show
export const DogShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="이름" />
      <TextField source="breed" label="견종" />
      <TextField source="owner_name" label="보호자명" />
      <TextField source="owner_phone_number" label="보호자 연락처" />
      <ReferenceField source="shop_id" reference="shops" label="샵">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="note" label="메모" />
      <DateField source="created_at" label="등록일" showTime />
      <DateField source="updated_at" label="수정일" showTime />
    </SimpleShowLayout>
  </Show>
);
