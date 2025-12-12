import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  EditButton,
  ShowButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateTimeInput,
  Show,
  SimpleShowLayout,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  required,
} from "react-admin";

const statusChoices = [
  { id: "scheduled", name: "예약됨" },
  { id: "in_progress", name: "진행중" },
  { id: "completed", name: "완료" },
  { id: "cancelled", name: "취소됨" },
];

// Appointment List
export const AppointmentList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <ReferenceField source="dog_id" reference="dogs" label="강아지">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="shop_id" reference="shops" label="샵">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="grooming_type" label="미용 유형" />
      <NumberField
        source="amount"
        label="금액"
        options={{ style: "currency", currency: "KRW" }}
      />
      <DateField source="appointment_at" label="예약일시" showTime />
      <TextField source="status" label="상태" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Appointment Edit
export const AppointmentEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <ReferenceInput source="dog_id" reference="dogs" label="강아지">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="shop_id" reference="shops" label="샵">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <TextInput source="grooming_type" label="미용 유형" />
      <NumberInput source="amount" label="금액" />
      <DateTimeInput source="appointment_at" label="예약일시" />
      <TextInput source="start_time" label="시작 시간" />
      <TextInput source="end_time" label="종료 시간" />
      <SelectInput source="status" label="상태" choices={statusChoices} />
      <TextInput source="memo" label="메모" multiline rows={4} />
    </SimpleForm>
  </Edit>
);

// Appointment Create
export const AppointmentCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="dog_id" reference="dogs" label="강아지">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
      <ReferenceInput source="shop_id" reference="shops" label="샵">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
      <TextInput source="grooming_type" label="미용 유형" />
      <NumberInput source="amount" label="금액" />
      <DateTimeInput source="appointment_at" label="예약일시" />
      <TextInput source="start_time" label="시작 시간" />
      <TextInput source="end_time" label="종료 시간" />
      <SelectInput
        source="status"
        label="상태"
        choices={statusChoices}
        defaultValue="scheduled"
      />
      <TextInput source="memo" label="메모" multiline rows={4} />
    </SimpleForm>
  </Create>
);

// Appointment Show
export const AppointmentShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <ReferenceField source="dog_id" reference="dogs" label="강아지">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="shop_id" reference="shops" label="샵">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField
        source="created_by_user_id"
        reference="users"
        label="생성자"
      >
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField
        source="assigned_user_id"
        reference="users"
        label="담당자"
      >
        <TextField source="name" />
      </ReferenceField>
      <TextField source="grooming_type" label="미용 유형" />
      <NumberField
        source="amount"
        label="금액"
        options={{ style: "currency", currency: "KRW" }}
      />
      <DateField source="appointment_at" label="예약일시" showTime />
      <TextField source="start_time" label="시작 시간" />
      <TextField source="end_time" label="종료 시간" />
      <TextField source="status" label="상태" />
      <TextField source="memo" label="메모" />
      <DateField source="created_at" label="생성일" showTime />
      <DateField source="updated_at" label="수정일" showTime />
    </SimpleShowLayout>
  </Show>
);
