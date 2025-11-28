# API 문서

## 기본 정보

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

---

## 강아지 (Dogs) API

### 1. 모든 강아지 조회

모든 강아지 목록을 조회합니다.

**Endpoint**: `GET /api/dogs`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "뽀삐",
      "breed": "푸들",
      "note": "털이 많이 빠짐",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

### 2. 특정 강아지 조회

특정 강아지의 정보를 조회합니다.

**Endpoint**: `GET /api/dogs/:id`

**Parameters**:

- `id` (required): 강아지 ID

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "뽀삐",
    "breed": "푸들",
    "note": "털이 많이 빠짐",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 3. 강아지 상세 정보 조회 (예약 기록 포함)

특정 강아지의 정보와 예약 기록을 함께 조회합니다.

**Endpoint**: `GET /api/dogs/:id/appointments`

**Parameters**:

- `id` (required): 강아지 ID

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "뽀삐",
    "breed": "푸들",
    "note": "털이 많이 빠짐",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "appointments": [
      {
        "id": 1,
        "user_id": 1,
        "dog_id": 1,
        "grooming_type": "전체미용",
        "memo": "다리 털 짧게",
        "amount": 50000,
        "appointment_at": "2024-01-15T10:00:00.000Z",
        "status": "scheduled",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4. 사용자별 강아지 목록 조회

특정 사용자가 등록한 모든 강아지를 조회합니다.

**Endpoint**: `GET /api/dogs/user/:userId`

**Parameters**:

- `userId` (required): 사용자 ID

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "뽀삐",
      "breed": "푸들",
      "note": "털이 많이 빠짐",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

### 5. 새 강아지 등록

새로운 강아지를 등록합니다.

**Endpoint**: `POST /api/dogs`

**Request Body**:

```json
{
  "user_id": 1,
  "name": "뽀삐",
  "breed": "푸들",
  "note": "털이 많이 빠짐"
}
```

**Required Fields**:
