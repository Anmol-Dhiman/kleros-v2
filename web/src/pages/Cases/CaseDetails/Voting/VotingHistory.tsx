import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Skeleton from "react-loading-skeleton";
import { Tabs } from "@kleros/ui-components-library";
import { useVotingHistory } from "queries/useVotingHistory";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";
import { getLocalRounds } from "utils/getLocalRounds";
import { getDrawnJurorsWithCount } from "utils/getDrawnJurorsWithCount";
import VotesAccordion from "./VotesDetails";
import PendingVotesBox from "./PendingVotesBox";

const Container = styled.div``;

const StyledTabs = styled(Tabs)`
  width: 100%;
  margin-bottom: 16px;
`;

const StyledTitle = styled.h1`
  margin-bottom: ${responsiveSize(16, 32)};
`;

const VotingHistory: React.FC<{ arbitrable?: `0x${string}`; isQuestion: boolean }> = ({ arbitrable, isQuestion }) => {
  const { id } = useParams();
  const { data: votingHistory } = useVotingHistory(id);
  const { data: disputeData } = useDisputeDetailsQuery(id);
  const [currentTab, setCurrentTab] = useState(0);
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const rounds = votingHistory?.dispute?.rounds;

  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  //set current tab to latest round
  useEffect(() => setCurrentTab((rounds?.length && rounds?.length - 1) ?? 0), [rounds]);

  const answers = disputeTemplate?.answers;
  const drawnJurors = useMemo(
    () => getDrawnJurorsWithCount(votingHistory?.dispute?.rounds.at(currentTab)?.drawnJurors ?? []),
    [votingHistory, currentTab]
  );

  return (
    <Container>
      <StyledTitle>Voting History</StyledTitle>
      {rounds && localRounds && disputeTemplate ? (
        <>
          {isQuestion && disputeTemplate.question ? (
            <ReactMarkdown>{disputeTemplate.question}</ReactMarkdown>
          ) : (
            <ReactMarkdown>{"The dispute's template is not correct please vote refuse to arbitrate"}</ReactMarkdown>
          )}
          <StyledTabs
            currentValue={currentTab}
            items={rounds.map((_, i) => ({
              text: `Round ${i + 1}`,
              value: i,
            }))}
            callback={(i: number) => setCurrentTab(i)}
          />
          <PendingVotesBox
            current={localRounds.at(currentTab)?.totalVoted}
            total={rounds.at(currentTab)?.nbVotes}
            court={rounds.at(currentTab)?.court.name ?? ""}
          />
          <VotesAccordion
            drawnJurors={drawnJurors}
            period={disputeData?.dispute?.period}
            answers={answers}
            isActiveRound={localRounds?.length - 1 === currentTab}
          />
        </>
      ) : (
        <Skeleton height={140} />
      )}
    </Container>
  );
};

export default VotingHistory;
