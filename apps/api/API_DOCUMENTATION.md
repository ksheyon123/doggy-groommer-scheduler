# API 문서

## 기본 정보

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

---

## 인증 (Authentication) API

### 인증 흐름

1. 프론트엔드에서 소셜 로그인 버튼 클릭
2. 해당 소셜 Provider의 인증 페이지로 리다이렉트
3. 사용자 인증 후 콜백 URL로 리다이렉트 (code 포함)
4. 프론트엔드에서 code를 백엔드로 전송
5. 백엔드에서 access token과 refresh token 발급
6. 프론트엔드에서 토큰을 localStorage에 저장

---

### 1. Google OAuth 콜백

Google OAuth 인증 후 콜백을 처리합니다.

**Endpoint**: `POST /api/auth/google/callback`

**Request Body**:

```json
{
  "code": "Google에서 받은 authorization code",
  "redirect_uri": "http://localhost:3000/auth/callback/google"
}
```

**Response**:

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "홍길동",
    "profileImage": "https://...",
    "provider": "google"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Kakao OAuth 콜백

Kakao OAuth 인증 후 콜백을 처리합니다.

**Endpoint**: `POST /api/auth/kakao/callback`

**Request Body**:

```json
{
  "code": "Kakao에서 받은 authorization code",
  "redirect_uri": "http://localhost:3000/auth/callback/kakao"
}
```

**Response**: Google과 동일

---

### 3. Naver OAuth 콜백

Naver OAuth 인증 후 콜백을 처리합니다.

**Endpoint**: `POST /api/auth/naver/callback`

**Request Body**:

```json
{
  "code": "Naver에서 받은 authorization code",
  "state": "CSRF 방지를 위한 state 값",
  "redirect_uri": "http://localhost:3000/auth/callback/naver"
}
```

**Response**: Google과 동일

---

### 4. 토큰 갱신

만료된 access token을 갱신합니다.

**Endpoint**: `POST /api/auth/refresh`

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
  "accessToken": "새로운 access token",
  "refreshToken": "새로운 refresh token"
}
```

---

### 5. 로그아웃

사용자를 로그아웃합니다.

**Endpoint**: `POST /api/auth/logout`

**Request Body**:

```json
{
  "userId": 1
}
```

**Response**:

```json
{
  "message": "Logged out successfully"
}
```

---

### 6. 현재 사용자 정보 조회

현재 로그인한 사용자 정보를 조회합니다. (인증 필요)

**Endpoint**: `GET /api/auth/me`

**Headers**:

```
Authorization: Bearer <accessToken>
```

**Response**:

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "홍길동",
    "profile_image": "https://...",
    "provider": "google",
    "shop_id": 1
  }
}
```

---

## ERD 구조

```
USER ||--o{ EMPLOYEE : "member of"
SHOP ||--o{ EMPLOYEE : "has members"
SHOP ||--o{ DOG : "owns"
SHOP ||--o{ GROOMING_APPOINTMENT : "owns"
DOG ||--o{ GROOMING_APPOINTMENT : "has"
USER ||--o{ GROOMING_APPOINTMENT : "created by"
USER ||--o{ DOG : "assigned to"
```

---

## 샵 (Shops) API

### 1. 모든 샵 조회

모든 샵 목록을 조회합니다.

**Endpoint**: `GET /api/shops`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "해피독 미용실",
      "address": "서울시 강남구 역삼동 123-45",
      "phone": "02-1234-5678",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. 특정 샵 조회

특정 샵의 정보와 직원 목록을 조회합니다.

**Endpoint**: `GET /api/shops/:id`

**Parameters**:

