import { ocmClient as client } from '../axiosClient';
import {
  AccessReviewResponse,
  FeatureReviewResponse,
  SelfAccessReview,
} from '@openshift-assisted/types/authorization-service';

export const AuthorizationApi = {
  makeBaseURI() {
    return '/api/authorizations/v1/';
  },

  async selfFeatureReview(featureId: string) {
    const response = await client?.post<FeatureReviewResponse>(
      `${AuthorizationApi.makeBaseURI()}/self_feature_review`,
      { feature: featureId },
    );
    return response?.data;
  },

  async selfAccessReview(params: SelfAccessReview) {
    const response = await client?.post<AccessReviewResponse>(
      `${AuthorizationApi.makeBaseURI()}/self_access_review`,
      params,
    );
    return response?.data;
  },
};
