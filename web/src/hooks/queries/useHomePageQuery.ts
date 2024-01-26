import { graphql } from "src/graphql";
import { HomePageQuery } from "src/graphql/graphql";
import { useQuery } from "@tanstack/react-query";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
export type { HomePageQuery };

const homePageQuery = graphql(`
  query HomePage($timeframe: ID) {
    disputes(first: 3) {
      id
    }
    counters(where: { id_gt: $timeframe }) {
      id
      stakedPNK
      paidETH
      redistributedPNK
      activeJurors
      cases
    }
  }
`);

export const useHomePageQuery = (timeframe: number) => {
  const isEnabled = timeframe !== undefined;
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery({
    queryKey: [`homePageQuery${timeframe}`],
    enabled: isEnabled,
    queryFn: async () =>
      await graphqlBatcher.fetch({ document: homePageQuery, variables: { timeframe: timeframe.toString() } }),
  });
};