- `id` (required): 샵 ID

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "해피독 미용실",
    "address": "서울시 강남구 역삼동 123-45",
    "phone": "02-1234-5678",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "employees": [
      {
        "id": 1,
        "shop_id": 1,
        "user_id": 1,
        "role": "owner",
        "user": {
          "id": 1,
          "username": "john_doe",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

---

### 3. 새 샵 등록

새로운 샵을 등록합니다.

**Endpoint**: `POST /api/shops`

**Request Body**:

```json
{
  "name": "해피독 미용실",
  "address": "서울시 강남구 역삼동 123-45",
  "phone": "02-1234-5678"
}
```

**Required Fields**:

- `name`: 샵 이름

**Optional Fields**:

- `address`: 주소
- `phone`: 전화번호

---

### 4. 샵 정보 수정

샵 정보를 수정합니다.

**Endpoint**: `PUT /api/shops/:id`

**Request Body**:

```json
{
  "name": "해피독 미용실 강남점",
  "address": "서울시 강남구 역삼동 456-78",
  "phone": "02-9876-5432"
}
```

---

### 5. 샵 삭제

샵을 삭제합니다. (직원이 있는 경우 삭제 불가)

**Endpoint**: `DELETE /api/shops/:id`

---

## 직원 (Employees) API

### 1. 샵별 직원 목록 조회

특정 샵의 직원 목록을 조회합니다.

**Endpoint**: `GET /api/employees/shop/:shopId`

**Parameters**:

- `shopId` (required): 샵 ID

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shop_id": 1,
      "user_id": 1,
      "role": "owner",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
      },
      "shop": {
        "id": 1,
        "name": "해피독 미용실"
      }
    }
  ]
}
```

---

### 2. 특정 직원 조회

특정 직원의 정보를 조회합니다.

**Endpoint**: `GET /api/employees/:id`

---

### 3. 사용자가 속한 샵 목록 조회

특정 사용자가 속한 모든 샵을 조회합니다.

**Endpoint**: `GET /api/employees/user/:userId/shops`

**Parameters**:

- `userId` (required): 사용자 ID

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "해피독 미용실",
      "address": "서울시 강남구 역삼동 123-45",
      "phone": "02-1234-5678",
      "role": "owner",
      "employee_id": 1
    }
  ]
}
```

---

### 4. 직원 추가

샵에 새로운 직원을 등록합니다.

**Endpoint**: `POST /api/employees`

**Request Body**:

```json
{
  "shop_id": 1,
  "user_id": 1,
  "role": "staff"
}
```

**Required Fields**:

- `shop_id`: 샵 ID
- `user_id`: 사용자 ID

**Optional Fields**:

- `role`: 역할 (기본값: "staff")

---

### 5. 직원 역할 수정

직원의 역할을 수정합니다.

**Endpoint**: `PUT /api/employees/:id`

**Request Body**:

```json
{
  "role": "manager"
}
```

---

### 6. 직원 삭제

샵에서 직원을 제거합니다.

**Endpoint**: `DELETE /api/employees/:id`

---

## 강아지 (Dogs) API

### 1. 모든 강아지 조회

모든 강아지 목록을 조회합니다. (쿼리로 shopId 필터 가능)

**Endpoint**: `GET /api/dogs`

**Query Parameters**:

