import { baseApi } from '../base/baseApi';

/**
 * Plumbing Service & Booking API Service (RTK Query)
 *
 * Endpoints:
 *  PlumbingServices:
 *    GET  /api/plumbing-services              -> getPlumbingServices(params)
 *    GET  /api/plumbing-services/popular      -> getPopularPlumbingServices()
 *    GET  /api/plumbing-services/category/:c  -> getPlumbingServicesByCategory(category)
 *    GET  /api/plumbing-services/:id          -> getPlumbingServiceById(id)
 *
 *  PlumbingBookings:
 *    POST /api/plumbing-bookings              -> createPlumbingBooking(PlumbingBookingCreateDTOs)
 *    GET  /api/plumbing-bookings/my-bookings  -> getMyPlumbingBookings()
 *    GET  /api/plumbing-bookings/:id          -> getPlumbingBookingById(id)
 *    POST /api/plumbing-bookings/:id/cancel   -> cancelPlumbingBooking(id)
 *    POST /api/plumbing-bookings/:id/status   -> updatePlumbingBookingStatus({ id, status })
 */
export const plumbingServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =====================================================
       PLUMBING SERVICES — Queries
    ====================================================== */

    getPlumbingServices: builder.query({
      query: (params = {}) => ({
        url: '/plumbing-services',
        method: 'GET',
        params,
      }),
      providesTags: ['PlumbingService'],
    }),

    getPopularPlumbingServices: builder.query({
      query: () => ({
        url: '/plumbing-services/popular',
        method: 'GET',
      }),
      providesTags: ['PlumbingService'],
    }),

    getPlumbingServicesByCategory: builder.query({
      query: (category) => ({
        url: `/plumbing-services/category/${encodeURIComponent(category)}`,
        method: 'GET',
      }),
      providesTags: ['PlumbingService'],
    }),

    getPlumbingServiceById: builder.query({
      query: (id) => ({
        url: `/plumbing-services/${id}`,
        method: 'GET',
      }),
      providesTags: ['PlumbingService'],
    }),

    /* =====================================================
       PLUMBING BOOKINGS — Mutations
    ====================================================== */

    createPlumbingBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/plumbing-bookings',
        method: 'POST',
        body: bookingData,
      }),
      transformResponse: (/** @type {any} */ response) => {
        console.log('📦 createPlumbingBooking raw response:', JSON.stringify(response, null, 2));
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
      invalidatesTags: ['PlumbingBooking'],
    }),

    cancelPlumbingBooking: builder.mutation({
      query: (id) => ({
        url: `/plumbing-bookings/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['PlumbingBooking'],
    }),

    updatePlumbingBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/plumbing-bookings/${id}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['PlumbingBooking'],
    }),

    /* =====================================================
       PLUMBING BOOKINGS — Queries
    ====================================================== */

    getMyPlumbingBookings: builder.query({
      query: () => ({
        url: '/plumbing-bookings/my-bookings',
        method: 'GET',
      }),
      providesTags: ['PlumbingBooking'],
    }),

    getPlumbingBookingById: builder.query({
      query: (id) => ({
        url: `/plumbing-bookings/${id}`,
        method: 'GET',
      }),
      providesTags: ['PlumbingBooking'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetPlumbingServicesQuery,
  useGetPopularPlumbingServicesQuery,
  useGetPlumbingServicesByCategoryQuery,
  useGetPlumbingServiceByIdQuery,
  useGetMyPlumbingBookingsQuery,
  useGetPlumbingBookingByIdQuery,
  useCreatePlumbingBookingMutation,
  useCancelPlumbingBookingMutation,
  useUpdatePlumbingBookingStatusMutation,
} = plumbingServiceApi;

export const plumbingServiceEndpoints = plumbingServiceApi.endpoints;
