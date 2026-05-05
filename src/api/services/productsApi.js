import { baseApi } from '../base/baseApi';

/**
 * Products API (RTK Query)
 *   GET /api/products -> getProducts()
 */
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({ url: '/products', method: 'GET' }),
      providesTags: ['Product'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductsQuery } = productsApi;
