import { baseApi } from '../base/baseApi';

/**
 * Offers API (RTK Query)
 *
 *   GET  /api/Offers                 -> getOffers(category?)
 *   GET  /api/Offers/expiring-soon   -> getExpiringSoonOffers()
 *   GET  /api/Offers/:code           -> getOfferByCode(code)
 *   POST /api/Offers/validate        -> validateOffer({ offerCode, cartAmount, serviceCategories? })
 */
export const offersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getOffers: builder.query({
      query: (category) => ({
        url: '/Offers',
        method: 'GET',
        params: category ? { category } : {},
      }),
      providesTags: ['Offer'],
    }),

    getExpiringSoonOffers: builder.query({
      query: () => ({ url: '/Offers/expiring-soon', method: 'GET' }),
      providesTags: ['Offer'],
    }),

    getOfferByCode: builder.query({
      query: (code) => ({ url: `/Offers/${code}`, method: 'GET' }),
    }),

    validateOffer: builder.mutation({
      query: ({ offerCode, cartAmount, serviceCategories }) => ({
        url: '/Offers/validate',
        method: 'POST',
        body: { offerCode, cartAmount, serviceCategories: serviceCategories || [] },
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetOffersQuery,
  useGetExpiringSoonOffersQuery,
  useGetOfferByCodeQuery,
  useLazyGetOfferByCodeQuery,
  useValidateOfferMutation,
} = offersApi;
