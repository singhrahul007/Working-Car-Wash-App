import { baseApi } from '../base/baseApi';

/**
 * Sofa Cleaning Service & Booking API Service (RTK Query)
 *
 * Endpoints:
 *  SofaServices:
 *    GET  /api/sofa-services              -> getSofaServices(params: { Category?, IsPopular? })
 *    GET  /api/sofa-services/popular      -> getPopularSofaServices()
 *    GET  /api/sofa-services/category/:c  -> getSofaServicesByCategory(category)
 *    GET  /api/sofa-services/:id          -> getSofaServiceById(id)
 *
 *  SofaBookings:
 *    POST /api/sofa-bookings              -> createSofaBooking(SofaBookingCreateDTOs)
 *    GET  /api/sofa-bookings/my-bookings  -> getMySofaBookings()
 *    GET  /api/sofa-bookings/:id          -> getSofaBookingById(id)
 *    POST /api/sofa-bookings/:id/cancel   -> cancelSofaBooking(id)
 *    POST /api/sofa-bookings/:id/status   -> updateSofaBookingStatus({ id, status })
 */
export const sofaServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =====================================================
       SOFA SERVICES — Queries
    ====================================================== */

    /** Fetch all sofa cleaning services. Optional filter: Category (string), IsPopular (bool) */
    getSofaServices: builder.query({
      query: (params = {}) => ({
        url: '/sofa-services',
        method: 'GET',
        params,
      }),
      providesTags: ['SofaService'],
    }),

    /** Fetch popular sofa cleaning services */
    getPopularSofaServices: builder.query({
      query: () => ({
        url: '/sofa-services/popular',
        method: 'GET',
      }),
      providesTags: ['SofaService'],
    }),

    /** Fetch sofa cleaning services by category */
    getSofaServicesByCategory: builder.query({
      query: (category) => ({
        url: `/sofa-services/category/${encodeURIComponent(category)}`,
        method: 'GET',
      }),
      providesTags: ['SofaService'],
    }),

    /** Fetch single sofa cleaning service by ID */
    getSofaServiceById: builder.query({
      query: (id) => ({
        url: `/sofa-services/${id}`,
        method: 'GET',
      }),
      providesTags: ['SofaService'],
    }),

    /* =====================================================
       SOFA BOOKINGS — Mutations
    ====================================================== */

    /**
     * Create a new sofa cleaning booking.
     * Body: SofaBookingCreateDTOs {
     *   serviceIds: number[],
     *   customerPhone: string,
     *   customerAddress: string,
     *   sofaType: string,
     *   sofaCount?: number,
     *   scheduledDate: string (ISO 8601),
     *   scheduledTime: string (e.g. "15:00"),
     *   specialInstructions?: string
     * }
     */
    createSofaBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/sofa-bookings',
        method: 'POST',
        body: bookingData,
      }),
      // Backend returns { success, message, data: { bookingId, id, status, ... } }
      transformResponse: (/** @type {any} */ response) => {
        console.log('📦 createSofaBooking raw response:', JSON.stringify(response, null, 2));
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
      invalidatesTags: ['SofaBooking'],
    }),

    /** Cancel a sofa booking by ID */
    cancelSofaBooking: builder.mutation({
      query: (id) => ({
        url: `/sofa-bookings/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['SofaBooking'],
    }),

    /** Update sofa booking status */
    updateSofaBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/sofa-bookings/${id}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['SofaBooking'],
    }),

    /* =====================================================
       SOFA BOOKINGS — Queries
    ====================================================== */

    /** Get current user's sofa bookings */
    getMySofaBookings: builder.query({
      query: () => ({
        url: '/sofa-bookings/my-bookings',
        method: 'GET',
      }),
      providesTags: ['SofaBooking'],
    }),

    /** Get a single sofa booking by ID */
    getSofaBookingById: builder.query({
      query: (id) => ({
        url: `/sofa-bookings/${id}`,
        method: 'GET',
      }),
      providesTags: ['SofaBooking'],
    }),
  }),

  overrideExisting: false,
});

/* =========================
   EXPORT HOOKS
========================== */
export const {
  // Queries
  useGetSofaServicesQuery,
  useGetPopularSofaServicesQuery,
  useGetSofaServicesByCategoryQuery,
  useGetSofaServiceByIdQuery,
  useGetMySofaBookingsQuery,
  useGetSofaBookingByIdQuery,

  // Mutations
  useCreateSofaBookingMutation,
  useCancelSofaBookingMutation,
  useUpdateSofaBookingStatusMutation,
} = sofaServiceApi;

export const sofaServiceEndpoints = sofaServiceApi.endpoints;
