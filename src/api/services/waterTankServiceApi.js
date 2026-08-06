import { baseApi } from '../base/baseApi';

/**
 * Water Tank Cleaning Service & Booking API Service (RTK Query)
 *
 * Endpoints:
 *  WaterTankServices:
 *    GET  /api/watertank-services              -> getWaterTankServices(params)
 *    GET  /api/watertank-services/popular      -> getPopularWaterTankServices()
 *    GET  /api/watertank-services/category/:c  -> getWaterTankServicesByCategory(category)
 *    GET  /api/watertank-services/:id          -> getWaterTankServiceById(id)
 *
 *  WaterTankBookings:
 *    POST /api/watertank-bookings              -> createWaterTankBooking(WaterTankBookingCreateDTOs)
 *    GET  /api/watertank-bookings/my-bookings  -> getMyWaterTankBookings()
 *    GET  /api/watertank-bookings/:id          -> getWaterTankBookingById(id)
 *    POST /api/watertank-bookings/:id/cancel   -> cancelWaterTankBooking(id)
 *    POST /api/watertank-bookings/:id/status   -> updateWaterTankBookingStatus({ id, status })
 */
export const waterTankServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =====================================================
       WATER TANK SERVICES — Queries
    ====================================================== */

    getWaterTankServices: builder.query({
      query: (params = {}) => ({
        url: '/watertank-services',
        method: 'GET',
        params,
      }),
      providesTags: ['WaterTankService'],
    }),

    getPopularWaterTankServices: builder.query({
      query: () => ({
        url: '/watertank-services/popular',
        method: 'GET',
      }),
      providesTags: ['WaterTankService'],
    }),

    getWaterTankServicesByCategory: builder.query({
      query: (category) => ({
        url: `/watertank-services/category/${encodeURIComponent(category)}`,
        method: 'GET',
      }),
      providesTags: ['WaterTankService'],
    }),

    getWaterTankServiceById: builder.query({
      query: (id) => ({
        url: `/watertank-services/${id}`,
        method: 'GET',
      }),
      providesTags: ['WaterTankService'],
    }),

    /* =====================================================
       WATER TANK BOOKINGS — Mutations
    ====================================================== */

    createWaterTankBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/watertank-bookings',
        method: 'POST',
        body: bookingData,
      }),
      transformResponse: (/** @type {any} */ response) => {
        console.log('📦 createWaterTankBooking raw response:', JSON.stringify(response, null, 2));
        return {
          success: response.success,
          message: response.message,
          bookingId: response.data?.bookingId,
          id: response.data?.id,
          status: response.data?.status,
          scheduledDate: response.data?.scheduledDate,
          scheduledTime: response.data?.scheduledTime,
          totalAmount: response.data?.totalAmount,
          data: response.data,
        };
      },
      invalidatesTags: ['WaterTankBooking'],
    }),

    cancelWaterTankBooking: builder.mutation({
      query: (id) => ({
        url: `/watertank-bookings/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['WaterTankBooking'],
    }),

    updateWaterTankBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/watertank-bookings/${id}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['WaterTankBooking'],
    }),

    /* =====================================================
       WATER TANK BOOKINGS — Queries
    ====================================================== */

    getMyWaterTankBookings: builder.query({
      query: () => ({
        url: '/watertank-bookings/my-bookings',
        method: 'GET',
      }),
      providesTags: ['WaterTankBooking'],
    }),

    getWaterTankBookingById: builder.query({
      query: (id) => ({
        url: `/watertank-bookings/${id}`,
        method: 'GET',
      }),
      providesTags: ['WaterTankBooking'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetWaterTankServicesQuery,
  useGetPopularWaterTankServicesQuery,
  useGetWaterTankServicesByCategoryQuery,
  useGetWaterTankServiceByIdQuery,
  useGetMyWaterTankBookingsQuery,
  useGetWaterTankBookingByIdQuery,
  useCreateWaterTankBookingMutation,
  useCancelWaterTankBookingMutation,
  useUpdateWaterTankBookingStatusMutation,
} = waterTankServiceApi;

export const waterTankServiceEndpoints = waterTankServiceApi.endpoints;
