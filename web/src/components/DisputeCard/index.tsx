import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { utils } from "ethers";
import Skeleton from "react-loading-skeleton";
import { Card } from "@kleros/ui-components-library";
import { Periods } from "consts/periods";
import { CasesPageQuery } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useGetMetaEvidence } from "queries/useGetMetaEvidence";
import DisputeInfo from "./DisputeInfo";
import PeriodBanner from "./PeriodBanner";

const StyledCard = styled(Card)`
  max-width: 380px;
  min-width: 312px;
  width: auto;
  height: 260px;
`;

const Container = styled.div`
  height: 215px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  h3 {
    margin: 0;
  }
`;

const getPeriodEndTimestamp = (lastPeriodChange: string, currentPeriodIndex: number, timesPerPeriod: string[]) => {
  const durationCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex]);
  return parseInt(lastPeriodChange) + durationCurrentPeriod;
};

const DisputeCard: React.FC<CasesPageQuery["disputes"][number]> = ({
  id,
  arbitrated,
  period,
  lastPeriodChange,
  court,
}) => {
  const currentPeriodIndex = Periods[period];
  const rewards = `≥ ${utils.formatEther(court.feeForJuror)} ETH`;
  const date =
    currentPeriodIndex === 4
      ? lastPeriodChange
      : getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, court.timesPerPeriod);
  const { data: metaEvidence } = useGetMetaEvidence(id, arbitrated.id);
  const title = metaEvidence ? metaEvidence.title : <Skeleton />;
  const { data: courtPolicy } = useCourtPolicy(court.id);
  const courtName = courtPolicy?.name;
  const category = metaEvidence ? metaEvidence.category : undefined;
  const navigate = useNavigate();
  return (
    <StyledCard hover onClick={() => navigate(`/cases/${id.toString()}/overview`)}>
      <PeriodBanner id={parseInt(id)} period={currentPeriodIndex} />
      <Container>
        <h3>{title}</h3>
        <DisputeInfo
          courtId={court?.id}
          court={courtName}
          period={currentPeriodIndex}
          {...{ category, rewards, date }}
        />
      </Container>
    </StyledCard>
  );
};

export default DisputeCard;