- `shopId` (optional): 샵 ID로 필터링

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shop_id": 1,
      "assigned_user_id": 1,
      "name": "뽀삐",
      "breed": "푸들",
      "note": "털이 많이 빠짐",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "shop": {
        "id": 1,
        "name": "해피독 미용실"
      },
      "assignedUser": {
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

---

### 3. 강아지 상세 정보 조회 (예약 기록 포함)

특정 강아지의 정보와 예약 기록을 함께 조회합니다.

**Endpoint**: `GET /api/dogs/:id/appointments`

---

### 4. 샵별 강아지 목록 조회

특정 샵에 등록된 모든 강아지를 조회합니다.

**Endpoint**: `GET /api/dogs/shop/:shopId`

**Parameters**:

- `shopId` (required): 샵 ID

---

### 5. 담당자별 강아지 목록 조회

특정 담당자에게 배정된 모든 강아지를 조회합니다.

**Endpoint**: `GET /api/dogs/assigned-user/:userId`

**Parameters**:

- `userId` (required): 담당자 사용자 ID

---

### 6. 새 강아지 등록

새로운 강아지를 등록합니다.

**Endpoint**: `POST /api/dogs`

**Request Body**:

```json
{
  "shop_id": 1,
  "assigned_user_id": 1,
  "name": "뽀삐",
  "breed": "푸들",
  "note": "털이 많이 빠짐"
}
```

**Required Fields**:

- `shop_id`: 샵 ID
- `name`: 강아지 이름

**Optional Fields**:

- `assigned_user_id`: 담당자 사용자 ID
- `breed`: 견종
- `note`: 메모

---

### 7. 강아지 정보 수정

강아지 정보를 수정합니다.

**Endpoint**: `PUT /api/dogs/:id`

**Request Body**:

```json
{
  "assigned_user_id": 2,
  "name": "뽀삐",
  "breed": "토이푸들",
  "note": "알러지 있음"
}
```

---

### 8. 강아지 삭제

강아지를 삭제합니다. (예약이 있는 경우 삭제 불가)

**Endpoint**: `DELETE /api/dogs/:id`

---

## 미용 예약 (Grooming Appointments) API

### 1. 모든 예약 조회

모든 예약 목록을 조회합니다. (쿼리로 shopId 필터 가능)

**Endpoint**: `GET /api/appointments`

**Query Parameters**:

- `shopId` (optional): 샵 ID로 필터링

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shop_id": 1,
      "dog_id": 1,
      "created_by_user_id": 1,
      "grooming_type": "전체미용",
      "memo": "다리 털 짧게",
      "amount": 50000,
      "appointment_at": "2024-01-15T10:00:00.000Z",
      "status": "scheduled",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "shop": {
        "id": 1,
        "name": "해피독 미용실"
      },
      "createdByUser": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
      },
      "dog": {
        "id": 1,
        "name": "뽀삐",
        "breed": "푸들"
      }
    }
  ]
}
```

---

### 2. 특정 예약 조회

특정 예약의 정보를 조회합니다.

**Endpoint**: `GET /api/appointments/:id`

---

### 3. 샵별 예약 조회

특정 샵의 모든 예약을 조회합니다.

**Endpoint**: `GET /api/appointments/shop/:shopId`

**Parameters**:

- `shopId` (required): 샵 ID

---

### 4. 강아지별 예약 조회

특정 강아지의 모든 예약을 조회합니다.

**Endpoint**: `GET /api/appointments/dog/:dogId`

**Parameters**:

- `dogId` (required): 강아지 ID

---

### 5. 생성자별 예약 조회

특정 사용자가 생성한 모든 예약을 조회합니다.

**Endpoint**: `GET /api/appointments/created-by/:userId`

**Parameters**:

- `userId` (required): 생성자 사용자 ID

---

### 6. 새 예약 생성

새로운 예약을 생성합니다.

**Endpoint**: `POST /api/appointments`

**Request Body**:

```json
{
  "shop_id": 1,
  "dog_id": 1,
  "created_by_user_id": 1,
  "grooming_type": "전체미용",
  "memo": "다리 털 짧게",
  "amount": 50000,
  "appointment_at": "2024-01-15T10:00:00.000Z",
  "status": "scheduled"
}
```

**Required Fields**:

- `shop_id`: 샵 ID
- `dog_id`: 강아지 ID
- `created_by_user_id`: 예약 생성자 ID

**Optional Fields**:

- `grooming_type`: 미용 유형
- `memo`: 메모
- `amount`: 금액
- `appointment_at`: 예약 일시
- `status`: 상태 (기본값: "scheduled")

---

### 7. 예약 수정

예약 정보를 수정합니다.

**Endpoint**: `PUT /api/appointments/:id`

**Request Body**:

```json
{
  "grooming_type": "부분미용",
  "memo": "발바닥만",
  "amount": 30000,
  "appointment_at": "2024-01-16T14:00:00.000Z",
  "status": "completed"
}
```

---

### 8. 예약 삭제

예약을 삭제합니다.

**Endpoint**: `DELETE /api/appointments/:id`

---

## 에러 응답

모든 API는 에러 발생 시 다음 형식으로 응답합니다:

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 내용"
}
```

**HTTP 상태 코드**:

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청 (필수 필드 누락 등)
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 에러
