import { baseApi } from '../base/baseApi';

/**
 * AC Service & Booking API Service (RTK Query)
 *
 * Endpoints:
 *  ACServices:
 *    GET  /api/ac-services              -> getAcServices(params: { Category?, IsPopular? })
 *    GET  /api/ac-services/popular      -> getPopularAcServices()
 *    GET  /api/ac-services/category/:c  -> getAcServicesByCategory(category)
 *    GET  /api/ac-services/:id          -> getAcServiceById(id)
 *
 *  ACBookings:
 *    POST /api/ac-bookings              -> createAcBooking(ACBookingCreateDTOs)
 *    GET  /api/ac-bookings/my-bookings  -> getMyAcBookings()
 *    GET  /api/ac-bookings/:id          -> getAcBookingById(id)
 *    POST /api/ac-bookings/:id/cancel   -> cancelAcBooking(id)
 *    POST /api/ac-bookings/:id/status   -> updateAcBookingStatus({ id, status })
 */
export const acServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =====================================================
       AC SERVICES — Queries
    ====================================================== */

    /** Fetch all AC services. Optional filter: Category (string), IsPopular (bool) */
    getAcServices: builder.query({
      query: (params = {}) => ({
        url: '/ac-services',
        method: 'GET',
        params,
      }),
      providesTags: ['ACService'],
    }),

    /** Fetch popular AC services */
    getPopularAcServices: builder.query({
      query: () => ({
        url: '/ac-services/popular',
        method: 'GET',
      }),
      providesTags: ['ACService'],
    }),

    /** Fetch AC services by category */
    getAcServicesByCategory: builder.query({
      query: (category) => ({
        url: `/ac-services/category/${encodeURIComponent(category)}`,
        method: 'GET',
      }),
      providesTags: ['ACService'],
    }),

    /** Fetch single AC service by ID */
    getAcServiceById: builder.query({
      query: (id) => ({
        url: `/ac-services/${id}`,
        method: 'GET',
      }),
      providesTags: ['ACService'],
    }),

    /* =====================================================
       AC BOOKINGS — Mutations
    ====================================================== */

    /**
     * Create a new AC booking.
     * Body: ACBookingCreateDTOs {
     *   serviceIds: number[],
     *   customerPhone: string,
     *   customerAddress: string,
     *   acType: string,
     *   acBrand?: string,
     *   acCapacity?: string,
     *   usageType?: string,
     *   scheduledDate: string (ISO 8601),
     *   scheduledTime: string (e.g. "15:00"),
     *   specialInstructions?: string
     * }
     */
    createAcBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/ac-bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['ACBooking'],
    }),

    /** Cancel an AC booking by ID */
    cancelAcBooking: builder.mutation({
      query: (id) => ({
        url: `/ac-bookings/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['ACBooking'],
    }),

    /** Update AC booking status */
    updateAcBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/ac-bookings/${id}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['ACBooking'],
    }),

    /* =====================================================
       AC BOOKINGS — Queries
    ====================================================== */

    /** Get current user's AC bookings */
    getMyAcBookings: builder.query({
      query: () => ({
        url: '/ac-bookings/my-bookings',
        method: 'GET',
      }),
      providesTags: ['ACBooking'],
    }),

    /** Get a single AC booking by ID */
    getAcBookingById: builder.query({
      query: (id) => ({
        url: `/ac-bookings/${id}`,
        method: 'GET',
      }),
      providesTags: ['ACBooking'],
    }),
  }),

  overrideExisting: false,
});

/* =========================
   EXPORT HOOKS
========================== */
export const {
  // Queries
  useGetAcServicesQuery,
  useGetPopularAcServicesQuery,
  useGetAcServicesByCategoryQuery,
  useGetAcServiceByIdQuery,
  useGetMyAcBookingsQuery,
  useGetAcBookingByIdQuery,

  // Mutations
  useCreateAcBookingMutation,
  useCancelAcBookingMutation,
  useUpdateAcBookingStatusMutation,
} = acServiceApi;

export const acServiceEndpoints = acServiceApi.endpoints;
