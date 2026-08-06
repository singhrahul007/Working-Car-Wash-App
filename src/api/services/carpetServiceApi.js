import { baseApi } from '../base/baseApi';

/**
 * Carpet Cleaning Service & Booking API Service (RTK Query)
 *
 * Endpoints:
 *  CarpetServices:
 *    GET  /api/carpet-services              -> getCarpetServices(params: { Category?, IsPopular? })
 *    GET  /api/carpet-services/popular      -> getPopularCarpetServices()
 *    GET  /api/carpet-services/category/:c  -> getCarpetServicesByCategory(category)
 *    GET  /api/carpet-services/:id          -> getCarpetServiceById(id)
 *
 *  CarpetBookings:
 *    POST /api/carpet-bookings              -> createCarpetBooking(CarpetBookingCreateDTOs)
 *    GET  /api/carpet-bookings/my-bookings  -> getMyCarpetBookings()
 *    GET  /api/carpet-bookings/:id          -> getCarpetBookingById(id)
 *    POST /api/carpet-bookings/:id/cancel   -> cancelCarpetBooking(id)
 *    POST /api/carpet-bookings/:id/status   -> updateCarpetBookingStatus({ id, status })
 */
export const carpetServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =====================================================
       CARPET SERVICES — Queries
    ====================================================== */

    /** Fetch all carpet cleaning services. Optional filter: Category (string), IsPopular (bool) */
    getCarpetServices: builder.query({
      query: (params = {}) => ({
        url: '/carpet-services',
        method: 'GET',
        params,
      }),
      providesTags: ['CarpetService'],
    }),

    /** Fetch popular carpet cleaning services */
    getPopularCarpetServices: builder.query({
      query: () => ({
        url: '/carpet-services/popular',
        method: 'GET',
      }),
      providesTags: ['CarpetService'],
    }),

    /** Fetch carpet cleaning services by category */
    getCarpetServicesByCategory: builder.query({
      query: (category) => ({
        url: `/carpet-services/category/${encodeURIComponent(category)}`,
        method: 'GET',
      }),
      providesTags: ['CarpetService'],
    }),

    /** Fetch single carpet cleaning service by ID */
    getCarpetServiceById: builder.query({
      query: (id) => ({
        url: `/carpet-services/${id}`,
        method: 'GET',
      }),
      providesTags: ['CarpetService'],
    }),

    /* =====================================================
       CARPET BOOKINGS — Mutations
    ====================================================== */

    /**
     * Create a new carpet cleaning booking.
     * Body: CarpetBookingCreateDTOs {
     *   serviceIds: number[],
     *   customerPhone: string,
     *   customerAddress: string,
     *   carpetType: string,
     *   carpetSize?: string,
     *   carpetCount?: number,
     *   scheduledDate: string (ISO 8601),
     *   scheduledTime: string (e.g. "15:00"),
     *   specialInstructions?: string
     * }
     */
    createCarpetBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/carpet-bookings',
        method: 'POST',
        body: bookingData,
      }),
      // Backend returns { success, message, data: { bookingId, id, status, ... } }
      transformResponse: (/** @type {any} */ response) => {
        console.log('📦 createCarpetBooking raw response:', JSON.stringify(response, null, 2));
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
      invalidatesTags: ['CarpetBooking'],
    }),

    /** Cancel a carpet booking by ID */
    cancelCarpetBooking: builder.mutation({
      query: (id) => ({
        url: `/carpet-bookings/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['CarpetBooking'],
    }),

    /** Update carpet booking status */
    updateCarpetBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/carpet-bookings/${id}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['CarpetBooking'],
    }),

    /* =====================================================
       CARPET BOOKINGS — Queries
    ====================================================== */

    /** Get current user's carpet bookings */
    getMyCarpetBookings: builder.query({
      query: () => ({
        url: '/carpet-bookings/my-bookings',
        method: 'GET',
      }),
      providesTags: ['CarpetBooking'],
    }),

    /** Get a single carpet booking by ID */
    getCarpetBookingById: builder.query({
      query: (id) => ({
        url: `/carpet-bookings/${id}`,
        method: 'GET',
      }),
      providesTags: ['CarpetBooking'],
    }),
  }),

  overrideExisting: false,
});

/* =========================
   EXPORT HOOKS
========================== */
export const {
  // Queries
  useGetCarpetServicesQuery,
  useGetPopularCarpetServicesQuery,
  useGetCarpetServicesByCategoryQuery,
  useGetCarpetServiceByIdQuery,
  useGetMyCarpetBookingsQuery,
  useGetCarpetBookingByIdQuery,

  // Mutations
  useCreateCarpetBookingMutation,
  useCancelCarpetBookingMutation,
  useUpdateCarpetBookingStatusMutation,
} = carpetServiceApi;

export const carpetServiceEndpoints = carpetServiceApi.endpoints;
