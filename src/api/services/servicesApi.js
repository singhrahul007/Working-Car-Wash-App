import { baseApi } from '../base/baseApi';

/**
 * General Services & Bookings API (RTK Query)
 *
 * Services:
 *   GET  /api/services/preview       -> getServicesPreview()
 *   GET  /api/services               -> getServices(category?)
 *   GET  /api/services/popular       -> getPopularServices()
 *   GET  /api/services/:id           -> getServiceById(id)
 *   GET  /api/services/:id/availability -> getServiceAvailability({id, date})
 *
 * Bookings:
 *   POST /api/bookings               -> createBooking(Booking)
 *   GET  /api/bookings/recent        -> getRecentBookings()
 */
export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ─── Services ─────────────────────────────────────────────────── */

    getServicesPreview: builder.query({
      query: () => ({ url: '/services/preview', method: 'GET' }),
      providesTags: ['Service'],
    }),

    getServices: builder.query({
      query: (category) => ({
        url: '/services',
        method: 'GET',
        params: category ? { category } : {},
      }),
      providesTags: ['Service'],
    }),

    getPopularServices: builder.query({
      query: () => ({ url: '/services/popular', method: 'GET' }),
      providesTags: ['Service'],
    }),

    getServiceById: builder.query({
      query: (id) => ({ url: `/services/${id}`, method: 'GET' }),
      providesTags: ['Service'],
    }),

    getServiceAvailability: builder.query({
      query: ({ id, date }) => ({
        url: `/services/${id}/availability`,
        method: 'GET',
        params: date ? { date } : {},
      }),
    }),

    /* ─── Bookings ──────────────────────────────────────────────────── */

    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),

    getRecentBookings: builder.query({
      query: () => ({ url: '/bookings/recent', method: 'GET' }),
      providesTags: ['Booking'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetServicesPreviewQuery,
  useGetServicesQuery,
  useGetPopularServicesQuery,
  useGetServiceByIdQuery,
  useGetServiceAvailabilityQuery,
  useCreateBookingMutation,
  useGetRecentBookingsQuery,
} = servicesApi;
