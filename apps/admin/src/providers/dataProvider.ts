import { fetchUtils, DataProvider } from "react-admin";

const apiUrl = "/api";

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token = localStorage.getItem("admin_token");
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  return fetchUtils.fetchJson(url, { ...options, headers });
};

// API 응답을 React Admin 형식으로 변환
const transformResponse = (response: any) => {
  if (response.data) {
    return response.data;
  }
  return response;
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const query = {
      page,
      limit: perPage,
      sort: field,
      order: order.toLowerCase(),
      ...params.filter,
    };

    const queryString = new URLSearchParams(
      Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      )
    ).toString();

    const url = `${apiUrl}/${resource}?${queryString}`;
    const { json } = await httpClient(url);

    const data = transformResponse(json);

    return {
      data: Array.isArray(data) ? data : data.data || [],
      total: json.pagination?.totalCount || data.length || 0,
    };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await httpClient(url);
    const data = transformResponse(json);

    return { data };
  },

  getMany: async (resource, params) => {
    const queries = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`).then(({ json }) =>
        transformResponse(json)
      )
    );
    const data = await Promise.all(queries);

    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const query = {
      page,
      limit: perPage,
      sort: field,
      order: order.toLowerCase(),
      [params.target]: params.id,
      ...params.filter,
    };

    const queryString = new URLSearchParams(
      Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      )
    ).toString();

    const url = `${apiUrl}/${resource}?${queryString}`;
    const { json } = await httpClient(url);
    const data = transformResponse(json);

    return {
      data: Array.isArray(data) ? data : data.data || [],
      total: json.pagination?.totalCount || data.length || 0,
    };
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    const { json } = await httpClient(url, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    const data = transformResponse(json);

    return { data: { ...params.data, id: data.id } };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    const data = transformResponse(json);

    return { data };
  },

  updateMany: async (resource, params) => {
    const queries = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(params.data),
      })
    );
    await Promise.all(queries);

    return { data: params.ids };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await httpClient(url, {
      method: "DELETE",
    });

    return { data: params.previousData as any };
  },

  deleteMany: async (resource, params) => {
    const queries = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "DELETE",
      })
    );
    await Promise.all(queries);

    return { data: params.ids };
  },
};
