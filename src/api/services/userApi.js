import { baseApi } from '../base/baseApi';

/**
 * User / Profile API (RTK Query)
 *
 * Profile:
 *   GET  /api/Users/profile           -> getUserProfile()
 *   PUT  /api/Users/profile           -> updateUserProfile(UpdateProfileDto)
 *   POST /api/Users/change-password   -> changePassword({ currentPassword, newPassword, confirmPassword })
 *   GET  /api/Auth/profile            -> getAuthProfile()
 *   PUT  /api/Auth/profile            -> updateAuthProfile(UpdateProfileRequest)
 *   POST /api/Auth/upload-profile-picture -> uploadProfilePicture(FormData)
 *
 * Addresses:
 *   GET  /api/Users/addresses                      -> getAddresses()
 *   POST /api/Users/addresses                      -> addAddress(AddressCreateDto)
 *   PUT  /api/Users/addresses/:id                  -> updateAddress({ id, ...AddressCreateDto })
 *   DELETE /api/Users/addresses/:id                -> deleteAddress(id)
 *   POST /api/Users/addresses/:id/set-default      -> setDefaultAddress(id)
 */
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ─── Profile ──────────────────────────────────────────────────── */

    getUserProfile: builder.query({
      query: () => ({ url: '/Users/profile', method: 'GET' }),
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/Users/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword, confirmPassword }) => ({
        url: '/Users/change-password',
        method: 'POST',
        body: { currentPassword, newPassword, confirmPassword },
      }),
    }),

    /** Auth/profile — alternative profile endpoint */
    getAuthProfile: builder.query({
      query: () => ({ url: '/Auth/profile', method: 'GET' }),
      providesTags: ['User'],
    }),

    updateAuthProfile: builder.mutation({
      query: (data) => ({
        url: '/Auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    uploadProfilePicture: builder.mutation({
      query: (formData) => ({
        url: '/Auth/upload-profile-picture',
        method: 'POST',
        body: formData,
        // Don't set Content-Type — let the browser/RN set multipart boundary
        headers: { 'Content-Type': undefined },
      }),
      invalidatesTags: ['User'],
    }),

    /* ─── Addresses ────────────────────────────────────────────────── */

    getAddresses: builder.query({
      query: () => ({ url: '/Users/addresses', method: 'GET' }),
      providesTags: ['Address'],
    }),

    addAddress: builder.mutation({
      query: (addressData) => ({
        url: '/Users/addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['Address'],
    }),

    updateAddress: builder.mutation({
      query: ({ addressId, ...addressData }) => ({
        url: `/Users/addresses/${addressId}`,
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: ['Address'],
    }),

    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/Users/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

    setDefaultAddress: builder.mutation({
      query: (addressId) => ({
        url: `/Users/addresses/${addressId}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: ['Address'],
    }),
  }),

  overrideExisting: false,
});

export const {
  // Profile
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetAuthProfileQuery,
  useUpdateAuthProfileMutation,
  useUploadProfilePictureMutation,
  // Addresses
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = userApi;
